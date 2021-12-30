<template>
<div class="bg-gray-100 rounded-3xl h-14 w-full grid grid-cols-12">
  <div
    class="col-span-3"
  >
    <n-avatar
      round
      class="border-2 border-black"
      :size="56"
      :src="label.icon"
    />
  </div>
  <div class="col-span-5 grid grid-rows-2 gap-1">
    <div class="pt-1 font-bold">
      {{ label.name }}
    </div>
    <div class="text-sm">
      {{ bank.type }}
    </div>

  </div>
  <div class="col-span-4 place-self-center font-bold">
    £{{bank.balance}}
  </div>
</div>
</template>
<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { NAvatar } from 'naive-ui';
import { useStore } from '@/store';
import Bank from '@/store/models/Bank';

export default {
  name: 'BankItem',
  components: {
    NAvatar,
  },
  setup() {
    const store = useStore();
    const bank = store.$repo(Bank).all()[0] as Bank;

    const mapLabels = {
      'halifax-sandbox': {
        name: 'Lloyds Bank',
        icon: 'https://images.yapily.com/image/170bd6f9-4716-43d7-b9cc-af19d606857c',
      },
    };
    return {
      bank,
      label: mapLabels['halifax-sandbox'],
    };
  },
};
</script>
