<template>
  <div class="grid grid-rows-2 gap-4 font-bold">
    <div class="font-bold">
      <div class="mb-2">
        You pay
      </div>
    <n-input  size="large" autofocus default-value="100">
      <template #prefix>
        <n-icon>
          £
        </n-icon>
      </template>
      <template #suffix >
        GBP
      </template>
    </n-input>
    </div>
    <div>
      <div class="mb-2">
        You receive
      </div>
      <n-input readonly size="large" default-value="150" >
        <template #suffix >
          DAI
        </template>
      </n-input>
    </div>

  </div>
  <div class="mt-5">
    <NButton type="primary" class="text-white w-full">
      Buy Dai
    </NButton>
  </div>
</template>
<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { NInput, NIcon, NButton } from 'naive-ui';

export default {
  components: {
    NInput,
    NIcon,
    NButton,
  },
};
</script>
<style scoped>
/* .n-input {
  --border: none!important;
} */

.n-button {

}
</style>
