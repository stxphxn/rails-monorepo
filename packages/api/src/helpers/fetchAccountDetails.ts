import authCall from "../utils/authCall";
import { fetchConsentToken } from "./fetchConsentToken"
import {AccountIdentification} from '../types';

type AccountDetailsResponse = {
  accountIdentifications: AccountIdentification[],
  accountType: string,
  currency: string,
  name: string,
}

export const fetchAccountDetails = async (consentToken: string): Promise<AccountDetailsResponse> => {
  const response = await authCall('https://api.yapily.com/accounts', undefined, 'GET', consentToken);
  const {accountIdentifications, currency, accountType, accountNames} = response.data[0];
  return {
    accountIdentifications,
    accountType,
    currency,
    name: accountNames[0].name,
  };
}