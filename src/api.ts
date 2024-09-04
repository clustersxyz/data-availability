// SDKs
import { Clusters } from '@clustersxyz/sdk';
import Arweave from 'arweave';
// Types
import {
  EventQueryFilter,
  EventResponse,
  Event,
  RegistrationEvent,
  UpdateWalletEvent,
  RemoveWalletEvent,
} from '@clustersxyz/sdk/types/event';
import {
  V1EventData,
  V1RegistrationData,
  V1UpdateWalletData,
  V1RemoveWalletData,
  UploadReceipt,
  ManifestData,
} from './types';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { ApiConfig } from 'arweave/node/lib/api';

const VERSION = 1;

const getClusters = async (apiKey?: string) => {
  try {
    const clusters = new Clusters({ apiKey: apiKey });
    return clusters;
  } catch (error) {
    throw new Error(`Error instantiating Clusters SDK: ${error}`);
  }
};

const getArweave = async (rpc: ApiConfig) => {
  try {
    const arweave = Arweave.init(rpc);
    return arweave;
  } catch (error) {
    throw new Error(`Error instantiating Arweave SDK: ${error}`);
  }
};

// Helper function to type check ManifestData
const isManifestData = (data: any): data is ManifestData => {
  return typeof data === 'object' && 'id' in data && 'startTimestamp' in data && 'endTimestamp' in data;
};

