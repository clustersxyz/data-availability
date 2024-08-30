import {
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
import { UploadReceipt } from './types';

export const ClustersDA = class {
  apiKey: string | undefined = undefined;
  manifestUploader: JWKInterface | string | undefined = undefined;
  eventUploader: JWKInterface | undefined = undefined;
  arweaveRpc: ApiConfig | undefined = { host: 'arweave.net', port: 443, protocol: 'https' };

  constructor(obj?: {
    apiKey?: string;
    manifestUploader?: JWKInterface | string;
    eventUploader?: JWKInterface;
    arweaveRpc?: ApiConfig;
  }) {
    this.apiKey = obj?.apiKey;
    this.manifestUploader = obj?.manifestUploader;
    this.eventUploader = obj?.eventUploader;
    this.arweaveRpc = obj?.arweaveRpc;
  }

  getEvents = async (filter?: EventQueryFilter): Promise<EventResponse> => {
    try {
      return await fetchEvents(this.apiKey, filter);
    } catch (error) {
      throw new Error(`Error retrieving events: ${error}`);
    }
  };

  getCurrentManifest = async (): Promise<string[]> => {
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
      return manifest[0] as string[];
    } catch (error) {
      throw new Error(`Error retrieving manifest from Arweave: ${error}`);
    }
  };

  pushToManifest = async (ids: string[]): Promise<UploadReceipt> => {
    try {
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');
      if (this.manifestUploader === undefined || typeof this.manifestUploader === 'string')
        throw new Error('No manifest uploader key was provided.');

      const manifestUploaderAddress = await getAddressFromKey(this.arweaveRpc, this.manifestUploader);
      const manifest = await retrieveLastUpload(this.arweaveRpc, manifestUploaderAddress);

      let upload: UploadReceipt;
      if (manifest == '') upload = await writeManifest(this.arweaveRpc, this.manifestUploader, ids);
      else upload = await updateManifest(this.arweaveRpc, this.manifestUploader, manifest, ids);

      if (!upload.isComplete) throw new Error(`Updating manifest failed: ${upload}`);
      return upload;
    } catch (error) {
      throw new Error(`Error adding ${ids} to manifest: ${error}`);
    }
  };

  getFileIds = async (ids: string[]): Promise<Event[][]> => {
    try {
      if (this.arweaveRpc === undefined) throw new Error('No Arweave RPC config was provided.');

      const data = await fetchData(this.arweaveRpc, ids);
      return data as Event[][];
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
};
