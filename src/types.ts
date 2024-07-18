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
