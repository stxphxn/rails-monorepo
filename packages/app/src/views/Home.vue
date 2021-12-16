<template>
  <div class="flex flex-col h-full">
    <div class="basis-1/3 place-content-center">
      <Balance />
      <add-account-button />
    </div>

  </div>
</template>

<script lang="ts">
import Balance from '@/components/Balance.vue';
import AddAccountButton from '@/components/AddAccountButton.vue';

export default {
  components: {
    Balance,
    AddAccountButton,
  },
  name: 'home',
  setup() {
    return {
      Balance,
    };
  },
};
</script>
