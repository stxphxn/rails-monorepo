import authCall from '../utils/authCall';

const url = 'https://api.yapily.com/consents';

type Consent = {
  consentToken: string,
  expiresAt: string,
  id: string,
  institutionConsentId: string,
}


export const fetchConsentToken = async (userId: string, institutionId: string): Promise<Consent> => {
  const queryParams = {
    'filter[applicationUserId]': [userId].toString(),
    'filter[institutionId]': [institutionId].toString(),
  }
  const paramsString = new URLSearchParams(queryParams).toString();
  const query = `${url}/${paramsString}`;
  const response = await authCall(query);
  const {consentToken, expiresAt, id, institutionConsentId} = response.data[0];
  const consent = {
    consentToken,
    expiresAt,
    id,
    institutionConsentId,
  }
  return consent;
};