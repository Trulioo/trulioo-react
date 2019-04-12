import axios from 'axios';

const countries = '["CA", "US"]';
const fields = '{ "title": "DataFields", "type": "object", "properties": { "Location": { "title": "Location", "type": "object", "properties": { "StateProvinceCode": { "type": "string", "description": "State of primary residence. US sources expect 2 characters. Australian sources expect 2 or 3 characters.", "label": "State" }, "PostalCode": { "type": "string", "description": "ZIP Code or Postal Code of primary residence", "label": "Postal Code" }}, "required": [ "PostalCode" ]}}}'
const subDivisions = '[{"code": "AL", "Name": "Alabama", "ParentCode": ""}, {"Code": "AK", "Name": "Alaska", "ParentCode": "" }]'
const consents = '[]'

const response = data => { 
  return {status: 200, data: { response: data } }
}

export const mockApi = () => {
    axios.get.mockImplementation((url) => {
        if (url.includes('countryCodes')) {
            return Promise.resolve(response(countries))
        }
        if (url.includes('getFields')) {
            return Promise.resolve(response(fields))
        }
        if (url.includes('countrysubdivisions')) {
            return Promise.resolve(response(subDivisions))
        } 
        if (url.includes('getConsents')) {
            return Promise.resolve(response(consents))
        } 
      });
}