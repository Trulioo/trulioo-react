/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

import axios from 'axios';
import * as R from 'ramda';
import { GET_COUNTRIES, GET_FIELDS } from './types';
import {
  DAY_OF_BIRTH, MONTH_OF_BIRTH, YEAR_OF_BIRTH, DOB, DOB_TITLE,
} from './constantDateFields';
import getSelectedCountry from './getSelectedCountry';

const dateFieldsMap = new Map();
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

let BASE_URL;
let apiHeaders;

const getCountryByIp = async () => {
  const URL = `${BASE_URL}/api/countryByIP`;
  const result = await axios.get(URL, { headers: apiHeaders });
  return result;
};

const reservedFormDataKeys = ['countries', 'TruliooFields', 'Consents'];

/**
 * loads dropdown and fields associated based on user's IP
*/
const loadAndGetDefaultCountry = (url) => async (dispatch) => {
  BASE_URL = url;

  const accessToken = window && window.Trulioo && window.Trulioo.accessToken;
  const publicKey = window && window.Trulioo && window.Trulioo.publicKey;
  apiHeaders = {
    accessToken,
    publicKey,
  };
  const countryByIpResponse = await getCountryByIp();
  const countryCode = countryByIpResponse && countryByIpResponse.data
    && countryByIpResponse.data.country_code;
  const URL = `${BASE_URL}/api/getcountrycodes`;
  const promise = await axios.get(URL, { headers: apiHeaders });
  const sortedCountries = promise.data.response.sort();
  const selectedCountry = getSelectedCountry(countryCode, sortedCountries);

  dispatch({
    type: GET_COUNTRIES,
    payload: promise.data.response.sort(),
  });

  return selectedCountry;
};

const parseFields = (obj) => {
  for (const [key] of Object.entries(obj)) {
    // eslint-disable-next-line eqeqeq
    if (key == 0) {
      return;
    }
    if (key === 'label') {
      obj.title = obj[key];
    }
    parseFields(obj[key]);
  }
  return obj;
};

const dateFields = ['DayOfBirth', 'MonthOfBirth', 'YearOfBirth'];

const hasDOBInMap = () => {
  const dayOfBirthInMap = dateFieldsMap.get(DAY_OF_BIRTH);
  const monthOfBirthInMap = dateFieldsMap.get(MONTH_OF_BIRTH);
  const yearOfBirthInMap = dateFieldsMap.get(YEAR_OF_BIRTH);
  return dayOfBirthInMap && monthOfBirthInMap && yearOfBirthInMap;
};

const containsDOBRequired = (required) => required && required.includes(DAY_OF_BIRTH)
  && required.includes(MONTH_OF_BIRTH) && required.includes(YEAR_OF_BIRTH);

const updateDateRequiredArray = (obj) => {
  const { required } = obj;

  if (!obj.properties || !required) {
    return;
  }

  const containsDOB = containsDOBRequired(obj.required);
  if (containsDOB) {
    obj.required = required.filter((requiredField) => (requiredField !== DAY_OF_BIRTH
      && requiredField !== MONTH_OF_BIRTH && requiredField !== YEAR_OF_BIRTH));
    obj.required.push(DOB);
  }
};

/**
 * @param {*} obj the parsedFields objects to be converted, and their sequence
 */
const parseFieldDates = (obj) => {
  updateDateRequiredArray(obj);
  for (const [key] of Object.entries(obj)) {
    // eslint-disable-next-line eqeqeq
    if (key == 0) {
      return;
    }
    if (key === 'label') {
      obj.title = obj[key];
    }
    if (!dateFields.includes(key)) {
      parseFieldDates(obj[key]);
    } else {
      dateFieldsMap.set(key, true);
    }
    if ((key === DAY_OF_BIRTH || key === MONTH_OF_BIRTH || key === YEAR_OF_BIRTH)
      && hasDOBInMap()) {
      delete obj[DAY_OF_BIRTH];
      delete obj[MONTH_OF_BIRTH];
      delete obj[YEAR_OF_BIRTH];
      obj.DOB = {
        title: DOB_TITLE,
        type: 'string',
        format: 'date',
      };
    }
  }
  return obj;
};

