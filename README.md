# Rails: P2P Crypto to Fiat Swaps

## What is Rails?
Rails is a peer-to-peer solution for swapping between fiat money and cryptocurrencies. By using an open banking API and an escrow smart contract, the buyer of a cryptocurrency in a trade no longer needs to trust that the funds will be released by the seller after a payment. It allows users to onboard directly in to decentralised finance (DeFi) protocols without the need of a centrailised exchange.

## How does it work?
1. Alice wants to sell 100 USDC for £70. a cryptocurrency pegged to the US Dollar.
2. Bob wants to buy 100 USDC and is willing to pay £70 for it.
3.  Alice sends her 100 USDC to an escrow smart contract which locks the funds until the trade is complete.
4. Bob authorises an Open Banking API to make a payment of £70 to Alice's bank
5. Alice authorises an Open Banking API to access their bank account transaction information.
6. The Open Banking API verifies that Bob's payment has reached Alice's account and send a cryptographic signature to Bob.
7. Bob sends a transaction to the escrow smart contract that includes this signature which releases the 100 USDC to Bob's cryptocurrency wallet.

## Technologies Used
- **Open Banking API** - Yapily
- **App API** - Cloudflare Workers
- **PWA** - Vue.js and Tailwind CSS
- **Escrow Contract** - Solidity on Ethereum Testnet


