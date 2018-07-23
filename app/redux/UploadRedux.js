import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';

const { Types, Creators } = createActions({
  uploadFile: ['photo'],
  setPhotos: ['photos'],
  batchUpload: ['photos'],
});

export const UploadTypes = Types;
export default Creators;

export const INITIAL_STATE = Immutable({
  photos: [],
});

/* ------------- Reducers ------------- */
export const setPhotos = (state = INITIAL_STATE, action) =>
  state.merge({
    photos: action.photos,
  });

/* ------------- Hookup Reducers To Types ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_PHOTOS]: setPhotos,
});
