<template>
  <div class="flex flex-col h-full">
    <div class="basis-1/3 place-content-center">
      <Balance />
    </div>

  </div>
</template>

<script lang="ts">
import Balance from '@/components/Balance.vue';

export default {
  components: {
    Balance,
  },
  name: 'home',
  setup() {
    return {
      Balance,
    };
  },
};
</script>
