import { ClustersDA } from '../src/index';
import * as dotenv from 'dotenv';
dotenv.config();

const rpc = 'https://ethereum-sepolia-rpc.publicnode.com';
const key = process.env.PRIVATE_KEY as string;

const da = new ClustersDA({ rpcProvider: rpc, privateKey: key });

const amount = 0.05;
const data = 'Hello World!';

const receipt = 'EGzkQ-YbWgYDTibrm3aiGbhZmOsag_S-7WPOXg7cn-I';
const addresses = ['0xA779fC675Db318dab004Ab8D538CB320D0013F42'];

//console.log('Funding Irys node with 0.05 ETH:');
//await da.fund(amount);

//console.log('Uploading text data to Irys:');
//await da.upload(data);

//console.log('Querying data from Irys:');
await da.query(addresses);
