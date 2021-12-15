<template>
<div>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/login">Login</router-link>
  </div>
  <router-view/>
</div>

</template>
<script lang="ts">
import { useStore } from '@/store';
import { computed } from 'vue';
import User from './store/models/User';
import router from './router';

export default {
  name: 'App',

  setup() {
    const store = useStore();
    const user = computed(() => store.$repo(User).all());
    if (user.value.length === 0) {
      router.push('/login');
    } else {
      router.push('/');
    }
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
