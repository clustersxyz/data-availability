import { fetchEvents } from './api';
import { EventQueryFilter, EventResponse } from '@clustersxyz/sdk/types/event';

export const ClustersDA = class {
  apiKey: string | undefined = undefined;

  constructor(obj?: { apiKey?: string }) {
    this.apiKey = obj?.apiKey;
  }

  getEvents = async (filter?: EventQueryFilter): Promise<EventResponse> => {
    try {
      return await fetchEvents(this.apiKey, filter);
    } catch (error) {
      throw new Error(`Error retrieving events: ${error}`);
    }
  };
};
