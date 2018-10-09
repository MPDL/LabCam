import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';

const { Types, Creators } = createActions({
  fetchDestinationLibrary: null,
  setDestinationLibrary: ['destinationLibrary'],
  fetchLibraries: null,
  setLibraries: ['libraries'],
  fetchDirectories: ['library', 'paths'],
  recursiveFetchDirectories: ['library', 'paths'],
  setParentDir: ['parentDir'],
  setPaths: ['paths'],
  selectDirectories: ['paths'],
});

export const LibraryTypes = Types;
export default Creators;

export const INITIAL_STATE = Immutable({
  destinationLibrary: null,
  libraries: [],
  parentDir: null,
  paths: [],
});

/* ------------- Reducers ------------- */

export const setDestinationLibrary = (state = INITIAL_STATE, action) =>
  state.merge({
    destinationLibrary: action.destinationLibrary,
  });

export const setLibraries = (state = INITIAL_STATE, action) =>
  state.merge({
    libraries: action.libraries,
  });

export const setParentDir = (state = INITIAL_STATE, action) =>
  state.merge({
    parentDir: action.parentDir,
  });

export const setDestinationPaths = (state = INITIAL_STATE, action) =>
  state.merge({
    paths: action.paths,
  });

/* ------------- Hookup Reducers To Types ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_DESTINATION_LIBRARY]: setDestinationLibrary,
  [Types.SET_PARENT_DIR]: setParentDir,
  [Types.SET_LIBRARIES]: setLibraries,
  [Types.SET_PATHS]: setDestinationPaths,
});
