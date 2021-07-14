<template>
  <div class="flex flex-col">
    Login Page
    <button @click="handleLogin">
      Login Button
    </button>
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue';
// import ThresholdKey from '@tkey/default';
// import TorusStorageLayer from '@tkey/storage-layer-torus';
// import BaseServiceProvider from '@tkey/service-provider-base';
import TorusServiceProvider from '@tkey/service-provider-torus';
// import WebStorageModule from '@tkey/web-storage';
// import ethers from 'ethers';

export default {
  name: 'login',

  setup() {
    console.log('loading');
    // const webStorageModule = new WebStorageModule();
    // const securityQuestionsModule = new SecurityQuestionsModule();
    // const shareTransferModule = new ShareTransferModule();
    const serviceProvider = new TorusServiceProvider({
      directParams: {
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
        proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', // details for test net
        network: 'testnet', // details for test net
      },
    });

    const handleLogin = async () => {
      // triggers google login.
      await serviceProvider.triggerHybridAggregateLogin({
        singleLogin: {
          typeOfLogin: 'google',
          verifier: 'google-lrc',
          clientId: '221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com',
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
    };

    onMounted(async () => serviceProvider.init({ skipSw: true }));

    return {
      handleLogin,
    };
  },
};
</script>
