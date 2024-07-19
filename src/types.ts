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

export type QueryResults = {
  id: string;
  timestamp: number;
};

export type IrysQuery = {
  tags?: { name: string; values: string[] }[];
  from?: string[];
  fromTimestamp?: number;
  toTimestamp?: number;
  sort?: 'ASC' | 'DESC';
  limit?: number; // <= 1000
  stream?: boolean;
  fields?: {
    id: boolean;
    token: boolean;
    address: boolean;
    receipt: {
      deadlineHeight: boolean;
      signature: boolean;
      timestamp: boolean;
      version: boolean;
    };
    tags: {
      name: boolean;
      value: boolean;
    };
    signature: boolean;
    timestamp: boolean;
  };
};