const requestFields = async (countryCode) => {
  const URL = `${BASE_URL}/api/getrecommendedfields/${countryCode}`;
  const response = await axios.get(URL, { headers: apiHeaders });
  const parsedFields = parseFields(response.data.response);

  const copiedParsedFields = deepCopy(parsedFields);
  const parsedFieldDates = parseFieldDates(copiedParsedFields);
  return parsedFieldDates;
};

const updateStateProvince = (obj, subdivisions) => {
  Object.keys(obj).forEach((k) => {
    if (k === 'StateProvinceCode' && subdivisions.length > 0) {
      obj[k] = {
        ...obj[k],
        enum: subdivisions.map((x) => x.Code),
        enumNames: subdivisions.map((x) => x.Name),
      };
    } else if (obj[k] !== null && typeof obj[k] === 'object') {
      updateStateProvince(obj[k], subdivisions);
    }
  });
};

const requestSubdivisions = async (countryCode) => {
  const URL = `${BASE_URL}/api/getcountrysubdivisions/${countryCode}`;
  const response = await axios.get(URL, { headers: apiHeaders });
  const subdivisions = response.data.response;

  // sorting subdivisions by 'Name'
  return R.sortBy(
    R.compose(
      R.toLower,
      R.prop('Name'),
    ),
  )(subdivisions);
};

async function requestConsents(countryCode) {
  const URL = `${BASE_URL}/api/getdetailedconsents/${countryCode}`;
  const response = await axios.get(URL, { headers: apiHeaders });
  const consents = response.data.response;
  return consents;
}

const generateConsentSchema = (consents) => {
  if (!consents || !consents.length) {
    return;
  }
  const schema = {
    title: 'Consents',
    type: 'object',
    required: [],
    properties: {},
  };
  consents.forEach((x) => {
    schema.required.push(x.Name);
    schema.properties[x.Name] = {
      title: x.Text,
      type: 'boolean',
      default: false,
    };
  });
  return schema;
};

const validateAdditionalFields = (additionalFields) => {
  if (!additionalFields || !additionalFields.properties) {
    return;
  }
  const containsReservedKeys = R.intersection(
    Object.keys(additionalFields.properties), reservedFormDataKeys,
  );
  if (containsReservedKeys.length > 0) {
    throw Error(
      `${containsReservedKeys.toString()} is a reserved field key. Please use different naming for your additional fields.`,
    );
  }
};

const parseSubmitTruliooDateFields = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (key === DOB) {
      const splitDate = obj[key].split('-');
      const [year, month, day] = splitDate;
      obj[DAY_OF_BIRTH] = day;
      obj[MONTH_OF_BIRTH] = month;
      obj[YEAR_OF_BIRTH] = year;
      delete obj[DOB];
    }
    if (typeof obj[key] === 'object') {
      parseSubmitTruliooDateFields(obj[key]);
    }
  });
  return obj;
};

const parseTruliooFields = (formData) => {
  const truliooFields = {};
  Object.keys(formData).forEach((key) => {
    /* istanbul ignore else */
    if (reservedFormDataKeys.includes(key)) {
      truliooFields[key] = formData[key];
    }
  });
  // user has inserted DOB data
  if (hasDOBInMap()) {
    const parsedFieldsWithDates = parseSubmitTruliooDateFields(truliooFields);
    return parsedFieldsWithDates;
  }
  return truliooFields;
};


/**
 * Returns the json-schema friendly whitelisted fields
 *
 * @param {Trulioo fields} fields
 * @param {white-listed Trulioo Fields} whiteListedTruliooFields
 * @param {resulting object} whiteListedComputedFields
 */
