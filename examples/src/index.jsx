import React from 'react';
import { render } from 'react-dom';
import { EmbedID } from '../../src/index';

const handleResponse = (e) => {
  // eslint-disable-next-line no-console
  console.log('Client Received Response: ', e);
};

const handleSubmit = (e) => {
  // eslint-disable-next-line no-console
  console.log('Submitted form: ', e);
};

// example additional fields section with required fields
const uiSchema = {
  countries: {
    'ui:title': 'Please select your country of residence: ',
  },
  TruliooFields: {
    Communication: {
      Telephone: {
        'ui:options': {
          inputType: 'tel',
        },
      },
      EmailAddress: {
        'ui:options': {
          inputType: 'email',
        },
      },
    },
  },
};

const additionalFields = {
  AdditionalFields: {
    title: 'Additional Fields',
    type: 'object',
    required: ['name', 'age'],
    properties: {
      name: {
        title: 'What is your name?',
        type: 'string',
      },
      age: {
        title: 'What is your age?',
        type: 'number',
      },
      color: {
        title: 'What is your favorite color?',
        type: 'string',
        enum: ['red', 'yellow', 'blue'],
      },
    },
  },
};

const whiteListedTruliooFields = {
  properties: {
    PersonInfo: {
      properties: {
        FirstGivenName: {},
        FirstSurName: {},
        DOB: {},
      },
    },
    Communication: {
      properties: {
        Telephone: {},
        EmailAddress: {},
      },
    },
  },
};
render(
  <EmbedID
    url={process.env.BASE_URL}
    handleResponse={handleResponse}
    handleSubmit={handleSubmit}
    whiteListedTruliooFields={whiteListedTruliooFields}
    additionalFields={additionalFields}
    uiSchema={uiSchema}
  />,
  document.getElementById('root'),
);
