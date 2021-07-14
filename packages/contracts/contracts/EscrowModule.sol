// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./Enum.sol";
import "./SignatureDecoder.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

interface GnosisSafe {
    /// @dev Allows a Module to execute a Safe transaction without any further confirmations.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(address to, uint256 value, bytes calldata data, Enum.Operation operation)
        external
        returns (bool success);
}

contract EscrowModule is SignatureDecoder, SignatureChecker {
  
    string public constant NAME = "Escrow Module";
    string public constant VERSION = "0.1.0";

    bytes32 public constant DOMAIN_SEPARATOR_TYPEHASH = 0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218;
    // keccak256(
    //     "EIP712Domain(uint256 chainId,address verifyingContract)"
    // );

    bytes32 public constant SWAP_CREATE_TYPEHASH = 0x80b006280932094e7cc965863eb5118dc07e5d272c6670c4a7c87299e04fceeb;
    // keccak256(
    //     "SwapTransfer(address safe,address token,uint96 amount,address paymentToken,uint96 payment,uint16 nonce)"
    // );

    bytes32 public constant SWAP_TRANSFER_TYPEHASH = 0x80b006280932094e7cc965863eb5118dc07e5d272c6670c4a7c87299e04fceeb;
    // keccak256(
    //     "SwapTransfer(address safe,address token,uint96 amount,address paymentToken,uint96 payment,uint16 nonce)"
    // );

    uint32 internal constant MIN_ACTUAL_TIMESTAMP = 1000000000;

    /// @dev lock time limits for pool's assets, after which unreleased escrows can be returned
    uint32 internal constant MIN_SWAP_LOCK_TIME_S = 24 hours;
    uint32 internal constant MAX_SWAP_LOCK_TIME_S = 30 days;

    // Safe -> Delegate -> Allowance
    mapping(address => mapping (address => mapping(address => Swap))) public swaps;
    // Safe -> Delegate -> Tokens
    mapping(address => mapping (address => address[])) public tokens;
    // Safe -> Delegates double linked list entry points
    mapping(address => uint48) public delegatesStart;
    // Safe -> Delegates double linked list
    mapping(address => mapping (uint48 => Delegate)) public delegates;

    // We use a double linked list for the delegates. The id is the first 6 bytes. 
    // To double check the address in case of collision, the address is part of the struct.
    struct Delegate {
        address delegate;
        uint48 prev;
        uint48 next;
    }

    // The allowance info is optimized to fit into one word of storage.
    struct Swap {
        uint96 amount;
        uint96 spent;
        uint16 resetTimeMin; // Maximum reset time span is 65k minutes
        uint32 lastResetMin;
        uint16 nonce;
    }

    event AddDelegate(address indexed safe, address delegate);
    event RemoveDelegate(address indexed safe, address delegate);
    event ExecuteAllowanceTransfer(address indexed safe, address delegate, address token, address to, uint96 value, uint16 nonce);
    event PayAllowanceTransfer(address indexed safe, address delegate, address paymentToken, address paymentReceiver, uint96 payment);
    event SetAllowance(address indexed safe, address delegate, address token, uint96 allowanceAmount, uint16 resetTime);
    event ResetAllowance(address indexed safe, address delegate, address token);
    event DeleteAllowance(address indexed safe, address delegate, address token);

    event Created(bytes32 indexed swapHash);
    event Released(bytes32 indexed swapHash);
    event PoolReleased(bytes32 indexed swapHash);
    event Returned(bytes32 indexed swapHash);
    event PoolReturned(bytes32 indexed swapHash);

    /**
     * Swap creation, called by the Ramp Network. Checks swap parameters and ensures the crypto
     * asset is locked on this contract.
     *
     * Emits a `Created` event with the swap hash.
     */
    function create(
        address _receiver,
        address _oracle,
        address _token,
        bytes32 _paymentDetailsHash,
        uint32 lockTimeS,
        bytes memory _signatures
    )
        external
        statusAtLeast(Status.ACTIVE)
        onlySwapCreator()
        isOracle(_oracle)
        checkAssetTypeAndData(_assetData, _pool)
        returns
        (bool success)
    {
        require(
            lockTimeS >= MIN_SWAP_LOCK_TIME_S && lockTimeS <= MAX_SWAP_LOCK_TIME_S,
            "ltl"  // "lock time outside limits"
        );
        bytes32 swapHash = getSwapHash(
            _pool, _receiver, _oracle, keccak256(_assetData), _paymentDetailsHash
        );
        requireSwapNotExists(swapHash);
        // Set up swap status before transfer, to avoid reentrancy attacks.
        // Even if a malicious token is somehow passed to this function (despite the oracle
        // signature of its details), the state of this contract is already fully updated,
        // so it will behave correctly (as it would be a separate call).
        // solhint-disable-next-line not-rely-on-time
        swaps[swapHash] = uint32(block.timestamp) + lockTimeS;
        require(
            lockAssetWithFee(_assetData, _pool),
            "elf"  // "escrow lock failed"
        );
        emit Created(swapHash);
        return true;
    }

        /**
     * Swap release, which transfers the crypto asset to the receiver and removes the swap from
     * the active swap mapping. Normally called by the swap's oracle after it confirms a matching
     * wire transfer on pool's bank account. Can be also called by the pool, for example in case
     * of a dispute, when the parties reach an agreement off-chain.
     *
     * Emits a `Released` or `PoolReleased` event with the swap's hash.
     */
    function release(
        address _safe,
        address payable _receiver,
        address _oracle,
        address _token,
        bytes memory _signature
    ) external statusAtLeast(Status.FINALIZE_ONLY) onlyOracleOrPool(_pool, _oracle) {
        bytes32 swapHash = getSwapHash(
            _pool, _receiver, _oracle, keccak256(_assetData), _paymentDetailsHash
        );
        requireSwapCreated(swapHash);
        // Delete the swap status before transfer, to avoid reentrancy attacks.
        swaps[swapHash] = 0;
        require(
            sendAssetKeepingFee(_assetData, _receiver),
            "arf"  // "asset release failed"
        );
        if (msg.sender == _pool) {
            emit PoolReleased(swapHash);
        } else {
            emit Released(swapHash);
        }
    }

    /// @dev Returns the chain id used by this contract.
    function getChainId() public pure returns (uint256) {
        uint256 id;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            id := chainid()
        }
        return id;
    }

        /// @dev Generates the data for the transfer hash (required for signing)
    function generateSwapHashData(
        address safe,
        address token,
        address to,
        uint96 amount,
        address paymentToken,
        uint96 payment,
        uint16 nonce
    ) private view returns (bytes memory) {
        uint256 chainId = getChainId();
        bytes32 domainSeparator = keccak256(abi.encode(DOMAIN_SEPARATOR_TYPEHASH, chainId, this));
        bytes32 swapHash = keccak256(
            abi.encode(ALLOWANCE_TRANSFER_TYPEHASH, safe, token, to, amount, paymentToken, payment, nonce)
        );
        return abi.encodePacked(byte(0x19), byte(0x01), domainSeparator, swapHash);
    }

    /// @dev Generates the transfer hash that should be signed to authorize a transfer
    function generateSwapHash(
        address safe,
        address token,
        address to,
        uint96 amount,
        address paymentToken,
        uint96 payment,
        uint16 nonce
    ) public view returns (bytes32) {
        return keccak256(generateSwapHashData(
            safe, token, to, amount, paymentToken, payment, nonce
        ));
    }

    function checkSignature(address expectedDelegate, bytes memory signature, bytes memory transferHashData, GnosisSafe safe) private view {
        require(
            isValidSignatureNow(expectedDelegate, transferHashData, signature) && delegates[address(safe)][uint48(expectedDelegate)].delegate == expectedDelegate,
            "expectedDelegate == signer && delegates[address(safe)][uint48(signer)].delegate == signer"
        );
    }

    // We use the same format as used for the Safe contract, except that we only support exactly 1 signature and no contract signatures.
    function recoverSignature(bytes memory signature, bytes memory transferHashData) private view returns (address owner) {
     
    }

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public virtual override {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp <= deadline, "ERC20Permit: expired deadline");

        bytes32 structHash = keccak256(
            abi.encode(
                _PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                _useNonce(owner),
                deadline
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == owner, "ERC20Permit: invalid signature");

        _approve(owner, spender, value);
    }

        /**
     * @dev "Consume a nonce": return the current value and increment.
     *
     * _Available since v4.1._
     */
    function _useNonce(address owner) internal virtual returns (uint256 current) {
        Counters.Counter storage nonce = _nonces[owner];
        current = nonce.current();
        nonce.increment();
    }
}