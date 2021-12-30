<template>
<div
  class="w-full h-14 bg-gray-100 rounded-3xl grid grid-cols-12 gap-3 my-3">
  <div
    class="col-span-3"
  >
      <n-avatar
      round
      class="border-2 border-black"
      :size="56"
      :src="token.icon"
    />
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
// eslint-disable-next-line import/no-extraneous-dependencies
import { NAvatar } from 'naive-ui';

export default {
  name: 'TokenList',
  components: {
    NAvatar,
  },
  setup() {
    const mapTokens = [
      {
        name: 'Dai Stablecoin',
        symbol: 'Dai',
        icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/svg/color/dai.svg',
      },
    ];

    return {
      token: mapTokens[0],
    };
  },
};
</script>
