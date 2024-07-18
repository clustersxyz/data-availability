import { fetchBlobs } from './api';
import { CelestiaRpc, CelestiaBlob, BlobData } from './types';

export const ClustersDA = class {
  celestiaRpc: CelestiaRpc;

  constructor(obj: { celestiaRpc: CelestiaRpc }) {
    this.celestiaRpc = obj.celestiaRpc;
  }

  getUpdates = async (blob: CelestiaBlob): Promise<BlobData[] | null> => {
    try {
      const [result] = await fetchBlobs(this.celestiaRpc, [blob]);
      return result;
    } catch (error) {
      console.error('Error in getUpdates:', error);
      return null;
    }
  };

  getUpdatesRange = async (blob: CelestiaBlob, limit: number): Promise<BlobData[] | null> => {
    try {
      const blobsToFetch: CelestiaBlob[] = [];
      for (let i = 0; i <= limit; i++) {
        blobsToFetch.push({ ...blob, height: blob.height + i });
      }

      const batchResults = await fetchBlobs(this.celestiaRpc, blobsToFetch);

      let blobs: BlobData[] = [];
      batchResults.forEach((result, index) => {
        if (result && result.length > 0) {
          blobs.push(...result);
        } else {
          console.log(`Blob height ${blobsToFetch[index].height} is null.`);
        }
      });

      return blobs.length > 0 ? blobs : null;
    } catch (error) {
      console.error('Error in getUpdatesRange:', error);
      return null;
    }
  };
};
