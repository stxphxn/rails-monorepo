import authCall from "../utils/authCall";


type paymentRequest = {
  amount: {
    amount: number,
    currency: string,
  }, 
  contextType?: string,
  internationalPayment?: {
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
  },
  payee: {
    accountIdentifications: {
      identification: string,
      type: string,
    },
    address?: {
      addressLines? : string,
      addressType? : string,
      buildingNumber? :string,
      country?: string,
      county?: string,
      department?:string,
      postCode?: string,
      streetName?: string,
      subDepartment?: string,
      townName?: string,
    },
    merchantCategoryCode?: string,
    merchantId?: string,
    name: string,
  },
  payer?: {
    accountIdentifications: {
      identification: string,
      type: string,
    },
    address?: {
      addressLines? : string,
      addressType? : string,
      buildingNumber? :string,
      country?: string,
      county?: string,
      department?:string,
      postCode?: string,
      streetName?: string,
      subDepartment?: string,
      townName?: string,
    },
    name: string,
  },
  paymentDateTime?: string,
  paymentIdempotencyId: string,
  periodicPayment?: {
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
  },
  readRefundAccount?: boolean,
  reference?: string,
  type: string,
};

const paymentAuth = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }

  const body = await request.json();

  const reqBody = {
    applicationUserId: body.applicationUserId,
    institutionId: body.institutionId,
    callback: 'https://display-parameters.com/',
    paymentRequest: body.paymentRequest as paymentRequest,
  };

  const data = await authCall('https://api.yapily.com/payment-auth-requests', reqBody, 'POST');
  const json = JSON.stringify(data);

  return new Response(json,
    {
      headers: {
        "content-type": "application/json"
      }
    });
};

export default paymentAuth;