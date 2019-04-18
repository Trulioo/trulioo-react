import axios from 'axios';

// proxy server must be running for these integration tests to pass successfully
// adjust the BASE_URL to match the address of your proxy server
const BASE_URL = 'http://localhost:3111';

it('countryCodes endpoint works', async (done) => {
  const endpoint = '/api/getcountrycodes';
  const response = await makeRequest(endpoint);
  expect(response).toBeTruthy();
  expect.assertions(1);
  done();
});

it('getConsents endpoint works', async (done) => {
  const country = 'IN';
  const endpoint = `/api/getdetailedconsents/${country}`;
  const response = await makeRequest(endpoint);
  expect(response).toBeTruthy();
  expect.assertions(1);
  done();
});

const makeRequest = async (endpoint) => {
  const URL = BASE_URL + endpoint;
  try {
    const response = await axios.get(URL);
    return response;
  } catch (err) {
    return false;
  }
};
