import { BigNumber } from "ethers";

interface Amount {
  amount: number,
  currency: string,
}

interface InternationalPayment {
  chargeBearer?: string,
  currencyOfTransfer: string,
  exchangeRateInformation?: {
    foreignExchangeContractReference?: string,
    rate?: number,
    rateType: string,
    unitCurrency: string,  
  },
  priority: string,
  purpose?: string,
}

export interface AccountIdentification {
  identification: string,
  type: string,
}

interface AccountInfo {
  accountId: string,
  accountIdentification: AccountIdentification,
}

interface Address {
  addressType? : string,
  buildingNumber? :string,
  country?: string,
  county?: string,
  department?:string,
  postCode?: string,
  streetName?: string,
  subDepartment?: string,
  townName?: string,
}

interface PeriodicPayment {
  finalPaymentAmount: {
    amount: number,
    currency: string,
  },
  finalPaymentDateTime?: string,
  frequency: {
    executionDay?: number,
    intervalMonth?: number,
    intervalWeek?: number,
    type: string,
  },
  nextPaymentAmount: {
    amount: number,
    currency: string,
  },
  nextPaymentDateTime?: string,
  numberOfPayment?: string,
}

interface AccountRequest {
  accountIdentifiers?: AccountInfo,
  accountIdentifiersForBalance?: AccountInfo[],
  accountIdentifiersForTransaction?: AccountInfo[],
  expiresAt?: string,
  featureScope?: string,
  transactionFrom?: string,
  transactionTo?: string,
}



export type PaymentRequest = {
  amount: Amount,
  contextType?: string,
  internationalPayment?: InternationalPayment,
  payee: {
    accountIdentifications:AccountIdentification[],
    address?: Address,
    merchantCategoryCode?: string,
    merchantId?: string,
    name: string,
  },
  payer?: {
    accountIdentifications: AccountIdentification,
    address?: Address,
    name: string,
  },
  paymentDateTime?: string,
  paymentIdempotencyId: string,
  periodicPayment?: PeriodicPayment,
  readRefundAccount?: boolean,
  reference?: string,
  type: string,
};

export type AccountAuthorisationRequest = {
  accountRequest?: AccountRequest,
  applicationUserId?: string,
  callback?: string,
  institutionId: string,
  oneTimeToken?: boolean,
  userUuid?: string,
} 

export type PaymentDetails = {
  amount: Amount,
  applicationUserId: string,
  institutionId: string,
  payeeInfo: {
    accountIdentifications: AccountIdentification[],
    name: string,
  }
  swapHash: string,
}

export type PaymentAuthResponse = {
  paymentRequest: any,
  authorisationUrl: string,
  id: string,
  userUuid: string,
};

export type SwapDetails = {
  buyer: string,
  seller: string,
  oracle: string,
  assetId: string,
  amount: number | BigNumber,
}

export type SwapInfo =  SwapDetails & {
  swapId: number,
}

export type SwapData = SwapInfo & {
  prepareBlockNumber: number,
  expiry: number,
}

export type CurrencyDetails = {
  exchangeRate: number,
  currency: string,
}

export type PrepareSwapRequestBody = {
  swapDetails: SwapDetails,
  institutionId: string,
  signature: string,
  callback: string,
}

export type PrepareSwapResponse = {
  prepareSignature: string,
  paymentAuth: PaymentAuthResponse,
  encodedSwapInfo: string,
  swapInfo: SwapInfo,
}