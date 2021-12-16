import { Model, Str, Num } from '@vuex-orm/core';

export default class Account extends Model {
  // This is the name used as module name of the Vuex Store.
  static entity = 'accounts'

  static primaryKey = 'publicAddress'

  @Str('')
  consent!: string

  @Str('')
  applicationUserId!: string

  @Str('')
  userUuid!: string

  @Str('')
  institution!: string

  @Num(0)
  balance!: number

  @Str('GBP')
  currency!: string
}
