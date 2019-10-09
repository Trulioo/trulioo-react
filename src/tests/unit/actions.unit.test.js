import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  getFields, submitForm, getBody,
} from '../../actions/index';
import { GET_FIELDS } from '../../actions/types';
import mockApi from './mockApi';
import formSubmitPayload from './mock_payloads/formSubmit';
import formSubmitPayloadWithConsents from './mock_payloads/formSubmitWithConsents';
import verifyResponse from './mock_payloads/verifyResponse';
import verifyResponseWithConsents from './mock_payloads/verifyResponseWithConsents';

// mocking proxy server responses
jest.mock('axios');
mockApi();

const countryCode = 'US';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  it('getFields makes getFields request and dispatches correct action', () => {
    const expectedActions = [{ type: GET_FIELDS }];
    const store = mockStore({});

    return store.dispatch(getFields(countryCode)).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
      expect(expectedActions[0].type).toEqual(receivedActions[0].type);
      expect(receivedActions[0].payload.fields).toBeDefined();
    });
  });

  it('submit form action makes verify request and correctly parses results', () => {
    // submit triggers no other actions
    const expectedActions = [];
    const store = mockStore({});

    return store.dispatch(submitForm(formSubmitPayloadWithConsents)).then((result) => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
      const expectedResult = {
        ...verifyResponseWithConsents,
        body: getBody(formSubmitPayloadWithConsents),
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
