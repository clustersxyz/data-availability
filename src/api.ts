// SDKs
import { Clusters } from '@clustersxyz/sdk';
import Irys from '@irys/sdk';
import Query from '@irys/query';
import { Bundle } from 'arbundles/node';
// Types
import { IrysTransaction } from '@irys/sdk/common/types';
import { AddressType } from '@clustersxyz/sdk/types/address';
import {
  EventQueryFilter,
  EventResponse,
  Event,
  RegistrationEvent,
  UpdateWalletEvent,
  RemoveWalletEvent,
} from '@clustersxyz/sdk/types/event';
import {
  IrysQuery,
  QueryResults,
  UploadReceipt,
  V1EventData,
  V1RegistrationData,
  V1UpdateWalletData,
  V1RemoveWalletData,
} from './types';

const VERSION = 1;
const UPLOADER_ADDRESS = '0x0000000000000000000000000000000000000000';
const START_TIMESTAMP = 1721425000;

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
      switch (event.eventType) {
        case 'register':
          return [
            VERSION,
            event.eventType,
            event.clusterId,
            event.bytes32Address,
            event.address,
            event.addressType,
            event.data.name,
            event.data.weiAmount,
            event.timestamp,
          ] as V1RegistrationData;
        case 'updateWallet':
          return [
            VERSION,
            event.eventType,
            event.clusterId,
            event.bytes32Address,
            event.address,
            event.addressType,
            event.data.name,
            event.data.isVerified,
            event.timestamp,
          ] as V1UpdateWalletData;
        case 'removeWallet':
          return [
            VERSION,
            event.eventType,
            event.clusterId,
            event.bytes32Address,
            event.address,
            event.addressType,
            event.timestamp,
          ] as V1RemoveWalletData;
        default:
          throw new Error(`Unknown event type: ${(event as Event).eventType}`);
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
          { name: 'Cluster-ID', value: data[i][2].toString() },
          { name: 'Bytes32', value: data[i][3] },
          { name: 'Address', value: data[i][4] },
          { name: 'Address-Type', value: data[i][5]?.toString() ?? '' },
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

export const queryWrites = async (query: IrysQuery): Promise<QueryResults[]> => {
  try {
    const myQuery = new Query({ network: 'mainnet' });
    return (await myQuery
      .search('irys:transactions')
      .from(query.addresses ? query.addresses : [UPLOADER_ADDRESS])
      .fromTimestamp(query.fromTimestamp ? query.fromTimestamp : START_TIMESTAMP)
      .sort(query.sort ? query.sort : 'ASC')
      .fields(query.fields ? query.fields : { id: true, timestamp: true })
      .limit(query.limit && query.limit <= 1000 ? query.limit : 1000)) as QueryResults[];
  } catch (error) {
    throw new Error(`Error reading data from Arweave via Irys: ${error}`);
  }
};

export const downloadBundle = async (id: string): Promise<Buffer> => {
  try {
    const url = `https://gateway.irys.xyz/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Error downloading Irys bundle: ${error}`);
  }
};

export const readBundleData = (data: Buffer): Event[] => {
  const bundle = new Bundle(data);

  return bundle.items.map((item) => {
    const decodedString = Buffer.from(item.data, 'base64').toString('utf-8');
    const [, eventType, clusterId, bytes32Address, address, addressType, ...rest] = decodedString.split(',');

    const baseEvent = {
      clusterId: Number(clusterId),
      bytes32Address: bytes32Address as `0x${string}`,
      address,
      addressType: addressType as AddressType,
    };

    switch (eventType) {
      case 'register': {
        const [name, weiAmount, timestamp] = rest;
        return {
          ...baseEvent,
          eventType: 'register',
          data: {
            name,
            weiAmount: Number(weiAmount),
          },
          timestamp: Number(timestamp),
        } as RegistrationEvent;
      }
      case 'updateWallet': {
        const [name, isVerified, timestamp] = rest;
        return {
          ...baseEvent,
          eventType: 'updateWallet',
          data: {
            name,
            isVerified: isVerified === 'true',
          },
          timestamp: Number(timestamp),
        } as UpdateWalletEvent;
      }
      case 'removeWallet': {
        const [timestamp] = rest;
        return {
          ...baseEvent,
          eventType: 'removeWallet',
          data: null,
          timestamp: Number(timestamp),
        } as RemoveWalletEvent;
      }
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }
  });
};
