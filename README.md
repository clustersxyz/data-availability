# Clusters Data Availability Library

This library provides a set of tools for interacting with the Clusters data availability layer, which utilizes Arweave for decentralized storage. The main class, `ClustersDA`, offers methods for managing events, manifests, and data uploads.

## Installation

```bash
npm install @clustersxyz/data-availability
```

## Usage

First, import the `ClustersDA` class:

```typescript
import { ClustersDA } from '@clustersxyz/data-availability';
```

Then, create an instance of the `ClustersDA` class:

```typescript
// Full initialization
const clustersDA = new ClustersDA({
  apiKey: 'your-clusters-api-key',
  manifestUploader: manifestUploaderJWK,
  eventUploader: eventUploaderJWK,
  arweaveRpc: { host: 'arweave.net', port: 443, protocol: 'https' },
});

// Minimal initialization
const clustersDA = new ClustersDA({
  manifestUploader: manifestUploaderAddress,
});
```

## API Reference

### Constructor

```typescript
new ClustersDA(options?: {
  apiKey?: string; // Clusters API key
  manifestUploader?: JWKInterface | string; // JWK or address of the manifest uploader
  eventUploader?: JWKInterface; // JWK of the event uploader
  arweaveRpc?: ApiConfig; // Arweave RPC configuration
})
```

### Methods

#### `getEvents(filter?: EventQueryFilter): Promise<EventResponse>`

Retrieves events based on the provided filter via the Clusters SDK.

#### `getCurrentManifest(): Promise<ManifestData[]>`

Fetches the current manifest from Arweave.

#### `pushToManifest(data: UploadReceipt[], init?: boolean): Promise<UploadReceipt>`

Adds data to the manifest or initializes a new manifest.

#### `queryData(startTimestamp?: number, endTimestamp?: number): Promise<Event[]>`

Queries data within the specified timestamp range.

#### `getFileIds(ids: string[]): Promise<(Event[] | ManifestData[])[]>`

Retrieves file data for the given IDs.

#### `uploadEvents(events: EventResponse | Event[]): Promise<UploadReceipt>`

Uploads events to Arweave.

#### `resumeEventUpload(receipt: UploadReceipt): Promise<UploadReceipt>`

Resumes an interrupted event upload.

#### `waitForConfirmation(id: string, retries: number = 30, interval: number = 30000): Promise<void>`

Waits for confirmation of an Arweave transaction.

## Error Handling

All methods throw errors with descriptive messages if something goes wrong. It's recommended to wrap method calls in try-catch blocks for proper error handling.

## Examples

### Fetching Events

```typescript
try {
  const events = await clustersDA.getEvents({ limit: 10 });
  console.log(events);
} catch (error) {
  console.error('Error fetching events:', error);
}
```

### Uploading Events

```typescript
try {
  const events = [
    /* array of Event objects */
  ];
  const receipt = await clustersDA.uploadEvents(events);
  console.log('Upload receipt:', receipt);
} catch (error) {
  console.error('Error uploading events:', error);
}
```

## License

MIT