const getWhiteListedFieldsOnly = (fields, whiteListedTruliooFields, whiteListedComputedFields) => {
  Object.keys(whiteListedTruliooFields).forEach((key) => {
    const keyExists = Object.prototype.hasOwnProperty.call(fields, key);
    // key is not contained in fields
    if (!keyExists) {
      return;
    }
    const hasDefinedChildren = Object.keys(whiteListedTruliooFields[key]).length > 0;
    if (hasDefinedChildren) {
      whiteListedComputedFields[key] = {};
      if (fields.title) {
        whiteListedComputedFields.title = fields.title;
      }
      if (fields.type) {
        whiteListedComputedFields.type = fields.type;
      }
      if (fields.required) {
        const childProperties = Object.keys(whiteListedTruliooFields.properties);
        const whiteListedRequiredFields = fields.required
          .filter((requiredField) => childProperties.includes(requiredField));
        whiteListedComputedFields.required = whiteListedRequiredFields;
      }
      getWhiteListedFieldsOnly(
        fields[key], whiteListedTruliooFields[key], whiteListedComputedFields[key],
      );
    } else {
      whiteListedComputedFields[key] = fields[key];
    }
  });
  return whiteListedComputedFields;
};

const getFields = (
  countryCode, additionalFields, whiteListedTruliooFields,
) => async (dispatch) => {
  if (!countryCode) {
    return;
  }
  validateAdditionalFields(additionalFields);
  const fields = await requestFields(countryCode);
  const subdivisions = await requestSubdivisions(countryCode);
  let consents = await requestConsents(countryCode);
  consents = generateConsentSchema(consents);
  /* istanbul ignore else */
  if (fields && fields.properties) {
    updateStateProvince(fields.properties, subdivisions);
  }
  let finalFields = fields;
  if (whiteListedTruliooFields) {
    finalFields = getWhiteListedFieldsOnly(fields, whiteListedTruliooFields, {});
  }
  dispatch({
    type: GET_FIELDS,
    payload: {
      fields: finalFields,
      consents,
      additionalFields,
      formData: {
        countries: countryCode,
      },
    },
  });
};

const getCountryCode = (form) => {
  for (const [key, value] of Object.entries(form)) {
    if (key === 'countries') {
      return value;
    }
  }
};

const parseFormData = (form) => {
  if (form === undefined || form.TruliooFields === undefined) {
    return form;
  }
  if (form.TruliooFields.Document) {
    const docFront = form.TruliooFields.Document.DocumentFrontImage;
    form.TruliooFields.Document.DocumentFrontImage = docFront.substr(
      docFront.indexOf(',') + 1,
    );
    const docBack = form.TruliooFields.Document.DocumentBackImage;
    if (docBack) {
      form.TruliooFields.Document.DocumentBackImage = docBack.substr(
        docBack.indexOf(',') + 1,
      );
    }
    const livePhoto = form.TruliooFields.Document.LivePhoto;
    if (livePhoto) {
      form.TruliooFields.Document.LivePhoto = livePhoto.substr(
        livePhoto.indexOf(',') + 1,
      );
    }
  }
  if (form.TruliooFields.NationalIds) {
    form.TruliooFields.NationalIds = [form.TruliooFields.NationalIds];
  }
  return form;
};

const parseConsents = (consents) => {
  const result = [];
  if (consents === undefined) {
    return result;
  }
  Object.keys(consents).forEach((x) => {
    /* istanbul ignore else */
    if (consents[x]) {
      result.push(x);
    }
  });
  return result;
};

const getSubmitBody = (form) => {
  const countryCode = getCountryCode(form);
  form = parseFormData(form);

  return {
    AcceptTruliooTermsAndConditions: true,
    CleansedAddress: true,
    ConfigurationName: 'Identity Verification',
    CountryCode: countryCode,
    DataFields: form.TruliooFields,
    ConsentForDataSources: parseConsents(form.Consents),
  };
};

const submitForm = (form) => async () => {
  // deep copying form
  const formClone = deepCopy(form);
  const truliooFormData = parseTruliooFields(formClone);
  const body = getSubmitBody(truliooFormData);
  const URL = `${BASE_URL}/api/verify`;
  const promiseResult = await axios.post(URL, body, { headers: apiHeaders }).then((response) => ({
    ...response,
    body,
  }));
  return promiseResult;
};

export {
  submitForm, getSubmitBody, loadAndGetDefaultCountry as getCountries, getFields,
};
