<template>
<div class="bg-gray-100 border-2 border-gray-200 rounded-lg w-full grid grid-cols-12 gap-3">
  <div
    class="col-span-3 bg-cover"
    :style="`background-image: url(${label.icon})`"
  >
  </div>
  <div class="col-span-5 grid grid-rows-3 gap-1">
    <div class="pt-1">
      {{ label.name }}
    </div>
    <div class="text-xs">
      {{ bank.type }}
    </div>
    <div class="text-xs">
      {{ bank.nickname }}
    </div>

  </div>
  <div class="col-span-4 place-self-center font-bold">
    £{{bank.balance}}
  </div>
</div>
</template>
<script lang="ts">
import { useStore } from '@/store';
import Bank from '@/store/models/Bank';

export default {
  name: 'BankItem',
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
