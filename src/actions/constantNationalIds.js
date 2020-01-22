/* eslint-disable max-len */

// TODO - add tests for this file

const idTypes = {
  nationalId: 'NationalID',
  health: 'Health',
  socialService: 'SocialService',
  taxIdNumber: 'TaxIDNumber',
};

const nationalIdNamesByCountry = {
  CN: 'National ID Number',
  FI: 'PIC',
  FR: 'InseeNumber',
  HK: 'Identity Number',
  MY: 'National Registration ID Card (NRIC) Number',
  MX: 'Clave Única de Registro de Población (CURP)',
  SG: 'National Registration ID Card (NRIC) Number',
  SE: 'Personal Identification Number (PIN)',
  ES: 'Documento Nacional de Identidad (DNI)',
  TR: 'Türkiye Cumhuriyeti Kimlik Numarası (T.C. Kimlik No.)',
  IN: 'Aadhaar Card Number',
};

const healthNamesByCountry = {
  AU: 'Australia Medicare',
  GB: 'NHS Number',
};

const socialServiceNamesByCountry = {
  AU: 'Tax File Number',
  CA: 'Social Insurance Number',
  IE: 'Personal Public Service Number',
  IT: 'Codice Fiscale',
  MX: 'Registro Federal de Contribuyentes (Tax Number)',
  GB: 'National Insurance Number (NI)',
  US: 'Social Security Number',
  RU: 'Individual insurance account number, SNILS (11 Digits)',
  IN: 'Permanent Account Number (PAN)',
};

const taxIdNumberNamesByCountry = {
  RU: 'Taxpayer Personal Identification Number, INN (12 digits)',
};

const convertToNameTypeObjectArray = (natIdNameObject, type) => Object.fromEntries(
  Object.entries(natIdNameObject).map((natIdEntry) => {
    // eslint-disable-next-line no-param-reassign
    natIdEntry[1] = [
      {
        name: natIdEntry[1],
        type,
      },
    ];
    return natIdEntry;
  }),
);

const mergeObjectsWithSameKey = (...objects) => objects.reduce((combinedObject, currentObject) => {
  Object.keys(currentObject).forEach((key) => {
    // eslint-disable-next-line no-param-reassign
    combinedObject[key] = combinedObject[key]
      ? combinedObject[key].concat(currentObject[key])
      : currentObject[key];
  });
  return combinedObject;
});

/**
 * GG national ID names are not accurate to the actual names for each country, so we
 * map them ourselves until a solution is provided through GG.
 *
 * For example, social security number is given for many countries where it's not called
 * social security number (Russia is SNILS, GG gives SSN, etc.).
 *
 * Returns object of the form
 *
 * {
 *  <countryCode>: [
 *    {
 *      name: <name of id>,
 *      type: <type of id>
 *    },
 *    ...
 *  ],
 *  ...
 * }
 */
const combineTypesToSingleObject = () => {
  const nationalIdObject = convertToNameTypeObjectArray(nationalIdNamesByCountry, idTypes.nationalId);
  const healthObject = convertToNameTypeObjectArray(healthNamesByCountry, idTypes.health);
  const socialServiceObject = convertToNameTypeObjectArray(socialServiceNamesByCountry, idTypes.socialService);
  const taxIdObject = convertToNameTypeObjectArray(taxIdNumberNamesByCountry, idTypes.taxIdNumber);

  return mergeObjectsWithSameKey(nationalIdObject, healthObject, socialServiceObject, taxIdObject);
};

module.exports = combineTypesToSingleObject();
