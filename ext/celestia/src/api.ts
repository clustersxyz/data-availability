import { CelestiaBlob, CelestiaRpc, Request, Headers, BlobBody, BlobData, BlobResponse } from './types';

const generateRequest = (rpc: CelestiaRpc, blob: CelestiaBlob): Request => {
  const headers: Headers = {
    Authorization: rpc.authorization,
    'Content-Type': 'application/json',
  };

  const body: BlobBody = {
    id: 1,
    jsonrpc: '2.0',
    method: 'blob.GetAll',
    params: [blob.height, [blob.namespace]],
  };

  return { headers, body };
};

const makeRequest = async (rpc: CelestiaRpc, request: Request): Promise<BlobData[] | null> => {
  try {
    const response = await fetch(rpc.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const data = (await response.json()) as BlobResponse;

    if (!data.result || !Array.isArray(data.result)) {
      return null;
    }

    return data.result;
  } catch (error) {
    throw new Error(`Fetch error: ${error}`);
  }
};

export const fetchBlobs = async (rpc: CelestiaRpc, blobs: CelestiaBlob[]): Promise<(BlobData[] | null)[]> => {
  const requests = blobs.map((blob) => generateRequest(rpc, blob));
  const responses = await Promise.all(requests.map((request) => makeRequest(rpc, request)));
  return responses;
};
