<template>
  <div class="text-lg font-extrabold mb-3">
    📜 Escrow Contract
  </div>
  <div class="grid grid-rows-3">
    <div>
          Your Liqudity: 0 DAI
    </div>
    <div>
          Total Liquidity: {{ liquidity.totalLiquidity }} DAI
    </div>
    <div>
      Max Swap Available: {{ liquidity.largestswap }} DAI
    </div>
  </div>
</template>
<script lang="ts">
import { getSellers, useGetLiquidity } from '@/composables/escrow';

export default {
  async setup() {
    const sellers = await getSellers();
    const liquidity = await useGetLiquidity(sellers);
    return {
      liquidity,
    };
  },
};
</script>
