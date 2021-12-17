import {
  Model, Str, Num, Attr,
} from '@vuex-orm/core';

export default class Bank extends Model {
  // This is the name used as module name of the Vuex Store.
  static entity = 'banks'

  @Str('')
  id!: string

  @Str('')
  userId!: string

  @Str('')
  type!: string

  @Num(0)
  balance!: string

  @Str('')
  currency!: string

  @Str('')
  nickname!: string

  @Attr({})
  accountNames: any

  @Attr({})
  accountIdentifications: any
}
