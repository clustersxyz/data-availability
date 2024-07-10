import {
  Cluster,
  NameAvailability,
  Network,
  RegistrationName,
  RegistrationResponse,
  RegistrationTransactionStatus,
  Wallet,
} from './types';

const VERSION = '0.1';
const API_URL = 'https://api.clusters.xyz';

const testnetParam = (isTestnet: boolean) => (isTestnet ? '?testnet=true' : '');

const generateHeaders = (apiKey?: string): { [key: string]: string } => {
  const headerObject: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headerObject['X-API-KEY'] = apiKey;
  return headerObject;
};

export const fetchName = async (
  address: string,
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<string | null> => {
  const getName = await fetch(`${API_URL}/v${VERSION}/name/${address}${testnetParam(isTestnet)}`, {
    headers: generateHeaders(apiKey || undefined),
  });
  const name = (await getName.json()) as string | null;
  return name;
};

export const fetchNames = async (
  addresses: string[],
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<{ address: string; name: string }[]> => {
  const getNames = await fetch(`${API_URL}/v${VERSION}/name/addresses${testnetParam(isTestnet)}`, {
    method: 'POST',
    headers: generateHeaders(apiKey || undefined),
    body: JSON.stringify(addresses),
  });
  const names = (await getNames.json()) as { address: string; name: string }[];
  return names;
};

export const fetchAddress = async (
  name: string,
  addressName?: string,
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<Wallet | null> => {
  const getWallet = await fetch(
    `${API_URL}/v${VERSION}/address/${name}${addressName ? `/${addressName}` : ''}${testnetParam(isTestnet)}`,
    {
      headers: generateHeaders(apiKey || undefined),
    },
  );
  const wallet = (await getWallet.json()) as Wallet | null;
  return wallet;
};

export const fetchAddresses = async (names: string[], isTestnet: boolean, apiKey?: string): Promise<Wallet[]> => {
  const getWallets = await fetch(`${API_URL}/v${VERSION}/address/names${testnetParam(isTestnet)}`, {
    method: 'POST',
    headers: generateHeaders(apiKey || undefined),
    body: JSON.stringify(names),
  });
  const wallets = (await getWallets.json()) as Wallet[];
  return wallets;
};

export const fetchCluster = async (
  name: string,
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<Cluster | null> => {
  const fetchCluster = await fetch(`${API_URL}/v${VERSION}/cluster/${name}${testnetParam(isTestnet)}`, {
    headers: generateHeaders(apiKey || undefined),
  });
  const cluster = (await fetchCluster.json()) as Cluster | null;
  return cluster;
};

export const fetchClusters = async (
  names: string[],
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<Cluster[]> => {
  const fetchClusters = await fetch(`${API_URL}/v${VERSION}/cluster/names${testnetParam(isTestnet)}`, {
    method: 'POST',
    headers: generateHeaders(apiKey || undefined),
    body: JSON.stringify(names),
  });
  const clusters = (await fetchClusters.json()) as Cluster[];
  return clusters;
};

//

export const fetchNameAvailability = async (
  name: string,
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<NameAvailability> => {
  const getData = await fetch(`${API_URL}/v${VERSION}/register/check/${name}${testnetParam(isTestnet)}`, {
    headers: generateHeaders(apiKey || undefined),
  });
  const data = (await getData.json()) as NameAvailability;
  return data;
};

export const fetchNameAvailabilityBatch = async (
  names: string[],
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<NameAvailability[]> => {
  const getData = await fetch(`${API_URL}/v${VERSION}/register/check${testnetParam(isTestnet)}`, {
    method: 'POST',
    headers: generateHeaders(apiKey || undefined),
    body: JSON.stringify(names),
  });
  const data = (await getData.json()) as NameAvailability[];
  return data;
};

export const fetchRegistrationTransaction = async (
  names: RegistrationName[],
  sender: string,
  network: Network,
  referralAddress?: `0x${string}`,
  apiKey?: string,
): Promise<RegistrationResponse> => {
  const getData = await fetch(`${API_URL}/v${VERSION}/register`, {
    method: 'POST',
    headers: generateHeaders(apiKey || undefined),
    body: JSON.stringify({
      names,
      sender,
      network,
      referralAddress,
    }),
  });
  const data = (await getData.json()) as RegistrationResponse;
  return data;
};

export const fetchTransactionStatus = async (
  tx: `0x${string}`,
  isTestnet: boolean = false,
  apiKey?: string,
): Promise<{
  tx: `0x${string}`;
  status: RegistrationTransactionStatus;
}> => {
  const getData = await fetch(`${API_URL}/v${VERSION}/register/tx/${tx}${testnetParam(isTestnet)}`, {
    headers: generateHeaders(apiKey || undefined),
  });
  const data = (await getData.json()) as { tx: `0x${string}`; status: RegistrationTransactionStatus };
  return data;
};
