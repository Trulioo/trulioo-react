import axios from 'axios';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions/index'
import * as types from '../actions/types'
import * as mocker from './mock_api'

jest.mock('axios') 
mocker.mockApi()

const country = "IN"
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('async actions', async () => {
  it('getFields makes get requests and dispatches correct action', () => {
    const expectedActions = [{ type: types.GET_FIELDS }]
    const store = mockStore({  })

    return store.dispatch(actions.getFields(country)).then(() => {
        let receivedActions = store.getActions()
        expect(expectedActions.length).toEqual(receivedActions.length)
        expect(expectedActions[0].type).toEqual(receivedActions[0].type)
        expect(receivedActions[0].payload.fields).toBeDefined()
    })
  })
})