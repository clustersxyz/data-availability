import * as dotenv from 'dotenv';
import { ClustersDA } from '../dist/index.js';
import Arweave from 'arweave';
dotenv.config();

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

const apiKey = process.env.CLUSTERS_API_KEY;

const manifestUploader = JSON.parse(process.env.AR_MANIFEST_KEY as string);
const eventUploader = JSON.parse(process.env.AR_UPDATES_KEY as string);

const arweaveRpc = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
};

const arweave = Arweave.init(arweaveRpc);
const manifestAddress = await arweave.wallets.jwkToAddress(manifestUploader);
const eventAddress = await arweave.wallets.jwkToAddress(eventUploader);
console.log('Manifest Uploader Address:', manifestAddress);
console.log('Event Uploader Address:', eventAddress);

const da = new ClustersDA({
  apiKey: apiKey,
  manifestUploader: manifestUploader,
  eventUploader: eventUploader,
  arweaveRpc: { host: 'arweave.net', port: 443, protocol: 'https', logging: true },
});

const events = await da.getEvents({ limit: 100 });
const newEvents = await da.getEvents({ limit: 100, nextPage: events.nextPage as string });
const eventBundle = await da.getEvents({ limit: 200 });

console.log(fYellow('Uploading event batch 1'));
const eventsUpload = await da.uploadEvents(events);
if (!eventsUpload.isComplete) throw new Error(`Events upload failed.`);
await da.waitForConfirmation(eventsUpload.id);
console.log(fGreen('Event batch 1 uploaded'));

console.log(fYellow('Initializing manifest'));
const manifestUpload = await da.pushToManifest([eventsUpload], true);
if (!manifestUpload.isComplete) throw new Error(`Manifest upload failed.`);
await da.waitForConfirmation(manifestUpload.id);
console.log(fGreen('Manifest initialized'));

console.log(fYellow('Checking existing state'));
let currentManifest = await da.getCurrentManifest();
const initialRead = await da.getFileIds(currentManifest.map((item) => item.id));
if (JSON.stringify(events.items) !== JSON.stringify(initialRead[0])) {
  throw new Error(`Retrieved events do not match API response.`);
}
console.log(fGreen('Manifest data properly replicates event state'));

console.log(fYellow('Uploading event batch 2'));
const newEventsUpload = await da.uploadEvents(newEvents);
if (!newEventsUpload.isComplete) throw new Error(`New events upload failed.`);
await da.waitForConfirmation(newEventsUpload.id);
console.log(fGreen('Event batch 2 uploaded'));

console.log(fYellow('Updating manifest'));
const updateManifest = await da.pushToManifest([newEventsUpload]);
if (!updateManifest.isComplete) throw new Error(`Manifest update failed.`);
await da.waitForConfirmation(updateManifest.id);
console.log(fGreen('Manifest updated'));

console.log(fYellow('Checking updated state'));
currentManifest = await da.getCurrentManifest();
const newRead = await da.getFileIds(currentManifest.map((item) => item.id));
if (JSON.stringify(newEvents.items) !== JSON.stringify(newRead[1])) {
  throw new Error(`Retrieved events do not match API response.`);
}
if (
  JSON.stringify([...events.items, ...newEvents.items]) !== JSON.stringify([...newRead[0], ...newRead[1]]) ||
  JSON.stringify(eventBundle.items) !== JSON.stringify([...newRead[0], ...newRead[1]])
) {
  throw new Error(`Retrieved events are out of order`);
}
console.log(fGreen('Updated manifest data properly replicates event state'));

console.log(fYellow('Checking manifest construction'));
if (currentManifest.length !== 2) {
  throw new Error(`Manifest should contain 2 entries, but contains ${currentManifest.length}`);
}
if (currentManifest[0].id !== eventsUpload.id || currentManifest[1].id !== newEventsUpload.id) {
  throw new Error(`Manifest IDs do not match uploaded event IDs`);
}
if (
  currentManifest[0].startTimestamp !== eventsUpload.startTimestamp ||
  currentManifest[0].endTimestamp !== eventsUpload.endTimestamp ||
  currentManifest[1].startTimestamp !== newEventsUpload.startTimestamp ||
  currentManifest[1].endTimestamp !== newEventsUpload.endTimestamp
) {
  throw new Error(`Manifest timestamps do not match uploaded event timestamps`);
}
console.log(fGreen('Manifest is properly constructed'));

// Test queryData function
console.log(fYellow('Testing queryData function...'));

// Test case 1: Query all events (no timestamp filtering)
const allEvents = await da.queryData();
if (JSON.stringify(allEvents) !== JSON.stringify(eventBundle.items)) {
  throw new Error('Query all events failed: results do not match eventBundle');
}
console.log(fGreen('Test case 1 passed: Query all events'));

// Test case 2: Query events after a specific timestamp
const startTimestamp = 1706799790; // Timestamp of the 4th event
const eventsAfter = await da.queryData(startTimestamp);
if (eventsAfter[0].timestamp < startTimestamp) {
  throw new Error('Query events after timestamp failed');
}
console.log(fGreen('Test case 2 passed: Query events after timestamp'));

// Test case 3: Query events before a specific timestamp
const endTimestamp = 1706799796; // Timestamp of the 5th event
const eventsBefore = await da.queryData(undefined, endTimestamp);
if (eventsBefore[eventsBefore.length - 1].timestamp > endTimestamp) {
  throw new Error('Query events before timestamp failed');
}
console.log(fGreen('Test case 3 passed: Query events before timestamp'));

// Test case 4: Query events within a specific time range
const rangeStart = 1706799779; // Timestamp of the 3rd event
const rangeEnd = 1706799839; // Timestamp of the 6th event
const eventsInRange = await da.queryData(rangeStart, rangeEnd);
if (eventsInRange[0].timestamp < rangeStart || eventsInRange[eventsInRange.length - 1].timestamp > rangeEnd) {
  throw new Error('Query events within time range failed');
}
console.log(fGreen('Test case 4 passed: Query events within time range'));

// Test case 5: Query with a start timestamp that's before all events
const earlyStart = 1706700000;
const earlyStartEvents = await da.queryData(earlyStart);
if (JSON.stringify(earlyStartEvents) !== JSON.stringify(eventBundle.items)) {
  throw new Error('Query with early start timestamp failed');
}
console.log(fGreen('Test case 5 passed: Query with early start timestamp'));

// Test case 6: Query with an end timestamp that's after all events
const lateEnd = 1806700000;
const lateEndEvents = await da.queryData(undefined, lateEnd);
if (JSON.stringify(lateEndEvents) !== JSON.stringify(eventBundle.items)) {
  throw new Error('Query with late end timestamp failed');
}
console.log(fGreen('Test case 6 passed: Query with late end timestamp'));

// Test case 7: Query with a time range that doesn't include any events
const noEventStart = 1706700000;
const noEventEnd = 1706700001;
const noEvents = await da.queryData(noEventStart, noEventEnd);
if (noEvents.length !== 0) {
  throw new Error('Query with no events in range failed');
}
console.log(fGreen('Test case 7 passed: Query with no events in range'));
console.log('');
console.log(fGreen('All queryData tests passed successfully!'));
console.log(fGreen('Test successful!'));
