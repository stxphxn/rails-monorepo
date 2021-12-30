<template>
  <div class="flex flex-col h-full">
    <div class="top-section flex items-center">
      <div class="m-auto">
        <Balance />
        <add-account-button />
      </div>
    </div>
    <div class="container p-6 text-left">
      <div class="text-left text-lg font-extrabold mb-3">
          🏦 Balances
      </div>
      <BankItem />
      <TokenList />
      <div>
        <Escrow />
      </div>
    </div>
  <Drawer />
  </div>
</template>

<script lang="ts">
import Balance from '@/components/Balance.vue';
import AddAccountButton from '@/components/AddAccountButton.vue';
import BankItem from '@/components/BankItem.vue';
import TokenList from '@/components/TokenList.vue';
import Escrow from '@/components/Escrow.vue';
import Drawer from '@/components/Drawer.vue';
import { getSellers, useGetLiquidity } from '@/composables/escrow';

export default {
  components: {
    Balance,
    BankItem,
    AddAccountButton,
    TokenList,
    Escrow,
    Drawer,
  },
  name: 'home',
  async setup() {
    const sellers = await getSellers();
    const liquidity = await useGetLiquidity(sellers);
    console.log(liquidity);
    return {
      sellers,
    };
  },
};
</script>

<style scoped>
.top-section {
  height: 33%;
}
</style>
