/* eslint-disable import/no-cycle */
import { useGetAccount } from '@/composables/yapily';
import {
  Model, Str, HasOne, Repository,
} from '@vuex-orm/core';
import { store } from '..';
import Bank from './Bank';

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
  consent!: string

  @Str('')
  institution!: string

  @Str('')
  userUuid!: string

  @HasOne(() => Bank, 'userId')
  bank!: Bank

  get balance(): string {
    return this.bank ? this.bank.balance : '0';
  }

  async fetchAccount(): Promise<Bank> {
    const details = await useGetAccount(this.consent);
    console.log(details);
    const bankRepo = store.$repo(Bank) as Repository<Bank>;
    const bank = await bankRepo.save({
      id: details.id,
      userId: this.publicAddress,
      type: details.type,
      balance: details.balance,
      currency: details.currency,
      nickname: details.nickname,
      accountNames: JSON.stringify(details.accontNames),
      accountIdentifications: JSON.stringify(details.accountIdentifications),
    });
    return bank;
  }
}
