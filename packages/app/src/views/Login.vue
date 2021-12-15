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
import TorusServiceProvider from '@tkey/service-provider-torus';
import { useStore } from '@/store';
import User from '@/store/models/User';
// import ethers from 'ethers';

export default {
  name: 'login',

  setup() {
    const store = useStore();
    console.log(store);
    const userRepo = store.$repo(User);

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

      const loginDetails = await serviceProvider.triggerLogin({
        typeOfLogin: 'google',
        verifier: 'google-lrc',
        clientId: '221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com',
      });

      console.log(loginDetails);
      await userRepo.save({
        publicAddress: loginDetails.publicAddress,
        privateKey: loginDetails.privateKey,
        name: loginDetails.userInfo.name,
        email: loginDetails.userInfo.email,
      });
    };

    onMounted(async () => serviceProvider.init({ skipSw: false }));

    return {
      handleLogin,
    };
  },
};
</script>
