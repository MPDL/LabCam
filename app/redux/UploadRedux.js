import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';

const { Types, Creators } = createActions({
  uploadFile: ['photo'],
  setPhotos: ['photos'],
  batchUpload: ['photos'],
  setNetOption: ['netOption'],
  setOcrTextOnPause: ['ocrTextOnPause'],
});

export const UploadTypes = Types;
export default Creators;

export const INITIAL_STATE = Immutable({
  photos: [],
  netOption: 'Wifi only',
  ocrTextOnPause: '',
});

/* ------------- Reducers ------------- */
export const setPhotos = (state = INITIAL_STATE, action) =>
  state.merge({
    photos: action.photos,
  });

export const setNetOption = (state = INITIAL_STATE, action) =>
  state.merge({
    netOption: action.netOption,
  });

export const setOcrTextOnPause = (state = INITIAL_STATE, action) =>
  state.merge({
    ocrTextOnPause: action.ocrTextOnPause,
  });

/* ------------- Hookup Reducers To Types ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_PHOTOS]: setPhotos,
  [Types.SET_NET_OPTION]: setNetOption,
  [Types.SET_OCR_TEXT_ON_PAUSE]: setOcrTextOnPause,
});
