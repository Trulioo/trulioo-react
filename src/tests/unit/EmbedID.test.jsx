import React from 'react';
import TestRenderer from 'react-test-renderer';
import {
  render, fireEvent, getByText,
} from '@testing-library/react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge } from '@fortawesome/free-solid-svg-icons';
import { mockApiWithDetailedConstents } from './mockApi';
import EmbedID from '../../EmbedID';

jest.mock('axios');

describe('EmbedID renders correctly', () => {
  beforeAll(() => mockApiWithDetailedConstents());
  it('renders countries as a select element', async () => {
    const sectionExamplePayload = {
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
            title: 'What is your favourite color?',
            type: 'string',
            enum: ['red', 'yellow', 'blue'],
          },
        },
      },
    };
    const embedID = TestRenderer.create(
      <EmbedID
        url="http://localhost:3111"
        handleResponse={() => { }}
        handleSubmit={() => { }}
        additionalFields={sectionExamplePayload}
      />,
    );

    expect(axios.get).toBeCalled();
    const rootInstance = embedID.root;

    rootInstance.find((e) => {
      const { props } = e;
      if (props === undefined) {
        return false;
      }
      return props.id === 'root_countries';
    });
  });
});

describe('EmbedID events function properly', () => {
  beforeAll(() => mockApiWithDetailedConstents());

  it('is able to select from dropdown', async () => {
    const { container } = render(<EmbedID />);

    const dropdown = container.querySelector('.form-control');
    expect(dropdown).toBeTruthy();
    fireEvent.change(dropdown, { target: { value: 'CA' } });
  });

  it('is able to submit ', async () => {
    const { container } = render(<EmbedID handleResponse={jest.fn()} />);

    const submitBtn = container.querySelector('.btn.btn-info');
    expect(submitBtn).toBeTruthy();
    fireEvent.click(submitBtn, { target: { value: 'your_value_goes_here' } });
  });

  it('is able to submit without a define handleResponse function', async () => {
    const { container } = render(<EmbedID />);

    const submitBtn = container.querySelector('.btn.btn-info');
    expect(submitBtn).toBeTruthy();
    fireEvent.click(submitBtn, { target: { value: 'your_value_goes_here' } });
  });

  it('is able to apply styling provided an UISchema', async () => {
    const uiSchema = {
      countries: {
        'ui:title': 'Please select your country of residence: ',
        'ui:description': 'Country Selection',
      },
    };
    const { container } = render(<EmbedID uiSchema={uiSchema} />);
    const countriesLabel = getByText(container, /Please select your country of residence:/);
    expect(countriesLabel).toBeTruthy();
  });

  it('accepts whiteListedTruliooFields', async () => {
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
    const { container } = render(<EmbedID whiteListedTruliooFields={whiteListedTruliooFields} />);
    const submitBtn = container.querySelector('.btn.btn-info');
    expect(submitBtn).toBeTruthy();
  });

  it('is able to provide a custom React element in the UISchema', async () => {
    const complexElement = (
      <div>
        <FontAwesomeIcon icon={faThLarge} />
        {' '}
        Country select with custom Icon
      </div>
    );
    const uiSchema = {
      countries: {
        'ui:title': complexElement,
      },
    };
    const { container } = render(<EmbedID uiSchema={uiSchema} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('data-prefix')).toBe('fas');
  });

  it('renders EmbedID with pre-defined button label', async () => {
    const proxyURL = 'http://localhost:3111';
    const uiSchema = {
      countries: {
        'ui:title': 'Please select your country of residence: ',
        'ui:description': 'Country Selection',
      },
    };
    const buttonName = 'CustomButton';

    const { container } = render(
      <EmbedID
        url={proxyURL}
        getFields={jest.fn()}
        submitForm={jest.fn()}
        buttonName={buttonName}
        uiSchema={uiSchema}
      />,
    );
    expect(getByText(container, new RegExp(buttonName)));
  });
});
