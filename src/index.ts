import {
  checkConfirmation,
  fetchData,
  fetchEvents,
  getAddressFromKey,
  resumeUpload,
  retrieveLastUpload,
  updateManifest,
  uploadData,
  writeManifest,
} from './api';
import { EventQueryFilter, EventResponse, Event } from '@clustersxyz/sdk/types/event';
import { ApiConfig } from 'arweave/node/lib/api';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { UploadReceipt, ManifestData } from './types';


export const ClustersDA = class {
  apiKey: string | undefined = undefined;
  manifestUploader: JWKInterface | string | undefined = undefined;
  eventUploader: JWKInterface | undefined = undefined;
  arweaveRpc: ApiConfig = { host: 'arweave.net', port: 443, protocol: 'https' };

  constructor(obj?: {
    apiKey?: string;
    manifestUploader?: JWKInterface | string;
    eventUploader?: JWKInterface;
    arweaveRpc?: ApiConfig;
  }) {
    if (obj?.apiKey) this.apiKey = obj.apiKey;
    if (obj?.manifestUploader) this.manifestUploader = obj.manifestUploader;
    if (obj?.eventUploader) this.eventUploader = obj.eventUploader;
    if (obj?.arweaveRpc) this.arweaveRpc = obj.arweaveRpc;
  }

  getEvents = async (filter?: EventQueryFilter): Promise<EventResponse> => {
    try {
      return await fetchEvents(this.apiKey, filter);
    } catch (error) {
      throw new Error(`Error retrieving events: ${error}`);
    }
  };

  getCurrentManifest = async (): Promise<ManifestData[]> => {
    try {
      if (this.manifestUploader === undefined) throw new Error('No manifest uploader address or key was provided.');
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');

      const manifestId = await retrieveLastUpload(
        this.arweaveRpc,
        typeof this.manifestUploader === 'string'
          ? this.manifestUploader
          : await getAddressFromKey(this.arweaveRpc, this.manifestUploader),
      );
      const manifest = await fetchData(this.arweaveRpc, [manifestId]);
      if (!Array.isArray(manifest[0]) || manifest[0].length === 0 || !('id' in manifest[0][0])) {
        throw new Error('Invalid manifest data retrieved');
      }
      return manifest[0] as ManifestData[];
    } catch (error) {
      throw new Error(`Error retrieving manifest from Arweave: ${error}`);
    }
  };

  pushToManifest = async (data: UploadReceipt[], init?: boolean): Promise<UploadReceipt> => {
    try {
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');
      if (this.manifestUploader === undefined || typeof this.manifestUploader === 'string')
        throw new Error('No manifest uploader key was provided.');

      let upload: UploadReceipt;

      if (init) {
        upload = await writeManifest(this.arweaveRpc, this.manifestUploader, data);
      } else {
        const manifestUploaderAddress = await getAddressFromKey(this.arweaveRpc, this.manifestUploader);
        const manifestId = await retrieveLastUpload(this.arweaveRpc, manifestUploaderAddress);
        if (manifestId === '') {
          upload = await writeManifest(this.arweaveRpc, this.manifestUploader, data);
        } else {
          upload = await updateManifest(this.arweaveRpc, this.manifestUploader, data, manifestId);
        }
      }

      if (!upload.isComplete) throw new Error(`Updating manifest failed: ${JSON.stringify(upload)}`);
      return upload;
    } catch (error) {
      throw new Error(`Error adding data to manifest: ${error}`);
    }
  };

  queryData = async (startTimestamp?: number, endTimestamp?: number): Promise<Event[]> => {
    try {
      if (this.manifestUploader === undefined) throw new Error('No manifest uploader address or key was provided.');
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');

      const manifestId = await retrieveLastUpload(
        this.arweaveRpc,
        typeof this.manifestUploader === 'string'
          ? this.manifestUploader
          : await getAddressFromKey(this.arweaveRpc, this.manifestUploader),
      );
      if (startTimestamp === undefined) startTimestamp = 0;
      if (endTimestamp === undefined) endTimestamp = Number.MAX_SAFE_INTEGER;

      const data = await fetchData(this.arweaveRpc, [manifestId], startTimestamp, endTimestamp);
      // Flatten the array and filter out any ManifestData
      const events: Event[] = data.flat().filter((item): item is Event => 'eventType' in item);
      return events;
    } catch (error) {
      throw new Error(`Error querying data: ${error}`);
    }
  };

  getFileIds = async (ids: string[]): Promise<(Event[] | ManifestData[])[]> => {
    try {
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');

      const data = await fetchData(this.arweaveRpc, ids);
      return data;
    } catch (error) {
      throw new Error(`Error retrieving file data for ${ids}: ${error}`);
    }
  };

  uploadEvents = async (events: EventResponse | Event[]): Promise<UploadReceipt> => {
    try {
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');
      if (this.eventUploader === undefined) throw new Error('No manifest uploader key was provided.');

      const upload = await uploadData(this.arweaveRpc, this.eventUploader, events);
      if (!upload.isComplete) throw new Error(`Uploading events to Arweave failed: ${upload}`);
      return upload;
    } catch (error) {
      throw new Error(`Error pushing events to Arweave: ${error}`);
    }
  };

  resumeEventUpload = async (receipt: UploadReceipt): Promise<UploadReceipt> => {
    try {
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');

      const upload = await resumeUpload(this.arweaveRpc, receipt);
      if (!upload.isComplete) throw new Error(`Uploading events to Arweave failed: ${upload}`);
      return upload;
    } catch (error) {
      throw new Error(`Error resuming upload to Arweave: ${error}`);
    }
  };

  waitForConfirmation = async (id: string, retries: number = 30, interval: number = 30000) => {
    let retry = 0;
    let status = false;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (status == false && retry < retries) {
      try {
        status = await checkConfirmation(this.arweaveRpc, id);
        if (status !== true) {
          retry++;
          await sleep(interval);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        retry++;
        await sleep(interval);
      }
    }

    if (retry === retries) throw new Error(`Confirmation for Arweave TXID ${id} timed out`);
  };
};
