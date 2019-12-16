import React from 'react';
import TestRenderer from 'react-test-renderer';
import { render, getByText } from '@testing-library/react';
import { TruliooForm, mapStateToProps } from '../../components/TruliooForm';
import EmbedID from '../../EmbedID';

describe('TruliooForm works correctly', () => {
  it('renders and node server URL are set correctly', async () => {
    const proxyURL = 'http://localhost:3111';
    const truliooForm = TestRenderer.create(
      <TruliooForm
        url={proxyURL}
        handleResponse={jest.fn()}
        schema={{}}
        fields={{ formData: { countries: ['CA', 'US'] } }}
        getCountries={jest.fn()}
        getFields={jest.fn()}
        submitForm={jest.fn()}
      />,
    );
    const rootInstance = truliooForm.root;
    expect(rootInstance.findByType(TruliooForm).props.url).toBe(proxyURL);
  });

  it('renders TruliooForm', async () => {
    const proxyURL = 'http://localhost:3111';
    const truliooForm = TestRenderer.create(
      <TruliooForm
        url={proxyURL}
        getFields={jest.fn()}
        submitForm={jest.fn()}
      />,
    );
    const rootInstance = truliooForm.root;
    expect(rootInstance.findByType(TruliooForm).props.url).toBe(proxyURL);
  });

  it('mapStateToProps generates JSON schema correctly', async () => {
    const additionalFields = {
      additionalFieldsProperty: 'additionalFieldsValue',
    };
    const consents = {
      consentProperty: 'consentValue',
    };

    const initialState = {
      getCountries: {},
      fields: {
        fields: {
          properties: {
          },
        },
        additionalFields,
        consents,
      },
    };

    const result = mapStateToProps(initialState);
    const expectedSchema = {
      type: 'object',
      properties:
      {
        countries:
        {
          title: 'Countries',
          type: 'string',
          enum: undefined,
          enumNames: undefined,
        },
        TruliooFields: { title: 'Properties', type: 'object', properties: {} },
        additionalFieldsProperty: 'additionalFieldsValue',
        Consents: { consentProperty: 'consentValue' },
      },
    };
    expect(result.schema).toEqual(expectedSchema);
  });
});
