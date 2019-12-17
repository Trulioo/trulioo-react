/* istanbul ignore file */
import axios from 'axios';
import getCountryCodes from './mock_payloads/getCountryCodes.json';
import getRecommendedFields from './mock_payloads/getRecommendedFields.json';
import getCountrySubdivisions from './mock_payloads/getCountrySubdivisions.json';
import getDetailedConsents from './mock_payloads/getDetailedConsents.json';
import verifyResponse from './mock_payloads/verifyResponse.json';

const response = (data) => ({ status: 200, data: { response: data } });

const mockApi = (
  getCountryCodesPayload,
  getRecommendedFieldsPayload,
  getCountrySubdivisionsPayload,
  getDetailedConsentsPayload,
  verifyResponsePayload,
) => {
  axios.get.mockImplementation((url) => {
    if (url.includes('getcountrycodes')) {
      return Promise.resolve(response(getCountryCodesPayload));
    }
    if (url.includes('getrecommendedfields')) {
      return Promise.resolve(response(getRecommendedFieldsPayload));
    }
    if (url.includes('getcountrysubdivisions')) {
      return Promise.resolve(response(getCountrySubdivisionsPayload));
    }
    if (url.includes('getdetailedconsents')) {
      return Promise.resolve(response(getDetailedConsentsPayload));
    }
    /* istanbul ignore next */
    return Promise.reject();
  });
  axios.post.mockImplementation((url) => {
    if (url.includes('verify')) {
      return Promise.resolve(verifyResponsePayload);
    }
    /* istanbul ignore next */
    return Promise.reject();
  });
};

export const mockApiWithDetailedConstents = () => mockApi(
  getCountryCodes,
  getRecommendedFields,
  getCountrySubdivisions,
  getDetailedConsents,
  verifyResponse,
);

export const mockApiWithoutConsents = () => mockApi(
  getCountryCodes,
  getRecommendedFields,
  getCountrySubdivisions,
  {},
  verifyResponse,
);
