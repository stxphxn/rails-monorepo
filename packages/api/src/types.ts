type Amount = {
  amount: number,
  currency: string,
}

type InternationalPayment = {
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

type AccountIdentifications = {
  identification: string,
  type: string,
}

type Address = {
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

type PeriodicPayment = {
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



export type PaymentRequest = {
  amount: Amount,
  contextType?: string,
  internationalPayment?: InternationalPayment,
  payee: {
    accountIdentifications:AccountIdentifications,
    address?: Address,
    merchantCategoryCode?: string,
    merchantId?: string,
    name: string,
  },
  payer?: {
    accountIdentifications: AccountIdentifications,
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