import * as dotenv from 'dotenv';
import { ClustersDA } from '../src/index';
import Arweave from 'arweave';
import ArLocal from 'arlocal';
dotenv.config();

const apiKey = process.env.CLUSTERS_API_KEY;

const manifestUploader = {
  kty: 'RSA',
  n: 'jiYbJqCQemLih_UEytjZDBETjAB4inbGOpiyMo5fmG9wChF3CDKNiOy75iFEfVuEu4hSGbPbonoWjYKp0s4F5UdEEyK1x7BqerrdwUD3viuak7p_pNgoe54SUWey9NuAByWoejHBB4zkg7-YEe83E3tLYqPMiKScTiZq2ZTFDznHlT4Po8DxorKP1LnVXA1i3T03w4prbD29cl762_3s9pnXgCWpwqod4bzUcvG9DmHu4Vzg4mBKakAf1EOJlOL8DKD3jwXmOFyQq8CWixrPLBTAIMnaa0hrKs2cgaZAZ8vwnNjeDW5LYk0185Vz3I5AsJL9TVwcjTw3xRDDTFbrALHGf4ZDdrebBYdODtOayrbpKKGga78YK5P7RVOPv8j_D0XnXibR0DodbIe7aKm0Czp9Xk0BCuEGV1d89cBvP1GVEQcd6didEg5fcGie1BGQ3UxLluNHC0jhDWcjiqSrnOrNOi5vNWagpcN6wU342gcPsrINjMsVpQrqWfeCkPrG7V8MHxnkSci1VT1bqgNvQfAvYpTOQ0qFafYjqZ32Yv0bb1WSUu49UmWO1AkgNbPg8Hfd_99lpGHB9ga2sFKe9ODMWOrgB9ip3ah-C4FIxsTKonusPSoyBGtFDp7_H3PABFbrkMBJivW25djQXOHST36xE9FcnQu_F7k-XBUicO0',
  e: 'AQAB',
  d: 'QD9e5C2MP5S0GIkY2mn6Z-bL8-o-kS6v18ouOIV7FZXAiPxt1Wmr6Og-4PvGTfZwXqZ1nSJasewGh304Loxpw8BbN17n1FKbPc957R_lGbHxkrWnfaUpXv4J_3skOmF_UzulE12rhjMbEaUmIW0Ccq62WuX3ywbDktrwTllcW85cs8qyHOxXCpc0RQydL5bpSV-i9aF5fhnFp4zgS1BQqwDLkyLywIZNLTtAtpcmQProkjl9dzPYTn-fIzxHUeDp1PdoDN-4t163ELniEQtT-fODBw7UxsqbjWQTSdIPqBpYLTwj2OQx9EM7kFXLYTN2b5hwHmf0i61c85fo_XcHjcNW79YfEb6UqQW9pBUYG6uWbWw_Liy_UL-kZNA7AwHGOETUG-tSqvWAsLItxMqIga4aWt-j8aU9kR5A_CSjUoHhq5DL5HNfBrutqK_Y7cbsU-kM7nuf-pUkVHAR2C78VQf7h7uzJ08ObW0Y-obCeuLLx1ChZtXA_EkwcVzAZD2VdU8V3PkbnE7D8HAe7ADFXT9mrJ9x840xnPKt1GRr3ySqedPEZTuXeRwB9PvI1FPPKigFgkxlRYxPkPSSMW9iWZ70DQuncBqkObS_6PF8XxmewGqHuueHoQfsICe4v5Y6Yef-UBk8x6_-FN_CYv7dhyhKgFsFpD6y5srjlbatq-0',
  p: 'wWcy54ZqFnN4LAE8l81DBSHB5KlOa8cuvSAty_tkCQLeTpddi2YSD8mu6OUqqh_RqLo5x2JGbFh3uua8pTX9V9uZ_nFrnYM6kbZQrrtejUyUF8xhHwUdEuzhoC_OQXsszkVoqXrwjyP9T7ut9Po2R637FUNhkidCtwZAqGEaP5wfDy63Ybruzq7W5Ruczz02755_iIDN9kzma4oPQXWPLCqwNkzEoU6T92QufSC5HUz_ekOBtt8ipEy_wwJpwP7uLUMw1GuxT5pAV9BG_7KTCGQQDiDHrvRZGB_Cxx0ZmqSVPNuhgVjgBZU43qMcEe2iiG82sOYioKKfCDFOfwbI9w',
  q: 'vCgh8Vyb0Chb_uoboM5p45fx9pjWnO3YVWpl8BGude8fmBymlTpOIYPIYat2RGWUUbZX4mzUFqfJOqYfMwefWyrVai7w7GXnVMxHTfJhGH5frlTzwBIRA1x7Ll_pfoVilUvVS00JP_FT7HzMowbERFmIJOujJQU3n558vVVlkTpJG9pLGHoz2UbYDbST22G9qY_6ry7hkQ3TxHJAwx9Id92DQNrHDliVLOo-Iftaxe0N_koFAiFjzB-Lh8V5Zi5Xq6F1mKrFTBXO5cHCqXOyM7QI2GHeC4O0Dr9ZNLi-VxA_2ZQakOgjYdE01JIoHA4kaWeMVzaSt904pMrqUpbgOw',
  dp: 'sD-nuC5aR5N7FD8cRQqd5PNai1NvT_D4uwm0MowqIbwnc1-ls_-UviaB62PMebT9j9IGDZmVq-8DTaQwji6hbYuGzsX12Fla6qdG57WA-SusWfO7HlW-pRySkTR_tlTWBDRkqO6MgyW9FwhmAzZyeOgoRLxfEp4MwlZEXi3_ibBw7ZkZLUr5jgjvdWKwiHu0sLG0b2VSTP7PjXkHZhQIIavVYeab2pSNa4o0g3tqtzUQLQ-QCmNWYnw-1SxBy8uGqmDtAugRcgWUVXJNAYBvVdo6d2WQE_RBrSZkjqgKSU9rYUaV7BZeMThH1zy1u_DfiY4wPQ28yL7qRsEIU-KPCQ',
  dq: 'AeRZawbmXjJ5sleCTZylve8iNLuWtN9DZKB8Q-y5l1__LlVja265qGad1jWWK9vloOi3e4RioZOwV1GiUK4L8Su-F6I_M_FWYSjosqT0Sv3CUotyJAVKfIEqj-3Q-D-5HQ01KNuucyEnGeKrYBxKTvGjh9OCwXWK-KTsVi8MpWgzof8Q8D8SVGX8-C5Pqk4STSkweSB8jivYbEpF0nB3FxV4I2fPxponbdsxIsBXSlQ25s6xvDK_wSa0DXpz3Q4sPYKTHyTgdQJnITJQlcmfChwOVratN-psHhXYfMo6x79XFQYDOl_LM0maQWTy2E1gGls7MwlOcmDcF_QeZRQ1Tw',
  qi: 'Yoxrtl0Sfo38_b_Eq4KJbpL5DKv9oRYoc4BzZjCvthHmccCu32tw3dXBETPHOGPr3sHGlGu_TXc9DaKkoR1xAlW_lX0_ndmcAa8e7k1qk9VLIvT0MKj75H60qEmuvaM4IH8t-J0fcFNAvFwCQVJx_0OKUZCFNYUYgu6pKh5Sk8uQsB48YAqRFM1mUnufB4BZZ1G5-gnPqVOutFoSHbPdgqMLNcoNjJq3HsefQXh5fgvLYRKP4JyYYuOGkEUzh0iHfw7aqlsh5hZBYBk8l3LA9eFQ28jIcgVB2iIqKbfvbyDGEEVXCczyGc2slc0Dp4ZLrODfHONIRmRYI0qqw19Gtw',
};

