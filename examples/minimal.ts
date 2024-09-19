import Arweave from 'arweave';
import ArLocal from 'arlocal';
import * as dotenv from 'dotenv';
dotenv.config();

let genKey = {
  kty: 'RSA',
  n: 'xcbHmBHDOpZC_MrZBP8teGARiVxx2PPNL2mt6TFcpNLDoeGDTYq3KEWOsAew1r9M3zbTNpmEKlB_4he9wVUJvUOxHFMQWH-lUtCz_3RDm-d0VPLmKdgAGN8xEjn4C2q1-fqFndlxVzsllr36Fys0gWcpim8bdb9z4X0y_nzl2aDvX6wk8AfXlRNHYweUW9MpxP2aENv6ZVfHgmTstbAXgoM6sB7UvqPITC4oYzU1kxmPFaTQe2mXv_9iiklyPnl284uljKwG7DWvFxxSHcm52oFx9glM8m1lZMVcZE06CTMZKaD9K_vsmoxYQTUxzO6-aFAueOzaXp8ze4HxUuT3FrvoOD0ICodN0gQf_r0_MjflEwMPlWruNRO2dv7yEDnTLCwdkUTVZdhoyHjMcAeZ8xAYiomo-ILKeBcVEqDTbaxR2n5dI6OZMMb1VmgCX8DBkZZoDHzdfaymcxeBuRaXUeTGM5greNkLelWSAIcFGwWQYv9DiwEe2hawco3lHqGaTtdfSyS1kvXSuUNFggdI6SdFn4mE4G_EXoZ2VJwAhQD3y5Z2IRONU10NdEhZ-mUzFyQhFtmN2_aig45sSPChgfRPR0kIyD5ssdKClWKYtGSFq15_6o5tRhCpRaDuDX_jIIFRNNmJ7tRe5clHxtwdCiLMjvJY2RIu1wm-TpfDUvs',
  e: 'AQAB',
  d: 'D_44QbA3oCAEIFRFVfjnzZlaXns4d__730U_QcfMfN-crK7pyUMNKjDsJ7vxE7LtUNeQ7BQtJdoHA8EO7SvAcxE4QnKATeFa_LMElNG4B346xmvMXot2M1l8RF1y4dyqBO7tqYtEQqn1XjBt1G9mYL7drLFTZrz2oYzx3lAHRKDI-p_9bkbHRIM5Y8t6UC3OB0n8Q9GMeNZIu3ih06D-8n53wao2L4kn0OrV0gy8qldUxL4XkpzbuQDtdpuxC1asxQEAs1ShGRTP3Dr3QPiarA3vqaLfsz-5a66x_yjN9DrkYmnMT0EHkjyeUZeVnioBziAKjs8u0WjNgJB_c66XdGPQBbcVr3jblibcEpKF9eFSpJPcw1JbaRGjDz3I9i_uV45JBwprGHA0DTGLC3fNTM_7VJeiBp6S88RPWOvyM0X3aeHS7gmyoTuyPPczO873mDU9BQAyKxmQp9ZHWEhGVd4rGYfSJNj5YQkL6kV5f7fPGf7OwAhjHCNVbb4bCOSihLL_MGo-hqkZJOH9mQ3mIveSarGnd4tTx7slXFbeAmPGc8hX9w21dL1-bWZ8ycaqfvnSGpo2bgXjwrFkMtd_y9ATXTBxjIzVRhYoqfaD_Vn-nzu4p7DsmiIYHKishhwBDwPsIFbwlAW3ZR8X9UqkUlioNyDpTJZxuGX_pTDaUaE',
  p: '9-UHYKLIBNXLvATRWYZipMvKnOMBqyGlk3seSYNa7N7hCtxOxBKtPRa0mv47uNfojoN0FfZvhjgfM8dcXQE0N9aM5u4nIcLo4SMyJUl_ko5q5FFxxs9upINPuaSdUxq454rLCNYelUHGW5fJhksln-4cX_JQPfI8E-cFl10MnnjgnV_3rNxR-GIpsbuFml8zQOt-Z4UgSz0p-f3CQOuCnR0sCOx73oJd4SzzZ-KVNodIShsXrB4hbL_8qFvCR3TDNaY4-fsoJ4m8ak-42GkuOKYYvEX0HpuliluA-R3iRTZ0nwxVk11gNJgUrHuS45bCWMN0pbX8i84HXO5aZP6EYw',
  q: 'zD4-N5E_uGdqqIhROQhhKdg_wcsT-awggI3ZPOj2EG5MpTd--Dkp3mcq_tDNePqCb2mfpq2ddWAhs16KQ4QLuwhS7DMTKUBGtA2VXIH4off83Imx-W7WzDYpKCYZmTziqObedU2Dnkg-ZkpbkhRFXc61A7fZDZFMmrMdTPruateOJqRT1-R-jKVjf2kvNY4jrvJHbQ7cUJOn1pih_urnSpkLsxLXxRWpOzARV-0wpvo3LSJScOEKxLFcx1GItEr6nHYPuoa_N-W8OKsd9z4UhNWGHZqo-ZxX4MwUaxWTNxUFJMxYzEipwfJ2we5diuPAkE_yxQgTeGmjsSNtJo--iQ',
  dp: 'fL5Ytw1TH_PCISw_eRCCBTG0FLy7MzWsT4nOFOov0DDcCA4S6OIJIUuSuMgkn4Cuu0B1IzQurNkDAphY50ha0Zp6rx66vGeLrvd6HX9d3g8ixSAi5AuwPsMBVIb80DwLPiD-yMSPAUbnHWJFe_nGxjMZPkL-lB2Yk99WVfPyDLEBPtBzHx6DdT1Yg-K8eZFchle69TbtqE7wF6fVn7ujr5JlfVwbfT4XJd_r4KQJuDXdb8UwZWGIKmR2LPZ3zmN4dD_gPhNgAn1yPgE-IFDVfJZArkV5cgmbBQPE5BdgrLmZeAvJ6G09o1nAVYedxD8yL160DUuF-YhE9kPPYzEcxw',
  dq: 'ELUSv9bo4HvNNMYZ5tFxqUugQ4kKNEVJT1rLJ3ljD4sGSAmXIFUEwMWttbR86mWLn_OC9M6E7-ISP6r_InC9yOnwZpPzAE_auMXXrv6OySkRDTVSUrYnagMQMNGVDHz3iZuBHRVfK-Z6_EEe5n80AW10Tz6NyddV7d2zCuYH9MN3RF_y39k4JOcukXCYRQhAkQIOp7Qsf4bkluBbeA_dJbQJSffDoMKZ2lafRJMJhM85Dj8dgVBXYimkDkX0KdNsVrotpTN6lub7E6OjyuLQKOGSm_9XzTtl0OTA0tWr-jiE-DKjHOrgwBXGcyy9iCwDR4rSsB1uAk6Z7laYiiv-CQ',
  qi: '4uf0owblyN2ONkDDGgleE3VV2f7csXpgaiIC4RUiHGM74u5zTaoIvH7XPpgKN_GZN2b4N5VzisctOtiR3L6_nO7IzLlttKV5hrYDsPxL8TV63X4NsYaArXJ9LhzS5vGTDQ0yzTUPRiguDUvH0szFzN1YDrHf_FQ230XTKUTLo5ChwikoGH_8In9MoxBzEv4XLSU4qg_4W-U9vjWEfCHJT6mHjlz5KGUfv7beRv2r255od3BJUkooiUJkW03Fcwi4_nPZORksFCXOc-x_0Tj9j6VtZpb7eDiQR4FtJzNDOocrmnb0xNnqunLk3herUS71OdkRMtGt1L9jTW8kXUrOnQ',
};
let genAddress = 'dHcywbtGJsbWx_924jWJmKrfnIacXfT1eJi5mTyqswk';

