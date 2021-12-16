<template>
  <div class="container mx-auto text-4xl font-bold">
    {{balance}}
  </div>
</template>
<script lang="ts">
import { getUser } from '@/store';

export default {
  name: 'Balance',
  setup() {
    const { balance } = getUser();
    return {
      balance,
    };
  },
};
</script>
