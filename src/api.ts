import { Clusters } from '@clustersxyz/sdk';
import { EventQueryFilter, EventResponse, Event } from '@clustersxyz/sdk/types/event';
import { V1EventData, V1RegistrationData, V1UpdateData } from './types';

const VERSION = 1;

const getClusters = (apiKey?: string) => {
  try {
    const clusters = new Clusters({ apiKey: apiKey });
    return clusters;
  } catch (error) {
    throw new Error(`Error instantiating Clusters SDK: ${error}`);
  }
};

export const fetchEvents = async (apiKey?: string, filter?: EventQueryFilter): Promise<EventResponse> => {
  try {
    const clusters = getClusters(apiKey);
    let events: EventResponse;
    if (filter) {
      if (!filter.sortBy) filter.sortBy = 'oldest';
      events = await clusters.getEvents(filter);
    } else {
      events = await clusters.getEvents({ sortBy: 'oldest' });
    }
    return events;
  } catch (error) {
    throw new Error(`Error retrieving events from Clusters SDK: ${error}`);
  }
};

export const convertEventsToDataArrays = (events: Event[]): V1EventData[] => {
  try {
    return events.map((event) => {
      if (event.eventType === 'register') {
        return [
          VERSION,
          event.eventType,
          event.bytes32Address,
          event.address,
          event.addressType,
          event.clusterName,
          event.data.weiAmount,
          event.timestamp,
        ] as V1RegistrationData;
      } else {
        return [
          VERSION,
          event.eventType,
          event.bytes32Address,
          event.address,
          event.addressType,
          event.clusterName,
          event.data.name,
          event.data.isVerified,
          event.timestamp,
        ] as V1UpdateData;
      }
    });
  } catch (error) {
    throw new Error(`Error converting events to data commitments: ${error}`);
  }
};
