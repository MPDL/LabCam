import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';

const { Types, Creators } = createActions({
  uploadFile: ['photo'],
  batchUpload: ['photos'],
  syncUploadProgress: null,
  setNetOption: ['netOption'],
  uploadError: ['error'],
});

export const UploadTypes = Types;
export default Creators;

export const INITIAL_STATE = Immutable({
  photos: [],
  netOption: 'Wifi only',
  error: '',
});

/* ------------- Reducers ------------- */
export const setNetOption = (state = INITIAL_STATE, action) =>
  state.merge({
    netOption: action.netOption,
  });

export const uploadError = (state = INITIAL_STATE, action) =>
  state.merge({
    error: action.error,
  });

/* ------------- Hookup Reducers To Types ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_NET_OPTION]: setNetOption,
  [Types.UPLOAD_ERROR]: uploadError,
});
