import { Model, Str } from '@vuex-orm/core';

export default class User extends Model {
  // This is the name used as module name of the Vuex Store.
  static entity = 'users'

  static primaryKey = 'publicAddress'

  @Str('')
  name!: string

  @Str('')
  email!: string

  @Str('')
  publicAddress!: string

  @Str('')
  privateKey!: string

  @Str('')
  consentToken!: string

  get balance(): string {
    console.log(this);
    return '£1000.57';
  }
}
