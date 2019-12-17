import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  getFields, submitForm, getSubmitBody,
} from '../../actions/index';
import { GET_FIELDS } from '../../actions/types';
import { mockApiWithDetailedConstents, mockApiWithoutConsents } from './mockApi';
import formSubmitDocV from './mock_payloads/formSubmitDocV.json';
import formSubmitPayloadWithConsents from './mock_payloads/formSubmitWithConsents.json';
import verifyResponseWithConsents from './mock_payloads/verifyResponseWithConsents.json';
import additionalFields from './mock_payloads/additionalFields.json';

// mocking proxy server responses
jest.mock('axios');

const countryCode = 'US';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  beforeAll(() => mockApiWithoutConsents());

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

  it('additionalFields are passed properly', () => {
    const store = mockStore({});
    const expectedActions = [{ type: GET_FIELDS }];
    return store.dispatch(getFields(countryCode, additionalFields)).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
    });
  });

  it('additionalFields cannot contain Trulioo reserved Fields', () => {
    const store = mockStore({});
    const additionalFieldsWithReservedKey = {
      ...additionalFields,
      properties: {
        Consents: 'I can override consents',
      },
    };
    return store.dispatch(getFields(countryCode, additionalFieldsWithReservedKey))
      .then(() => { throw new Error('Declared a reserved Trulioo Field and no error was thrown'); }, (error) => {
        expect(error.message).toEqual('Consents is a reserved field key. Please use different naming for your additional fields.');
      });
  });

  it('submit form action makes verify request and correctly parses results', () => {
    const expectedActions = [];
    const store = mockStore({});

    return store.dispatch(submitForm(formSubmitPayloadWithConsents)).then((result) => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
      const expectedResult = {
        ...verifyResponseWithConsents,
        body: getSubmitBody(formSubmitPayloadWithConsents),
      };
      expect(result).toEqual(expectedResult);
    });
  });

  it('getFields works correctly with a DocV payload', () => {
    const expectedActions = [];
    const store = mockStore({});

    return store.dispatch(submitForm(formSubmitDocV)).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
    });
  });

  it('getFields works correctly with a DocV payload without DocumentBackImage', () => {
    const expectedActions = [];
    const store = mockStore({});

    // formSubmitDocV without BackImage
    delete formSubmitDocV.TruliooFields.Document.DocumentBackImage;

    return store.dispatch(submitForm(formSubmitDocV)).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
    });
  });

  it('getFields works correctly with a DocV payload without LivePhoto', () => {
    const expectedActions = [];
    const store = mockStore({});

    // formSubmitDocV without BackImage
    delete formSubmitDocV.TruliooFields.Document.LivePhoto;

    return store.dispatch(submitForm(formSubmitDocV)).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
    });
  });
});

describe('Testing actions without detailed consents', () => {
  beforeAll(() => mockApiWithDetailedConstents());

  it('getFields makes getFields request and dispatches correct action', () => {
    const expectedActions = [];
    const store = mockStore({});

    return store.dispatch(submitForm(formSubmitPayloadWithConsents)).then((result) => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
      const expectedResult = {
        ...verifyResponseWithConsents,
        body: getSubmitBody(formSubmitPayloadWithConsents),
      };
      expect(result).toEqual(expectedResult);
    });
  });

  it('additionalFields are passed properly', () => {
    const store = mockStore({});
    const expectedActions = [{ type: GET_FIELDS }];
    return store.dispatch(getFields(countryCode, additionalFields)).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
    });
  });

  it('whiteListedTruliooFields are passed properly', () => {
    const whiteListedTruliooFields = {
      properties: {
        PersonInfo: {
          properties: {
            FirstGivenName: {
            },
          },
        },
      },
    };
    const store = mockStore({});
    const expectedActions = [{ type: GET_FIELDS }];
    return store.dispatch(
      getFields(countryCode, additionalFields, whiteListedTruliooFields),
    ).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
    });
  });

  it('non-existing whiteListedTruliooFields are handled correctly ', async () => {
    const whiteListedTruliooFields = { nonExistingField: {} };
    const store = mockStore({});
    const expectedActions = [{ type: GET_FIELDS }];
    return store.dispatch(
      getFields(countryCode, additionalFields, whiteListedTruliooFields),
    ).then(() => {
      const receivedActions = store.getActions();
      expect(expectedActions.length).toEqual(receivedActions.length);
    });
  });
});