/*let arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https', logging: true });
let key = await arweave.wallets.generate();
let address = await arweave.wallets.jwkToAddress(key);
console.log('Key:', key);
console.log('Address:', address);*/

/*(async () => {
  const arLocal = new ArLocal();
  await arLocal.start();

  let arweave = Arweave.init({ host: 'localhost', port: 1984, protocol: 'http' });

  let key = JSON.parse(process.env.AR_UPDATES_KEY as string);
  let address = await arweave.wallets.jwkToAddress(key);
  console.log('Uploader Address:', address);

  await fetch(`http://localhost:1984/mint/${address}/10000000000000`);

  let data = JSON.stringify({ message: 'Hello World' });

  let transaction = await arweave.createTransaction({ data: data }, key);
  transaction.addTag('Content-Type', 'application/json');

  await arweave.transactions.sign(transaction, key);

  let isValid = await arweave.transactions.verify(transaction);
  console.log('is TX valid:', isValid);
  console.info('txid:', transaction.id);
  console.log(transaction);

  const response = await arweave.transactions.post(transaction);
  console.log(response);

  await arLocal.stop();
})();*/

let arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https', logging: true });

//let key = JSON.parse(process.env.AR_UPDATES_KEY as string);
let address = await arweave.wallets.jwkToAddress(genKey);
console.log('Uploader Address:', address);

let data = JSON.stringify({ message: 'Hello World' });

let transaction = await arweave.createTransaction({ data: data }, genKey);
transaction.addTag('Content-Type', 'application/json');

await arweave.transactions.sign(transaction, genKey);

let isValid = await arweave.transactions.verify(transaction);
console.log('is TX valid:', isValid);
console.info('txid:', transaction.id);
console.log(transaction);

const response = await arweave.transactions.post(transaction);
console.log(response);

/*let uploader = await arweave.transactions.getUploader(transaction);
while (!uploader.isComplete) {
  await uploader.uploadChunk();
  console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
}*/
