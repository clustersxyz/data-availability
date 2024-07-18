import * as dotenv from 'dotenv';
import { ClustersDA } from '../src/index';
dotenv.config();

const da = new ClustersDA();
let query;

console.log('Pulling start of event log:');
query = await da.getEvents();
console.log(query);

console.log('\nPulling events after a specific timestamp:');
query = await da.getEvents({ fromTimestamp: 1706804687 });
console.log(query);

console.log('\nPulling events for a specific page:');
query = await da.getEvents({ nextPage: 'I0vdCd8rOc' });
console.log(query);
