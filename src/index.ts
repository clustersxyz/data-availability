import { fetchBlobs } from './api';
import { CelestiaRpc, CelestiaBlob, BlobData } from './types';

export const ClustersDA = class {
  celestiaRpc: CelestiaRpc;

  constructor(obj: { celestiaRpc: CelestiaRpc }) {
    this.celestiaRpc = obj.celestiaRpc;
  }

  getBlobs = async (blob: CelestiaBlob): Promise<BlobData[] | null> => {
    try {
      return await fetchBlobs(this.celestiaRpc, blob);
    } catch (error) {
      return null;
    }
  };
};
