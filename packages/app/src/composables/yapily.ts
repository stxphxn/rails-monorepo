export const useAddAccount = async (
  address: string,
  institution: string,
  callback: string,
): Promise<void> => {
  console.log(process.env);
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
  const { data: authorisationUrl } = await response.json();
  console.log(authorisationUrl);
  // window.open(authorisationUrl);
};

export default useAddAccount;
