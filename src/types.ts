import { AddressType } from '@clustersxyz/sdk/types/address';

export type V1RegistrationData = [number, 'register', `0x${string}`, string, AddressType, string, number, number];
export type V1UpdateData = [
  number,
  'update',
  `0x${string}`,
  string,
  AddressType,
  string | null,
  string | null,
  boolean,
  number,
];
export type V1EventData = V1RegistrationData | V1UpdateData;

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
