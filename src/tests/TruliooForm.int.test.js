import axios from 'axios';

it('makes requests to backend', async () => {
    expect.assertions(1);
    const response = await requestCountries()
    expect(response).toBeTruthy()
})

const requestCountries = async () => {
    const BASE_URL = "http://localhost:3111"
    const URL = `${BASE_URL}/api/countryCodes`
    try {
        let response = await axios.get(URL)
        return response
    } catch(err) {
        return false
    }
}