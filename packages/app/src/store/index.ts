/* eslint-disable symbol-description */
import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import VuexORM from '@vuex-orm/core';
import VuexPersistence from 'vuex-persist';

// import database from './database';
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export interface StateInterface {
  counter: number
}

const vuexLocal = new VuexPersistence({
  key: 'rails',
  storage: window.localStorage,
  modules: ['entities'],
});

// define injection key
export const key: InjectionKey<Store<StateInterface>> = Symbol();

export const store = createStore<StateInterface>({
  plugins: [VuexORM.install(), vuexLocal.plugin],

  // enable strict mode (adds overhead!)
  // for dev mode only
  // strict: !!process.env.DEV,
});

export function useStore(): Store<StateInterface> {
  return baseUseStore(key);
}

export default function () {
  return store;
}
