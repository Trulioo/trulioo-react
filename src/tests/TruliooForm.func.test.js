import React from 'react';
import EmbedID from '../EmbedID';
import renderer from 'react-test-renderer';
import axios from 'axios';
import * as mocker from './mock_api'

jest.mock('axios') 
mocker.mockApi()

it('renders countries as a select element', async () => {
  const embedID = await renderer.create(<EmbedID url='http://localhost:3111' handleResponse={e => { }} />);
  expect(axios.get).toBeCalled();
  const instance = embedID.root;

  instance.find(e => {
    const { props } = e;
    if (props === undefined) {
      return false;
    }
    return props.id === 'root_countries' && e.type === 'select'
  })
});