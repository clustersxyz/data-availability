import { AddressType } from '@clustersxyz/sdk/types/address';

export type V1RegistrationData = [
  number,
  'register',
  number,
  `0x${string}`,
  string,
  AddressType,
  string,
  number,
  number,
];
export type V1UpdateWalletData = [
  number,
  'updateWallet',
  number,
  `0x${string}`,
  string,
  AddressType,
  string,
  boolean,
  number,
];
export type V1RemoveWalletData = [number, 'removeWallet', number, `0x${string}`, string, AddressType, number];
export type V1EventData = V1RegistrationData | V1UpdateWalletData | V1RemoveWalletData;

export type UploadReceipt = {
  txids: string[];
  bundle: string;
};

export type IrysQuery = {
  addresses?: string[];
  fromTimestamp?: number;
  sort?: 'ASC' | 'DESC';
  fields?: {};
  limit?: number; // <= 1000
};

export type QueryResults = {
  id: string;
  timestamp: number;
};
