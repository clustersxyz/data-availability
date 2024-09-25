import * as dotenv from 'dotenv';
import { ClustersDA } from '../lib/index';
dotenv.config();

const manifestUploader = JSON.parse(process.env.AR_MANIFEST_KEY as string);

const da = new ClustersDA({
  manifestUploader: manifestUploader,
});

const manifest = await da.getCurrentManifest();
console.log(manifest);
const events = await da.queryData();