const eventUploader = {
  kty: 'RSA',
  n: 's4ftAvIIXi4uNb5LLdXjyApVa5r5s7kLQHsAmiUjJvIJDjCAhxkSN4zupOWXbRCDy3RISz1s7_wX1Z9lCwfft_19ZYwAYWJGJ1P3g5R0xNRGiOnxdzUECRlOWdaS8WOdY_o3YcIzwQJY5Q7LrUOF4UZ7wBlVAn378IyXwgUKggFWcow3JOhfa-Xq8UJINnNTcwGKxuPZ-wiObbUeV2HKiQuQqlL0n1OI2SA9bEdMF3Su7mrCM5V9qjIWerJdTyeQ9VpXisxd152h1UpTq3mgtl8DFNLbZhtVUXs6sUH0eSg9sushMg5cm6Gpyo5v5zPpuPFuJPgLJt7ik2yn50417YJN5gCnneKkEy678ogHY7InIIF2LQK1JrqLO1381D2xZtiHa-64FDyJ8wW9ycxLvz9MWBudEVXp8vaR7dUECqUltVxf3ccMMRYLVHQ0CxfPlQyBdcc5G-L7vFYYNaAILk9uahS6LjeXpdSIZvvbKRzgg1_8-gjfM_AAmYJGUCZCx9jrJklH4TtTOt9MsIR1rQeMoCPB-wTiXdk0wIdfhFEG90ROvFjqs-OueIohheHLVPZYJKrpkSP-68_dlkMXd0-QFU1yOh9-8WvuzTL6AeCmEE_5LVw2E6qAmK3DCQewij-GS7h3R1QD2SYZvda8ZgJPWnFtCZhWYJzARHTzHkk',
  e: 'AQAB',
  d: 'FHCd0e-Hd12PokvLmGjZOa2_gvROiKFBQDKg42vmACmfUU_BWmBG3C89_mUrY930-2V-U56nN_1-IzK2GNbpKDQColyZsHy1WwXq0L7GuqAmdbEY7kcJchXA_2Z4LWZ3hWn4AzfOl6NyRoX0N4JQDFFvhnP740A_vmfrYUoco6eOVZVUM-4G6yxuntA6k4R21EmxKKrJZxTWznPIBA_ctNStwE6Yjkk-8-WBSMInTiZZQkjCWogjGg0A1TBYgkoRbXW_MMzKxGEsizGerA-5dfoESkslco8bHB9JE-Rb9q1XtPajPWU4MvnpcGfeIrcc3ZMTRL8-2cqXhkxhI2sapYJXhep-q1-SUjoa_jiUEycriBwuV84Mt1W1xB6Dyhn6V_4uGYYfdEIMPMVeX-ay1-HxIMxzD5uTX6Ecv8KFrtBo0R7YO84fQdpezQE3rl2BnUBo6boQvhrVUzYtnEVZvdjL6hJrjnU837oJ_vc8277ZicPzZDLPBoJA6A_-C070D6-XHc36Js6pPyRHLvJK_MlgBAu14_7x5tsXwfVvSegYPafkIz2kFztTPYJVSAJt-sAMtBImXecTHwf0FQpPhRY9GjcmLV_4WTWVW1Q6cN42PBLRPV-sCZ4jUGvpd9QH1LPomaiHT4sCtQqn3xkR4BvXuPv-UaqRij46sSsBjbc',
  p: '7RaQot9DxVaHNuXnffolO8ttyqg98HbYYy0l2HBVxzgI9Tyhrwal9DKKS9Ic1ZWr4IZGToES3jjGgXliFfNCyVRQeSvsXWTttm9bByEdCegjjbS2V7BAp_TJpG1uCi1Yhf3oQkVL6VAxQAvIIvyktN6R665eA6aNRlgqhIrr9s0tuyLa-P2v2P0rCx4cbpjPvbvma-ykJa1gJK6V2Qv9kdhuuNA3wJbVJ2ltb5Ig9bg6qI6lroRvQKtRUhfZXwT2gY7bOPC3SkUAIIcDh95RK9EgMTQU0SJFbi56iJSauyQDiYOzwDtwv3Iqrm5B-Ib-_TvUcykiPCbgyygmoTJjyw',
  q: 'wdoFIhBoCSx6toVAFEhv4G_LOIwYMeBAKCd8hrOIvxeIyoAZlO-I9UdF0A_3Pb2WLrBKvC61NlDpVNli9dNNw-q7CHNpDgK7qHXKzIQ3hYZSUwhN6Awv51lKB1OnC1AUtYfx6rEZ7a_GRhlluyVmr-kU_9IywIsRj7kQE9c9hMqdtrBz5gSNVwMgH_6j9E90i9nEytNpMuQqMARfThjPqIy0SPDiTT9Fh4l6sVcZCiFM-lkcfQ7Bq0xlFgitAmHzQI684FMs4fbyewZRTtLZFVc8SRAOM7YdG2c3Ta_-BXiv9brDtbVyE7G1JTXGzUcd_BNoxXSeIWOjk7yKHj-Luw',
  dp: 'LbKjvkD6dxbuiQ5XSFjmxFe5mc5D4g2GN9eD6-v7HKMYVuyQ3YOSiTcUoPimxiRLNMOs2YTXdi3LVTloRoLU5KlzuWdV78p8ZyWfjgg76KTt9WpXmx9F1xm_pAnTo_KJlYoTMnLY5uemFoou0U-RD6u2xI6fYGTB5kUoLNP6F2AE6IUXX9bGBjUGDuaG5Gpf4FpPV44NNZXtaiScjXFaNrpY3RaFKIHqI-aWSWMJJ1OTOtoD5Vdxei2LRx-BrmbufJpkdt0u9wnFtH9RluarDp8IbXN0b7sDVvFufNTn3hpa9C6Gfw719HC0-VoXLSgYDgdyM6BCEQYNXhsnFvr3cQ',
  dq: 'I5AStwAZhe1SCeACNHZhh-QafSI-YhAI1RUBZFjVcnEn2DaN-uPC1XSg2x3CtuHsBl6zJzjOZ8uKMtW6sOx17MZIT7GUiUx5DtulO8XZxbYxrifs2vA5bZDU4uk20P18_xyUhgC9h_xiPIP2RNIEt6rj_laalvYsX5iM2Yb4Mz9UlapjaMRXBap-H0CA5ZYaBHoL_0Wvm_V9w9dZgKNOnVZK0MLYUWGVKNtQ1e3rmw8m5xqn_k1RvFJEjTlEPBaqIKLPBbxclIvQSj-LdRF7X83kMmcuo8_6IQfbfnYV_Pz6EvOTaeeCqRhF6jCmawxr9M2-v9K4G9oCrVy-XfQ8dw',
  qi: 'gCnftAFp8EwskFcmqR7AMRenmdlHI1a5ZfV7H6uMzx7bemqM2Lsn_mR4fXKwsthQS0ySuvofLhnHE87BmAgmLy3_x4llq-wyLNrJRzUVbeVe4RPgjiV2GP6p3Fsw1VSz0Qddsl_FhbuLRCaMPfR3RFTQl9frAIoc2Vi1SMsKqFeWDwIYLcO0T-9-3oYKmHQYs6HPSjIPQjRBUAhIx-lW3M_S0f8Bb7SDxNZJugW2_-6NgQYASj96W-ubPBd7JENLKJ6BVulIf2ulCHdyBoQUGgTdrDjGSYXWTfBkmzp_IT5bE6vZ6DnU6X7CF0mmYiLifV5qnAaOSioDVzjxn4VKyA',
};

