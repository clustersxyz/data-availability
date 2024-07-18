export type CelestiaRpc = {
  url: string;
  authorization: string;
};

export type CelestiaBlob = {
  height: number;
  namespace: string;
};

export type Headers = {
  Authorization: string;
  'Content-Type': string;
};

export type BlobBody = {
  id: number;
  jsonrpc: string;
  method: string;
  params: [number, [string]];
};

export type Request = {
  headers: Headers;
  body: BlobBody;
};

export type BlobData = {
  commitment: string;
  data: string;
  index: number;
  namespace: string;
  share_version: number;
};

export type BlobResponse = {
  jsonrpc: string;
  id: number;
  result: BlobData[];
};
