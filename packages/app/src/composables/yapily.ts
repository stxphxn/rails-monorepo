export const useAddAccount = async (
  address: string,
  institution: string,
  callback: string,
): Promise<void> => {
  const response = await fetch('http://127.0.0.1:8787/yapily/account-auth-requests', {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicationUserId: address,
      institutionId: institution,
      callback,
    }),
  });
  const { data: { authorisationUrl } } = await response.json();
  window.open(authorisationUrl, '_self');
};

export const useGetAccount = async (consent: string): Promise<any> => {
  const response = await fetch(`${process.env.VUE_APP_YAPILY_PROXY as string}accounts`, {
    method: 'GET',
    headers: {
      Consent: consent,
    },
  });
  const { data } = await response.json();
  return data[0];
};

export default useAddAccount;
