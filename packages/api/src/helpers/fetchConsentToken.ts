import authCall from '../utils/authCall';

const url = 'https://api.yapily.com/consents';


export const fetchConsents = async (userId: string, institutionId: string): Promise<string> => {
  const queryParams = {
    'filter[applicationUserId]': [userId].toString(),
    'filter[institutionId]': [institutionId].toString(),
  }
  const paramsString = new URLSearchParams(queryParams).toString();
  const query = `${url}/${paramsString}`;
  const response = await authCall(query);
  return response.data[0].consentToken;
};