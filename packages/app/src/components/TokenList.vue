<template>
<div
  v-for="token in labels"
  :key="token.name"
  class="w-full grid grid-cols-12 gap-3 mb-3">
  <div
    class="col-span-3 bg-contain bg-no-repeat bg-clip-padding p-2"
    :style="`background-image: url(${token.icon})`"
  >
  </div>
  <div class="col-span-5 grid grid-rows-2 gap-1">
    <div class="pt-1 font-bold">
      {{ token.name }}
    </div>
    <div class="text-sm text-gray-400">
      1.14785937 {{ token.symbol }}
    </div>

  </div>
  <div class="col-span-4 place-self-center font-bold">
    £3200.56
  </div>
</div>
</template>
<script lang="ts">

export default {
  name: 'TokenList',
  setup() {
    const mapTokens = [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/svg/color/eth.svg',
      },
      {
        name: 'Dai Stablecoin',
        symbol: 'Dai',
        icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/svg/color/dai.svg',
      },
    ];

    return {
      labels: mapTokens,
    };
  },
};
</script>
