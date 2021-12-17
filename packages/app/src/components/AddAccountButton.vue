<template>
  <button
  class="rounded mt-6 p-3 bg-red-400 hover:bg-red-300 text-white font-bold"
  @click="addAccount">
  Add Account
  </button>
</template>
<script lang="ts">
import { getUser } from '@/store';
import { useAddAccount } from '@/composables/yapily';

export default {
  name: 'AddAccountButton',
  setup() {
    const { publicAddress } = getUser();
    const addAccount = async () => {
      await useAddAccount(publicAddress, 'halifax-sandbox', 'http://localhost:3000/add-account');
    };

    return {
      addAccount,
    };
  },
};
</script>
