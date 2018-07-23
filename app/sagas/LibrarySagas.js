import { call, select, put } from 'redux-saga/effects';
import Immutable from 'seamless-immutable';
import { NavigationActions } from 'react-navigation';
import _ from 'lodash';
import { getDestinationLibrary, getLibraries, getDirectories } from '../api/LibraryApi';
import LibraryActions from '../redux/LibraryRedux';

export function* getDestinationLibrarySaga() {
  const { server, authenticateResult } = yield select(state => state.accounts);
  try {
    const destinationLibrary = yield call(getDestinationLibrary, server, authenticateResult);
  } catch (e) {
    console.log(e);
  }
}

export function* fetchLibrariesSaga() {
  const { server, authenticateResult } = yield select(state => state.accounts);
  const cachedLibraries = yield select(state => state.library.libraries);

  try {
    const libraries = yield call(getLibraries, server, authenticateResult);
    if (libraries) {
      // todo: optimize here
      if (!compareLibs(cachedLibraries, libraries)) {
        yield put(LibraryActions.setLibraries(libraries));
        console.log(libraries);
      }
    }
  } catch (error) {
    if (error) {
      console.log(error);
      if (error.message === '401') {
        yield put(NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: 'Login' })],
        }));
      }
    }
  }
}

export function* fetchDirectoriesSaga(action) {
  const { server, authenticateResult } = yield select(state => state.accounts);
  const { libraries } = yield select(state => state.library);

  const { library, paths } = action;
  const path = paths ? paths.map(p => `${p.name}/`).reduce((prev, cur) => prev + cur, '/') : '';

  try {
    const directories = yield call(
      getDirectories,
      server,
      authenticateResult,
      library.id,
      path,
      'd',
    );
    if (directories) {
      // todo: move subDirectories
      let mutableLibraries = Immutable.asMutable(libraries, { deep: true });
      const mutableLibrary = Immutable.asMutable(library, { deep: true });
      if (mutableLibrary.subDir) {
        const updatedLibrary = updateLibrary(directories, mutableLibrary, paths);
        if (updateLibrary !== false) {
          mutableLibraries = updateLibraries(libraries, updatedLibrary);
        }
      } else {
        const updatedLibrary = initLibrarySubDir(directories, mutableLibrary);
        console.log(library);
        mutableLibraries = updateLibraries(libraries, updatedLibrary);
      }
      console.log(directories);
      yield put(LibraryActions.setDestinationLibrary(mutableLibrary));
      yield put(LibraryActions.setLibraries(mutableLibraries));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* selectDirectoriesSaga(action) {
  const { paths } = action;
  const { destinationLibrary } = yield select(state => state.library);
  try {
    yield put(LibraryActions.fetchDirectories(destinationLibrary, paths));
    yield put(LibraryActions.setPaths(paths));
  } catch (e) {
    console.log(e);
  }
}

function initLibrarySubDir(directories, library) {
  const mutableLibrary = Object.assign(library);
  _.set(mutableLibrary, 'subDir', arrayToObj(directories, []));
  console.log('initLibrarySubDir');
  console.log(mutableLibrary);
  return mutableLibrary;
}

function updateLibraries(libraries, mutableLibrary) {
  const mutableLibraries = Immutable.asMutable(libraries, { deep: true });
  for (let i = 0; i < mutableLibraries.length; i += 1) {
    if (mutableLibraries[i].name === mutableLibrary.name) {
      mutableLibraries[i] = mutableLibrary;
    }
  }
  return mutableLibraries;
}

function updateLibrary(directories, library, paths) {
  const lodashPaths = [];
  lodashPaths.push('subDir');
  for (let i = 0; i < paths.length; i += 1) {
    lodashPaths.push(paths[i].name);
    lodashPaths.push('subDir');
  }
  const cache = Object.values(_.get(library, lodashPaths, []));
  const needUpdate = !compareDirs(cache, directories);
  if (needUpdate) {
    const mutableLibrary = Object.assign(library);
    _.set(mutableLibrary, lodashPaths, arrayToObj(directories, paths));
    return mutableLibrary;
  }
  return false;
}

function compareDirs(cache, directories) {
  return JSON.stringify(cache) === JSON.stringify(directories);
}

function compareLibs(cache, libraries) {
  const cacheCount = cache ? cache.length : 0;
  const librariesCount = libraries ? libraries.length : 0;
  if (cacheCount !== librariesCount) return false;
  if (cacheCount === 0 && librariesCount === 0) return true;

  let count = 0;
  const cacheIdArray = Immutable.asMutable(cache).map(cacheLib => cacheLib.id);
  for (let i = 0; i < libraries.length; i += 1) {
    if (cacheIdArray.includes(libraries[i].id)) {
      count += 1;
    }
  }
  return cacheCount === count;
}

function arrayToObj(arr, paths) {
  const obj = {};
  const mutableArr = Object.assign(arr);
  for (let i = 0; i < mutableArr.length; i += 1) {
    mutableArr[i].path = paths;
    obj[mutableArr[i].name] = mutableArr[i];
  }
  return obj;
}
