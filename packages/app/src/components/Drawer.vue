<template>
    <n-drawer v-model:show="active" :width="502" height="auto" placement="bottom">
    <n-drawer-content title="BUY DAI">
      <BuyDai />
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts">
/* eslint-disable import/no-extraneous-dependencies */

import { ref } from 'vue';
import { NDrawer, NDrawerContent } from 'naive-ui';
import BuyDai from '@/components/BuyDai.vue';

export default {
  name: 'Drawer',
  components: {
    NDrawer,
    NDrawerContent,
    BuyDai,
  },
  setup() {
    const active = ref(false);
    const activate = () => {
      active.value = true;
    };
    return {
      active,
      activate,
    };
  },
};
</script>
