import * as dotenv from 'dotenv';
import { ClustersDA } from '../lib/index';
import { UploadReceipt } from '../lib/types';
import { Clusters } from '@clustersxyz/sdk';
import { EventResponse } from '@clustersxyz/sdk/types/event';
import Arweave from 'arweave';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ArLocal = require('arlocal').default;
dotenv.config();

const apiKey = process.env.CLUSTERS_API_KEY;

const clusters = new Clusters({ apiKey: apiKey });

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

  let eventBatches: EventResponse[] = [];
  for (let i = 0; i < 50; i++) {
    if (i == 0) eventBatches.push(await clusters.getEvents({ sortBy: 'oldest', limit: 1000 }));
    else
      eventBatches.push(
        await clusters.getEvents({ sortBy: 'oldest', limit: 1000, nextPage: eventBatches[i - 1].nextPage as string }),
      );
  }

  let uploadReceipts: UploadReceipt[] = [];
  for (let i = 0; i < eventBatches.length; i++) {
    uploadReceipts.push(await da.uploadEvents(eventBatches[i]));
  }

  const manifestUpload = await da.pushToManifest(uploadReceipts, true);
  if (!manifestUpload.isComplete) throw new Error(`Manifest upload failed.`);

  console.log('Manifest uploaded:', manifestUpload);

  const manifest = await da.getCurrentManifest();
  const daBatches = await da.getFileIds(manifest.map((m) => m.id));

  for (let i = 0; i < eventBatches.length; i++) {
    for (let j = 0; j < daBatches[i].length; j++) {
      const localEvent = eventBatches[i].items[j];
      const daEvent = daBatches[i][j];
      if (
        // @ts-ignore
        localEvent.eventType !== daEvent.eventType ||
        // @ts-ignore
        localEvent.clusterId !== daEvent.clusterId ||
        // @ts-ignore
        localEvent.bytes32Address !== daEvent.bytes32Address ||
        // @ts-ignore
        localEvent.address !== daEvent.address ||
        // @ts-ignore
        localEvent.addressType !== daEvent.addressType ||
        // @ts-ignore
        localEvent.timestamp !== daEvent.timestamp
      ) {
        console.error('Mismatch found:');
        console.error('Local event:', localEvent);
        console.error('DA event:', daEvent);
        throw new Error(`Mismatch at batch ${i}, event ${j}`);
      }
    }
  }

  console.log('All events uploaded and verified successfully.');
  await arLocal.stop();
})();
