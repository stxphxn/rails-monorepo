<template>
  <div>
    {{ params }}
  </div>
</template>
<script lang="ts">
import { getUserRepo } from '@/store';
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();

    async function addAccount() {
      const userRepo = getUserRepo();
      const u = userRepo.all()[0];
      const user = await userRepo.save({
        publicAddress: u.publicAddress,
        consent: route.query.consent,
        institution: route.query.institution,
        userUuid: route.query['user-uuid'],
      });

      const bank = await user.fetchAccount();
      console.log(bank);
      router.push('/');
    }

    onMounted(async () => addAccount());
    return {
      addAccount,
      params: route.query,
    };
  },
};
</script>