const convertEventsToDataArrays = (events: Event[]): V1EventData[] => {
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

const convertDataToEvents = (data: V1EventData[]): Event[] => {
  try {
    return data.map((item): Event => {
      if (!Array.isArray(item) || item.length < 7) {
        throw new Error(`Invalid event data format: ${JSON.stringify(item)}`);
      }
      const [version, eventType, clusterId, bytes32Address, address, addressType, ...rest] = item;
      if (version !== VERSION) {
        throw new Error(`Unsupported event version: ${version}`); // NOTE: Adjust the logic when VERSION is incremented
      }
      switch (eventType) {
        case 'register':
          if (rest.length !== 3) throw new Error('Invalid register event data');
          return {
            eventType,
            clusterId,
            bytes32Address,
            address,
            addressType,
            data: {
              name: rest[0] as string,
              weiAmount: rest[1] as number,
            },
            timestamp: rest[2] as number,
          } as RegistrationEvent;

        case 'updateWallet':
          if (rest.length !== 3) throw new Error('Invalid updateWallet event data');
          return {
            eventType,
            clusterId,
            bytes32Address,
            address,
            addressType,
            data: {
              name: rest[0] as string,
              isVerified: rest[1] as boolean,
            },
            timestamp: rest[2] as number,
          } as UpdateWalletEvent;

        case 'removeWallet':
          if (rest.length !== 1) throw new Error('Invalid removeWallet event data');
          return {
            eventType,
            clusterId,
            bytes32Address,
            address,
            addressType,
            data: null,
            timestamp: rest[0] as number,
          } as RemoveWalletEvent;

        default:
          throw new Error(`Unknown event type: ${eventType}`);
      }
    });
  } catch (error) {
    throw new Error(`Error converting data arrays to Event objects: ${error}`);
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

export const uploadData = async (
  rpc: ApiConfig,
  key: JWKInterface,
  data: EventResponse | Event[] | UploadReceipt[],
): Promise<UploadReceipt> => {
  try {
    if ((!Array.isArray(data) && data.items.length === 0) || (Array.isArray(data) && data.length === 0))
      throw new Error(`No data was provided for upload.`);

    const sortByTimestamp = (a: Event | UploadReceipt, b: Event | UploadReceipt) => {
      const getTimestamp = (item: Event | UploadReceipt) =>
        'timestamp' in item ? item.timestamp : item.startTimestamp;
      return getTimestamp(a) - getTimestamp(b);
    };

    const extractTimestamps = (items: (Event | UploadReceipt)[]): { startTimestamp: number; endTimestamp: number } => {
      if (items.length === 0) {
        throw new Error('Cannot extract timestamps from an empty array');
      }

      const sortedItems = [...items].sort(sortByTimestamp);
      const firstItem = sortedItems[0];
      const lastItem = sortedItems[sortedItems.length - 1];

      return {
        startTimestamp: 'timestamp' in firstItem ? firstItem.timestamp : firstItem.startTimestamp,
        endTimestamp: 'timestamp' in lastItem ? lastItem.timestamp : lastItem.endTimestamp,
      };
    };

    // Only used when updating the manifest
    const convertToManifestData = (receipt: UploadReceipt): ManifestData => ({
      id: receipt.id,
      startTimestamp: receipt.startTimestamp,
      endTimestamp: receipt.endTimestamp,
    });
    const isUploadReceipt = (item: Event | UploadReceipt): item is UploadReceipt => 'isComplete' in item;

    let upload: string;
    let timestamps: { startTimestamp: number; endTimestamp: number };

    if (Array.isArray(data)) {
      if (data.every(isUploadReceipt)) {
        // UploadReceipt[]
        const sortedData = [...data].sort(sortByTimestamp);
        const manifestData = sortedData.map(convertToManifestData);
        upload = JSON.stringify(manifestData);
        timestamps = extractTimestamps(sortedData);
      } else {
        // Event[]
        const sortedEvents = [...data].sort(sortByTimestamp) as Event[];
        upload = JSON.stringify(convertEventsToDataArrays(sortedEvents));
        timestamps = extractTimestamps(sortedEvents);
      }
    } else {
      // EventResponse
      const sortedItems = [...data.items].sort(sortByTimestamp);
      upload = JSON.stringify(convertEventsToDataArrays(sortedItems));
      timestamps = extractTimestamps(sortedItems);
    }

    let arweave = await getArweave(rpc);
    let transaction = await arweave.createTransaction({ data: upload }, key);
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('Start-Timestamp', timestamps.startTimestamp.toString());
    transaction.addTag('End-Timestamp', timestamps.endTimestamp.toString());
    await arweave.transactions.sign(transaction, key);
    let uploader = await arweave.transactions.getUploader(transaction);

    try {
      while (!uploader.isComplete) await uploader.uploadChunk();
      return {
        id: transaction.id,
        isComplete: uploader.isComplete,
        uploader: JSON.stringify(uploader),
        data: upload,
        startTimestamp: timestamps.startTimestamp,
        endTimestamp: timestamps.endTimestamp,
      };
    } catch {
      return {
        id: transaction.id,
        isComplete: uploader.isComplete,
        uploader: JSON.stringify(uploader),
        data: upload,
        startTimestamp: timestamps.startTimestamp,
        endTimestamp: timestamps.endTimestamp,
      };
    }
  } catch (error) {
    throw new Error(`Error uploading to Arweave: ${error}`);
  }
};

export const resumeUpload = async (rpc: ApiConfig, receipt: UploadReceipt): Promise<UploadReceipt> => {
  try {
    if (!receipt.data) throw new Error(`UploadReceipt does not include the required data.`);

    let arweave = await getArweave(rpc);
    let uploader = await arweave.transactions.getUploader(
      receipt.uploader ? JSON.parse(receipt.uploader) : receipt.id,
      new TextEncoder().encode(receipt.data),
    );

    try {
      while (!uploader.isComplete) await uploader.uploadChunk();
      return {
        id: receipt.id,
        isComplete: uploader.isComplete,
        startTimestamp: receipt.startTimestamp,
        endTimestamp: receipt.endTimestamp,
      };
    } catch {
      return {
        id: receipt.id,
        isComplete: uploader.isComplete,
        uploader: JSON.stringify(uploader),
        data: receipt.data,
        startTimestamp: receipt.startTimestamp,
        endTimestamp: receipt.endTimestamp,
      };
    }
  } catch (error) {
    throw new Error(`Error resuming Arweave upload: ${error}`);
  }
};

export const fetchData = async (
  rpc: ApiConfig,
  txids: string[],
  startTimestamp?: number,
  endTimestamp?: number,
): Promise<(Event[] | ManifestData[])[]> => {
  try {
    if (txids.length === 0) throw new Error(`No transaction IDs were provided for retrieval.`);

    let arweave = await getArweave(rpc);
    let response: (Event[] | ManifestData[])[] = [];

    for (const tx of txids) {
      const data = await arweave.transactions.getData(tx, { decode: true, string: true });
      const parsedData = JSON.parse(data as string);

      if (!Array.isArray(parsedData)) throw new Error(`Invalid data format for txid: ${tx}`);

      if (parsedData.length === 0) {
        console.log(`No valid data parsed from txid: ${tx}`);
        response.push([]);
      } else if (Array.isArray(parsedData[0])) {
        const events = convertDataToEvents(parsedData as V1EventData[]);
        if (startTimestamp !== undefined && endTimestamp !== undefined) {
          response.push(events.filter((event) => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp));
        } else {
          response.push(events);
        }
      } else if (isManifestData(parsedData[0])) {
        if (startTimestamp !== undefined && endTimestamp !== undefined) {
          const filteredManifest = (parsedData as ManifestData[]).filter(
            (entry) => entry.startTimestamp <= endTimestamp && entry.endTimestamp >= startTimestamp,
          );

          // Fetch and filter events for each manifest entry
          let allFilteredEvents: Event[] = [];
          for (const entry of filteredManifest) {
            const entryData = await arweave.transactions.getData(entry.id, { decode: true, string: true });
            const parsedEntryData = JSON.parse(entryData as string) as V1EventData[];
            const entryEvents = convertDataToEvents(parsedEntryData);

            const filteredEvents = entryEvents.filter(
              (event) => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp,
            );
            allFilteredEvents = allFilteredEvents.concat(filteredEvents);
          }
          response.push(allFilteredEvents);
        } else {
          response.push(parsedData as ManifestData[]);
        }
      } else {
        throw new Error(`Unsupported data format for txid: ${tx}`);
      }
    }

    return response;
  } catch (error) {
    throw new Error(`Error fetching data from Arweave: ${error}`);
  }
};

export const writeManifest = async (
  rpc: ApiConfig,
  key: JWKInterface,
  data: UploadReceipt[],
): Promise<UploadReceipt> => {
  try {
    if (data.length === 0) throw new Error(`No data was provided for the manifest.`);
    if (!data.every((item) => item.isComplete === true)) throw new Error(`Failed upload receipt in data.`);
    const manifest = await uploadData(rpc, key, data);
    if (!manifest.isComplete) throw new Error(`Manifest failed to upload to Arweave: ${manifest}`);
    return manifest;
  } catch (error) {
    throw new Error(`Error uploading manifest to Arweave: ${error}`);
  }
};

export const updateManifest = async (
  rpc: ApiConfig,
  key: JWKInterface,
  data: UploadReceipt[],
  manifestTxId: string,
): Promise<UploadReceipt> => {
  try {
    if (data.length === 0) throw new Error(`No data was provided for the manifest.`);
    if (!data.every((item) => item.isComplete === true)) throw new Error(`Failed upload receipt in data.`);
    if (manifestTxId === '') throw new Error(`No manifest TXID was provided.`);

    const oldManifestData = await fetchData(rpc, [manifestTxId]);
    if (oldManifestData.length === 0) throw new Error(`Previous manifest TXID did not return any manifest data.`);
    const oldManifest = oldManifestData[0];
    if (
      !Array.isArray(oldManifest) ||
      !oldManifest.every(
        (item) => typeof item === 'object' && 'id' in item && 'startTimestamp' in item && 'endTimestamp' in item,
      )
    ) {
      throw new Error(`Retrieved data does not match ManifestData format.`);
    }

    // Convert ManifestData[] to UploadReceipt[]
    const oldManifestReceipts: UploadReceipt[] = oldManifest.map((item) => ({
      id: item.id,
      isComplete: true,
      startTimestamp: item.startTimestamp,
      endTimestamp: item.endTimestamp,
    }));

    const newManifest: UploadReceipt[] = [...oldManifestReceipts, ...data];

    return await writeManifest(rpc, key, newManifest);
  } catch (error) {
    throw new Error(`Error updating manifest: ${error}`);
  }
};

export const retrieveLastUpload = async (rpc: ApiConfig, address: string): Promise<string> => {
  try {
    const response = await fetch(`http://${rpc.host}:${rpc.port}/wallet/${address}/last_tx`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } catch (error) {
    throw new Error(`Error retrieving last upload from ${address}: ${error}`);
  }
};

export const getAddressFromKey = async (rpc: ApiConfig, key: JWKInterface): Promise<string> => {
  try {
    let arweave = await getArweave(rpc);
    return await arweave.wallets.jwkToAddress(key);
  } catch (error) {
    throw new Error(`Error retrieving Arweave address from key: ${error}`);
  }
};
