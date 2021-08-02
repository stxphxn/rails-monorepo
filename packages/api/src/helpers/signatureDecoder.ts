import ethers from 'ethers';


export const verifySignature = async (address: string, encoded: string, signature: string): Promise<boolean> => {
  const recovered = ethers.utils.verifyMessage(encoded, signature);
  return recovered === address;
};