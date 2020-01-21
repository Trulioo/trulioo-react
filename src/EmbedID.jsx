import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import PropTypes from 'prop-types';
import reducers from './reducers';
// eslint-disable-next-line import/no-named-as-default
import TruliooForm from './components/TruliooForm';

const store = createStore(reducers, applyMiddleware(reduxThunk));

export default function EmbedID({
  handleResponse, url, handleSubmit, additionalFields,
  whiteListedTruliooFields, uiSchema, buttonName,
}) {
  return (
    <Provider store={store}>
      <TruliooForm
        handleResponse={handleResponse}
        url={url}
        handleSubmit={handleSubmit}
        additionalFields={additionalFields}
        uiSchema={uiSchema}
        whiteListedTruliooFields={whiteListedTruliooFields}
        buttonName={buttonName}
      />
    </Provider>
  );
}

EmbedID.propTypes = {
  handleResponse: PropTypes.func,
  handleSubmit: PropTypes.func,
  url: PropTypes.string,
  additionalFields: PropTypes.objectOf(PropTypes.object),
  whiteListedTruliooFields: PropTypes.objectOf(PropTypes.object),
  uiSchema: PropTypes.objectOf(PropTypes.object),
  buttonName: PropTypes.string,
};

EmbedID.defaultProps = {
  handleResponse: false,
  url: true,
  handleSubmit: undefined,
  additionalFields: undefined,
  whiteListedTruliooFields: undefined,
  uiSchema: undefined,
  buttonName: 'Submit',
};
