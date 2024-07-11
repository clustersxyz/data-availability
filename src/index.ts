import { fetchBlobs } from './api';
import { CelestiaRpc, CelestiaBlob, BlobData } from './types';

export const ClustersDA = class {
  celestiaRpc: CelestiaRpc;

  constructor(obj: { celestiaRpc: CelestiaRpc }) {
    this.celestiaRpc = obj.celestiaRpc;
  }

  getUpdates = async (blob: CelestiaBlob): Promise<BlobData[] | null> => {
    try {
      return await fetchBlobs(this.celestiaRpc, blob);
    } catch (error) {
      return null;
    }
  };

  getUpdatesRange = async (blob: CelestiaBlob, limit: number): Promise<BlobData[] | null> => {
    try {
      let blobs: BlobData[] = [];
      for (let i = 0; i <= limit; i++) {
        const currentBlob = { ...blob, height: blob.height + i };
        const update = await fetchBlobs(this.celestiaRpc, currentBlob);
        if (update && update.length > 0) {
          blobs = blobs.concat(update);
        } else console.log(`Blob height ${currentBlob.height} is null.`);
      }
      return blobs.length > 0 ? blobs : null;
    } catch (error) {
      console.error('Error in getUpdatesRange:', error);
      return null;
    }
  };
};
