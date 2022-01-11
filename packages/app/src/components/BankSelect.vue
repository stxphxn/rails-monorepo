<template>
<n-modal v-model:show="showModal">
  <n-card title="Select Your Account" closable @close="handleClose">
    <div  v:for="bank in banks" v:key="bank" class="grid grid-cols-3">
      <div>
        {{ bank.name }}
      </div>
    </div>
  </n-card>
</n-modal>
</template>
<script lang="ts">
import { ref } from 'vue';
import { NModal, NCard } from 'naive-ui';

export default {
  components: {
    NModal,
    NCard,
  },
  setup() {
    const banks = [
      {
        institutionId: 'aibgb-sandbox',
        name: 'AIB',
        logo: '',
      },
      {
        institutionId: 'barclays-sandbox',
        name: 'Barclays',
        logo: '',
      },
      {
        institutionId: 'cumberlandbuildingsociety-sandbox',
        name: 'Cumberland Building Society',
        logo: '',
      },

      {
        institutionId: 'lloyds-sandbox',
        name: 'Lloyds Bank',
        logo: '',
      },
      {
        institutionId: 'mbna-sandbox',
        name: 'MBNA',
        logo: '',
      },
      {
        institutionId: 'natwest-sandbox',
        name: 'Natwest',
        logo: '',
      },
      {
        institutionId: 'revolut-sandbox',
        name: 'Revolut',
        logo: '',
      },
      {
        institutionId: 'rbs-sandbox',
        name: 'Royal Bank of Scotland',
        logo: '',
      },
      {
        institutionId: 'sainsburysbank-sandbox',
        name: 'Sainsbury\'s Bank',
        logo: '',
      },
      {
        instituitionId: 'tescobank-sandbox',
        name: 'Tesco Bank',
        logo: '',
      },
    ];

    const showModal = ref(true);
    return {
      showModal,
      banks,
    };
  },
};
</script>
