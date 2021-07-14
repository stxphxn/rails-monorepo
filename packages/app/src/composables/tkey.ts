// import ThresholdKey from '@tkey/default';
// import TorusStorageLayer from '@tkey/storage-layer-torus';
// import BaseServiceProvider from '@tkey/service-provider-base';
import TorusServiceProvider from '@tkey/service-provider-torus';
import { LOGIN_TYPE } from '@toruslabs/torus-direct-web-sdk';
// import WebStorageModule from '@tkey/web-storage';
// import ethers from 'ethers';

type LOGINS = 'google';

const verifiers = {
  google: {
    name: "Google",
    typeOfLogin: "google",
    clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
    verifier: "google-lrc",
    jwtParams: {},
  },
}

const serviceProvider = new TorusServiceProvider({
  directParams: {
    baseUrl: `${window.location.origin}/serviceworker`,
    enableLogging: true,
    proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', // details for test net
    network: 'testnet', // details for test net
  },
});

export const useServiceProvider = async (typeOfLogin: LOGINS) => {
  const { clientId, verifier, jwtParams }: any = verifiers[typeOfLogin];

  await serviceProvider.triggerHybridAggregateLogin({
    singleLogin: {
      typeOfLogin,
      verifier,
      clientId,
      jwtParams,
    },
    aggregateLoginParams: {
      aggregateVerifierType: 'single_id_verifier',
      verifierIdentifier: 'tkey-google',
      subVerifierDetailsArray: [
        {
          clientId: '221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com',
          typeOfLogin: 'google',
          verifier: 'torus',
        },
      ],
    },
  });
}

export const handleLogin = async () => {
  // triggers google login.
 
};