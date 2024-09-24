import * as dotenv from 'dotenv';
import { ClustersDA } from '../src/index';
import Arweave from 'arweave';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ArLocal = require('arlocal').default;
dotenv.config();

const apiKey = process.env.CLUSTERS_API_KEY;

const arweaveRpc = {
  host: 'localhost',
  port: 1984,
  protocol: 'http',
};

const arweave = Arweave.init(arweaveRpc);

const manifestUploader = await arweave.wallets.generate();
const eventUploader = await arweave.wallets.generate();

(async () => {
  const arLocal = new ArLocal();
  await arLocal.start();

  const manifestAddress = await arweave.wallets.jwkToAddress(manifestUploader);
  const eventAddress = await arweave.wallets.jwkToAddress(eventUploader);
  console.log('Manifest Uploader Address:', manifestAddress);
  console.log('Event Uploader Address:', eventAddress);

  const da = new ClustersDA({
    apiKey: apiKey,
    manifestUploader: manifestUploader,
    eventUploader: eventUploader,
    arweaveRpc: arweaveRpc,
  });

  await fetch(`http://${arweaveRpc.host}:${arweaveRpc.port}/mint/${manifestAddress}/10000000000000`);
  await fetch(`http://${arweaveRpc.host}:${arweaveRpc.port}/mint/${eventAddress}/10000000000000`);

  const events = await da.getEvents({ limit: 5 });
  const newEvents = await da.getEvents({ limit: 5, nextPage: events.nextPage as string });
  const eventBundle = await da.getEvents({ limit: 10 });

  const eventsUpload = await da.uploadEvents(events);
  if (!eventsUpload.isComplete) throw new Error(`Events upload failed.`);

  const manifestUpload = await da.pushToManifest([eventsUpload]);
  if (!manifestUpload.isComplete) throw new Error(`Manifest upload failed.`);

  let currentManifest = await da.getCurrentManifest();
  const initialRead = await da.getFileIds(currentManifest.map((item) => item.id));
  if (JSON.stringify(events.items) !== JSON.stringify(initialRead[0])) {
    throw new Error(`Retrieved events do not match API response.`);
  }

  const newEventsUpload = await da.uploadEvents(newEvents);
  if (!newEventsUpload.isComplete) throw new Error(`New events upload failed.`);

  const updateManifest = await da.pushToManifest([newEventsUpload]);
  if (!updateManifest.isComplete) throw new Error(`Manifest update failed.`);

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

  // Verify manifest data
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

  // Test queryData function
  console.log('Testing queryData function...');

  // Test case 1: Query all events (no timestamp filtering)
  const allEvents = await da.queryData();
  if (JSON.stringify(allEvents) !== JSON.stringify(eventBundle.items)) {
    throw new Error('Query all events failed: results do not match eventBundle');
  }
  console.log('Test case 1 passed: Query all events');

  // Test case 2: Query events after a specific timestamp
  const startTimestamp = 1706799790; // Timestamp of the 4th event
  const eventsAfter = await da.queryData(startTimestamp);
  if (eventsAfter.length !== 7 || eventsAfter[0].timestamp !== startTimestamp) {
    throw new Error('Query events after timestamp failed');
  }
  console.log('Test case 2 passed: Query events after timestamp');

  // Test case 3: Query events before a specific timestamp
  const endTimestamp = 1706799796; // Timestamp of the 5th event
  const eventsBefore = await da.queryData(undefined, endTimestamp);
  if (eventsBefore.length !== 5 || eventsBefore[eventsBefore.length - 1].timestamp !== endTimestamp) {
    throw new Error('Query events before timestamp failed');
  }
  console.log('Test case 3 passed: Query events before timestamp');

  // Test case 4: Query events within a specific time range
  const rangeStart = 1706799779; // Timestamp of the 3rd event
  const rangeEnd = 1706799839; // Timestamp of the 6th event
  const eventsInRange = await da.queryData(rangeStart, rangeEnd);
  if (
    eventsInRange.length !== 4 ||
    eventsInRange[0].timestamp !== rangeStart ||
    eventsInRange[eventsInRange.length - 1].timestamp !== rangeEnd
  ) {
    throw new Error('Query events within time range failed');
  }
  console.log('Test case 4 passed: Query events within time range');

  // Test case 5: Query with a start timestamp that's before all events
  const earlyStart = 1706700000;
  const earlyStartEvents = await da.queryData(earlyStart);
  if (JSON.stringify(earlyStartEvents) !== JSON.stringify(eventBundle.items)) {
    throw new Error('Query with early start timestamp failed');
  }
  console.log('Test case 5 passed: Query with early start timestamp');

  // Test case 6: Query with an end timestamp that's after all events
  const lateEnd = 1706900000;
  const lateEndEvents = await da.queryData(undefined, lateEnd);
  if (JSON.stringify(lateEndEvents) !== JSON.stringify(eventBundle.items)) {
    throw new Error('Query with late end timestamp failed');
  }
  console.log('Test case 6 passed: Query with late end timestamp');

  // Test case 7: Query with a time range that doesn't include any events
  const noEventStart = 1706700000;
  const noEventEnd = 1706700001;
  const noEvents = await da.queryData(noEventStart, noEventEnd);
  if (noEvents.length !== 0) {
    throw new Error('Query with no events in range failed');
  }
  console.log('Test case 7 passed: Query with no events in range');

  console.log('All queryData tests passed successfully!');
  console.log('Test successful!');

  await arLocal.stop();
})();
