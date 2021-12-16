export const useAddAccount = async (
  address: string,
  institution: string,
  callback: string,
): Promise<void> => {
  console.log(process.env);
  const response = await fetch(`${process.env.VUE_APP_YAPILY_PROXY}account-auth-requests`, {
    method: 'POST',
    body: JSON.stringify({
      applicationUserId: address,
      institutionId: institution,
      callback,
    }),
  });
  const { data: authorisationUrl } = await response.json();
  window.open(authorisationUrl);
};

export default useAddAccount;
