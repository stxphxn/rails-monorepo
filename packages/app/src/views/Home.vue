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
          🏦 Account
      </div>
      <BankItem />
      <div class="text-left text-lg font-extrabold mt-8 mb-3">
          💸 Tokens
      </div>
      <TokenList />
    </div>

  </div>
</template>

<script lang="ts">
import Balance from '@/components/Balance.vue';
import AddAccountButton from '@/components/AddAccountButton.vue';
import BankItem from '@/components/BankItem.vue';
import TokenList from '@/components/TokenList.vue';

export default {
  components: {
    Balance,
    BankItem,
    AddAccountButton,
    TokenList,
  },
  name: 'home',
  setup() {
    return {
      Balance,
    };
  },
};
</script>

<style scoped>
.top-section {
  height: 33%;
}
</style>
