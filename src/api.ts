import { Clusters } from '@clustersxyz/sdk';
import { EventQueryFilter, EventResponse, Event } from '@clustersxyz/sdk/types/event';
import { UploadReceipt, V1EventData, V1RegistrationData, V1UpdateData } from './types';
import Irys from '@irys/sdk';
import { IrysTransaction } from '@irys/sdk/common/types';

const VERSION = 1;

const getClusters = async (apiKey?: string) => {
  try {
    const clusters = new Clusters({ apiKey: apiKey });
    return clusters;
  } catch (error) {
    throw new Error(`Error instantiating Clusters SDK: ${error}`);
  }
};

const getIrys = async (rpc: string, key: string) => {
  try {
    const irys = new Irys({
      network: 'mainnet',
      token: 'ethereum',
      key: key,
      config: { providerUrl: rpc },
    });
    return irys;
  } catch (error) {
    throw new Error(`Error instantiating Irys SDK: ${error}`);
  }
};

export const fetchEvents = async (apiKey?: string, filter?: EventQueryFilter): Promise<EventResponse> => {
  try {
    const clusters = await getClusters(apiKey);
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

export const writeData = async (rpc: string, key: string, data: V1EventData[]): Promise<UploadReceipt> => {
  try {
    const irys = await getIrys(rpc, key);
    const txs: IrysTransaction[] = [];
    const txids: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const newTx = irys.createTransaction(data[i].toString(), {
        tags: [
          { name: 'Content-Type', value: 'text/plain' },
          { name: 'Data-Version', value: data[i][0].toString() },
          { name: 'Event-Type', value: data[i][1] },
          { name: 'Address', value: data[i][3] },
          { name: 'Address-Type', value: data[i][4]?.toString() ?? '' },
          { name: 'Cluster-Name', value: data[i][5]?.toString() ?? '' },
        ],
      });
      await newTx.sign();
      txs.push(newTx);
      txids.push(newTx.id);
    }
    const upload = await irys.uploader.uploadBundle(txs);
    return { txids: txids, bundle: upload.data.id };
  } catch (error) {
    throw new Error(`Error writing data to Arweave via Irys: ${error}`);
  }
};
