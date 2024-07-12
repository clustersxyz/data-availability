import { ClustersDA } from '../src/index';
import * as dotenv from 'dotenv';
dotenv.config();

const rpc = 'https://ethereum-sepolia-rpc.publicnode.com';
const key = process.env.PRIVATE_KEY as string;

const da = new ClustersDA({ rpcProvider: rpc, privateKey: key });

const amount = 0.05;
const data = 'Hello World!';

console.log('Funding Irys node with 0.05 ETH:');
await da.fund(amount);
console.log('Uploading text data to Irys:');
await da.upload(data);
