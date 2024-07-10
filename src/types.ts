export type Wallet = {
  address: string;
  type: 'evm' | 'solana';
  name: string;
  isVerified: boolean;
};

export type Cluster = {
  name: string;
  profileUrl: string;
  imageUrl: string;
  hasCustomImage: boolean;
  wallets: Wallet[];
};

export type Network =
  | '1'
  | '10'
  | '56'
  | '137'
  | '8453'
  | '81457'
  | '17000'
  | '42161'
  | '43114'
  | '11155111'
  | 'solana';

export type NameAvailability = {
  name: string;
  isAvailable: boolean;
};

export type RegistrationName = {
  name: string;
  bidWeiAmount?: string;
};

export type RegistrationTransactionData_evm = {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
};

export type RegistrationTransactionData_solana = {
  recentBlockhash: string;
  feePayer: string;
  nonceInfo: null;
  instructions: [
    {
      keys: [
        {
          pubkey: string;
          isSigner: boolean;
          isWritable: boolean;
        },
        {
          pubkey: string;
          isSigner: boolean;
          isWritable: boolean;
        },
      ];
      programId: '11111111111111111111111111111111';
      data: number[];
    },
    {
      keys: [
        {
          pubkey: string;
          isSigner: true;
          isWritable: true;
        },
      ];
      programId: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
      data: number[];
    },
  ];
  signers: [];
};

export type RegistrationResponse = {
  gasToken: {
    symbol: string;
    decimals: number | 'lamports';
  };
  transactionData: RegistrationTransactionData_evm | RegistrationTransactionData_solana[];
  registrationFee: string;
  bridgeFee: string;
  names: {
    name: string;
    amount: string;
  }[];
};

export type RegistrationTransactionStatus = 'not_found' | 'pending' | 'bridging' | 'invalid' | 'lost_bid' | 'finalized';
export type RegistrationTransactionStatusResponse = {
  tx: `0x${string}`;
  status: RegistrationTransactionStatus;
};
