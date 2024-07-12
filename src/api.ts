import Irys from '@irys/sdk';

const getIrys = async (rpc: string, key: string) => {
  const network = 'devnet';
  // Devnet RPC URLs change often, use a recent one from https://chainlist.org/
  const providerUrl = rpc;
  const token = 'ethereum';

  const irys = new Irys({
    network, // "mainnet" or "devnet"
    token, // Token used for payment
    key: key, // ETH or SOL private key
    config: { providerUrl }, // Optional provider URL, only required when using Devnet
  });
  return irys;
};

export const fundNode = async (rpc: string, key: string, amount: number) => {
  const irys = await getIrys(rpc, key);
  try {
    const fundTx = await irys.fund(irys.utils.toAtomic(amount));
    console.log(`Successfully funded ${irys.utils.fromAtomic(fundTx.quantity)} ${irys.token}`);
  } catch (error) {
    console.log(`Funding error: ${error}`);
  }
};

export const uploadData = async (rpc: string, key: string, data: string) => {
  const irys = await getIrys(rpc, key);
  try {
    const receipt = await irys.upload(data);
    console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
  } catch (error) {
    console.log(`Error uploading data: ${error}`);
  }
};