const arweaveRpc = {
  host: 'localhost',
  port: 1984,
  protocol: 'http',
};

(async () => {
  const arLocal = new ArLocal();
  await arLocal.start();

  const arweave = Arweave.init(arweaveRpc);
  const manifestAddress = await arweave.wallets.jwkToAddress(manifestUploader);
  const eventAddress = await arweave.wallets.jwkToAddress(eventUploader);
  console.log('Manifest Uploader Address:', manifestAddress);
  console.log('Event Uploader Address:', eventAddress);

  const da = new ClustersDA({
    apiKey: apiKey,
    manifestUploader: manifestUploader,
    eventUploader: eventUploader,
    arweaveRpc: arweaveRpc,
  });

  await fetch(`http://${arweaveRpc.host}:${arweaveRpc.port}/mint/${manifestAddress}/10000000000000`);
  await fetch(`http://${arweaveRpc.host}:${arweaveRpc.port}/mint/${eventAddress}/10000000000000`);

  const events = await da.getEvents({ limit: 5 });
  const newEvents = await da.getEvents({ limit: 5, nextPage: events.nextPage as string });
  const eventBundle = await da.getEvents({ limit: 10 });

  const eventsUpload = await da.uploadEvents(events);
  if (!eventsUpload.isComplete) throw new Error(`Events upload failed.`);

  const manifestUpload = await da.pushToManifest([eventsUpload]);
  if (!manifestUpload.isComplete) throw new Error(`Manifest upload failed.`);

  let currentManifest = await da.getCurrentManifest();
  const initialRead = await da.getFileIds(currentManifest.map((item) => item.id));
  if (JSON.stringify(events.items) !== JSON.stringify(initialRead[0])) {
    throw new Error(`Retrieved events do not match API response.`);
  }

  const newEventsUpload = await da.uploadEvents(newEvents);
  if (!newEventsUpload.isComplete) throw new Error(`New events upload failed.`);

  const updateManifest = await da.pushToManifest([newEventsUpload]);
  if (!updateManifest.isComplete) throw new Error(`Manifest update failed.`);

  currentManifest = await da.getCurrentManifest();
  const newRead = await da.getFileIds(currentManifest.map((item) => item.id));
  if (JSON.stringify(newEvents.items) !== JSON.stringify(newRead[1])) {
    throw new Error(`Retrieved events do not match API response.`);
  }
  if (
    JSON.stringify([...events.items, ...newEvents.items]) !== JSON.stringify([...newRead[0], ...newRead[1]]) ||
    JSON.stringify(eventBundle.items) !== JSON.stringify([...newRead[0], ...newRead[1]])
  ) {
    throw new Error(`Retrieved events are out of order`);
  }

  // Verify manifest data
  if (currentManifest.length !== 2) {
    throw new Error(`Manifest should contain 2 entries, but contains ${currentManifest.length}`);
  }
  if (currentManifest[0].id !== eventsUpload.id || currentManifest[1].id !== newEventsUpload.id) {
    throw new Error(`Manifest IDs do not match uploaded event IDs`);
  }
  if (
    currentManifest[0].startTimestamp !== eventsUpload.startTimestamp ||
    currentManifest[0].endTimestamp !== eventsUpload.endTimestamp ||
    currentManifest[1].startTimestamp !== newEventsUpload.startTimestamp ||
    currentManifest[1].endTimestamp !== newEventsUpload.endTimestamp
  ) {
    throw new Error(`Manifest timestamps do not match uploaded event timestamps`);
  }

  console.log('Test successful!');

  await arLocal.stop();
})();
