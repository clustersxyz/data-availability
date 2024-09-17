import Arweave from 'arweave';
import ArLocal from 'arlocal';
import * as dotenv from 'dotenv';
dotenv.config();

/*(async () => {
  const arLocal = new ArLocal();
  await arLocal.start();

  let arweave = Arweave.init({ host: 'localhost', port: 1984, protocol: 'http' });

  let key = JSON.parse(process.env.AR_UPDATES_KEY as string);
  let address = await arweave.wallets.jwkToAddress(key);
  console.log('Uploader Address:', address);

  await fetch(`http://localhost:1984/mint/${address}/10000000000000`);

  let data = JSON.stringify({ message: 'Hello World' });

  let transaction = await arweave.createTransaction({ data: data }, key);
  transaction.addTag('Content-Type', 'application/json');

  await arweave.transactions.sign(transaction, key);

  let isValid = await arweave.transactions.verify(transaction);
  console.log('is TX valid:', isValid);
  console.info('txid:', transaction.id);
  console.log(transaction);

  const response = await arweave.transactions.post(transaction);
  console.log(response);

  await arLocal.stop();
})();*/

let arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https', logging: true });

let key = JSON.parse(process.env.AR_UPDATES_KEY as string);
let address = await arweave.wallets.jwkToAddress(key);
console.log('Uploader Address:', address);

let data = JSON.stringify({ message: 'Hello World' });

let transaction = await arweave.createTransaction({ data: data }, key);
transaction.addTag('Content-Type', 'application/json');

await arweave.transactions.sign(transaction, key);

let isValid = await arweave.transactions.verify(transaction);
console.log('is TX valid:', isValid);
console.info('txid:', transaction.id);
console.log(transaction);

const response = await arweave.transactions.post(transaction);
console.log(response);

/*let uploader = await arweave.transactions.getUploader(transaction);
while (!uploader.isComplete) {
  await uploader.uploadChunk();
  console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
}*/
