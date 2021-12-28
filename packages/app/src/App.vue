<template>
<!-- <div> -->
  <!-- <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/login">Login</router-link>
  </div> -->
    <n-config-provider :theme-overrides="themeOverrides" style="height: 100%;">
      <router-view/>
    </n-config-provider>
<!-- </div> -->

</template>
<script lang="ts">
import { useStore } from '@/store';
import { computed } from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NConfigProvider, GlobalThemeOverrides } from 'naive-ui';
import User from './store/models/User';
import router from './router';

export default {
  name: 'App',
  components: {
    NConfigProvider,
  },
  setup() {
    const themeOverrides: GlobalThemeOverrides = {
      common: {
        primaryColor: '#ea4c89',
        primaryColorHover: '#bb3d6e',
        primaryColorPressed: '#bb3d6e',
      },
    };
    const store = useStore();
    const user = computed(() => store.$repo(User).all());
    if (user.value.length === 0) {
      router.push('/login');
    }
    return {
      themeOverrides,
    };
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
