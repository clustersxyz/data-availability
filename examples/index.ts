import * as dotenv from 'dotenv';
import { ClustersDA } from '../src/index';
import { CelestiaRpc, CelestiaBlob } from '../src/types';

dotenv.config();

const rpc: CelestiaRpc = {
  url: process.env.CELESTIA_RPC as string,
  authorization: process.env.RPC_AUTHORIZATION as string,
};

const da = new ClustersDA({ celestiaRpc: rpc });

const blob: CelestiaBlob = {
  height: 1867000,
  namespace: 'AAAAAAAAAAAAAAAAAAAAAAAAAKKnitomrCy/HoY=',
};

const range = 10;

console.log('Request for individual block:');
let commitments = await da.getUpdates(blob);
console.log('Blob:', blob, '\nCommitments:', commitments);
console.log('');

console.log('Request for range of blocks:');
let batchCommitments = await da.getUpdatesRange(blob, range);
console.log('Initial Blob:', blob, '\nRange:', range, '\nCommitments:', batchCommitments);
if (batchCommitments && batchCommitments.length > 0) console.log(`Total blobs found: ${batchCommitments.length}`);
