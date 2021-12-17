import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import AddAccount from '@/views/AddAccount.vue';
import Home from '../views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
  },
  {
    path: '/add-account',
    name: 'Add Account',
    component: AddAccount,
    beforeEnter: ((to) => {
      console.log(to);
      const keys = ['consent', 'application-user-id', 'user-uuid', 'institution'];
      if (!keys.every((key) => Object.keys(to.query).includes(key))) return '/';
      return true;
    }),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
