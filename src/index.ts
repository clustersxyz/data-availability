import { convertEventsToDataArrays, fetchEvents } from './api';
import { EventQueryFilter, EventResponse, Event } from '@clustersxyz/sdk/types/event';
import { V1EventData } from './types';

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

  convertEvents = (events: EventResponse | Event[]): V1EventData[] => {
    try {
      if (Array.isArray(events)) return convertEventsToDataArrays(events);
      else return convertEventsToDataArrays(events.items);
    } catch (error) {
      throw new Error(`Error converting events: ${error}`);
    }
  };
};
