import { convertEventsToDataArrays, fetchEvents, writeData } from './api';
import { EventQueryFilter, EventResponse, Event } from '@clustersxyz/sdk/types/event';
import { UploadReceipt, V1EventData } from './types';

export const ClustersDA = class {
  apiKey: string | undefined = undefined;
  rpcUrl: string | undefined = undefined;
  privateKey: string | undefined = undefined;

  constructor(obj?: { apiKey?: string; rpcUrl?: string; privateKey?: string }) {
    this.apiKey = obj?.apiKey;
    this.rpcUrl = obj?.rpcUrl;
    this.privateKey = obj?.privateKey;
  }

  getEvents = async (filter?: EventQueryFilter): Promise<EventResponse> => {
    try {
      return await fetchEvents(this.apiKey, filter);
    } catch (error) {
      throw new Error(`Error retrieving events: ${error}`);
    }
  };

  convertEvents = (events: EventResponse | Event[]): V1EventData[] => {
    try {
      if (Array.isArray(events)) return convertEventsToDataArrays(events);
      else return convertEventsToDataArrays(events.items);
    } catch (error) {
      throw new Error(`Error converting events: ${error}`);
    }
  };

  uploadData = async (data: V1EventData[]): Promise<UploadReceipt> => {
    if (this.rpcUrl === undefined || this.privateKey === undefined) {
      throw new Error('A valid RPC URL and Ethereum private key are necessary to upload data');
    }

    try {
      return await writeData(this.rpcUrl, this.privateKey, data);
    } catch (error) {
      throw new Error(`Error uploading data: ${error}`);
    }
  };
};
