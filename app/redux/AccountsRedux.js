import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';

const { Types, Creators } = createActions({
  authenticateAccount: ['account', 'password'],
  setAuthenticateResult: ['result'],
  setAccount: ['account'],
  logout: null,
  setLoginState: ['state'],
  setServer: ['server'],
  pingServer: null,
});

export const AccountsTypes = Types;
export default Creators;

export const INITIAL_STATE = Immutable({
  server: 'https://keeper.mpdl.mpg.de/api2/',
  account: '',
  authenticateResult: null,
  loginState: '',
});

/* ------------- Reducers ------------- */

export const setServer = (state = INITIAL_STATE, action) => 
  state.merge({
    server: action.server,
  });

export const setAuthenticateResult = (state = INITIAL_STATE, action) =>
  state.merge({
    authenticateResult: action.result,
  });

export const setAccount = (state = INITIAL_STATE, action) =>
  state.merge({
    account: action.account,
  });

export const setLoginState = (state = INITIAL_STATE, action) =>
  state.merge({
    loginState: action.state,
  });

/* ------------- Hookup Reducers To Types ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_SERVER]: setServer,
  [Types.SET_AUTHENTICATE_RESULT]: setAuthenticateResult,
  [Types.SET_ACCOUNT]: setAccount,
  [Types.SET_LOGIN_STATE]: setLoginState,
});
