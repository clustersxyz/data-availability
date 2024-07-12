import { fundNode, queryData, uploadData } from './api';

export const ClustersDA = class {
  rpcProvider: string;
  privateKey: string;

  constructor(obj: { rpcProvider: string; privateKey: string }) {
    this.rpcProvider = obj.rpcProvider;
    this.privateKey = obj.privateKey;
  }

  fund = async (amount: number) => {
    try {
      await fundNode(this.rpcProvider, this.privateKey, amount);
    } catch (error) {
      throw new Error(`Error funding Irys node: ${error}`);
    }
  };

  upload = async (data: string) => {
    try {
      await uploadData(this.rpcProvider, this.privateKey, data);
    } catch (error) {
      throw new Error(`Error uploading data to Irys: ${error}`);
    }
  };

  query = async (addresses: string[]) => {
    try {
      await queryData(addresses);
    } catch (error) {
      throw new Error(`Error querying data from Irys: ${error}`);
    }
  };
};
