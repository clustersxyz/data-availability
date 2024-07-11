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
  height: 1861953,
  namespace: 'AAAAAAAAAAAAAAAAAAAAAAAAABMKy/ZU1bLxit0=',
};

console.log('Blob:', blob, '\nCommitments:', await da.getBlobs(blob));
