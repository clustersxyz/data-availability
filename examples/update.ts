import * as dotenv from 'dotenv';
import { ClustersDA } from '../lib/index';
import { ManifestData } from '../lib/types';
dotenv.config();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

const fGreen = (text: string): string => {
  return colors.green + text + colors.reset;
};
const fYellow = (text: string): string => {
  return colors.yellow + text + colors.reset;
};

// Initialize
console.log(fYellow('Initializing DA'));
const manifestUploader = JSON.parse(process.env.AR_MANIFEST_KEY as string);
const eventUploader = JSON.parse(process.env.AR_UPDATES_KEY as string);
const da = new ClustersDA({
  manifestUploader: manifestUploader,
  eventUploader: eventUploader,
  arweaveRpc: { host: 'arweave.net', port: 443, protocol: 'https', logging: true },
});
console.log(fGreen('DA initialized'));

// Retrieve last event from DA
console.log(fYellow('Retrieving last event from DA'));
const manifest = await da.getCurrentManifest();
console.log(fGreen('Current manifest:'), manifest);
const lastUpdateMetadata = manifest[manifest.length - 1];
const lastUpdateData = await da.getFileIds([lastUpdateMetadata.id]);
const lastUpdateEvent = lastUpdateData[0][lastUpdateData[0].length - 1];
console.log(fGreen('Last known event:'), lastUpdateEvent);

// Retrieve new events since last update
console.log(fYellow('Retrieving new events since last update'));
// @ts-ignore
const newUpdate = await da.getEvents({ sortBy: 'oldest', limit: 100, fromTimestamp: lastUpdateEvent.timestamp });
const lastKnownEventIndex = newUpdate.items.findIndex(
  (event) =>
    // @ts-ignore
    event.eventType === lastUpdateEvent.eventType &&
    // @ts-ignore
    event.clusterId === lastUpdateEvent.clusterId &&
    // @ts-ignore
    event.bytes32Address === lastUpdateEvent.bytes32Address &&
    // @ts-ignore
    event.address === lastUpdateEvent.address &&
    // @ts-ignore
    event.timestamp === lastUpdateEvent.timestamp,
);
console.log(fGreen('Last known event index:'), lastKnownEventIndex);
const eventUpdate = newUpdate.items.slice(lastKnownEventIndex + 1);

// Upload new events to DA
console.log(fYellow('Uploading new events to DA'));
const upload = await da.uploadEvents(eventUpdate);
await da.waitForConfirmation(upload.id);
console.log(fGreen('New events uploaded'));

// Push new events to manifest
console.log(fYellow('Pushing new events to manifest'));
const manifestUpdate = await da.pushToManifest([upload]);
await da.waitForConfirmation(manifestUpdate.id);
console.log(fGreen('New events added to manifest'));

// Retrieve new manifest
console.log(fYellow('Retrieving new manifest'));
let newManifest: ManifestData[] = [];
while (newManifest.length === 0) {
  const currentManifest = await da.getCurrentManifest();
  if (currentManifest === manifest) {
    console.log(fYellow('No new manifest yet, waiting 10 seconds'));
    await sleep(10_000);
  } else {
    newManifest = currentManifest;
  }
}
console.log(fGreen('New manifest:'), newManifest);
