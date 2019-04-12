import React from 'react';
import TruliooForm from './components/TruliooForm';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(reduxThunk))
);

export default function EmbedID(props) {
    return <Provider store={store}>
        <TruliooForm handleResponse={props.handleResponse} url={props.url} />
    </Provider>
}
