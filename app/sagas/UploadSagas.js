import { call, select, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { getUploadLink, uploadRNFB } from '../api/UploadApi';
import UploadActions from '../redux/UploadRedux';
import { retrievePhotos, storePhotos } from '../storage/DbHelper';
import { getDirectories } from '../api/LibraryApi';

export function* uploadFile(action) {
  const { photo } = action;
  const { server, authenticateResult } = yield select(state => state.accounts);
  const { destinationLibrary, parentDir } = yield select(state => state.library);

  try {
    const link = yield call(getUploadLink, destinationLibrary.id, server, authenticateResult);
    if (link) {
      console.log(link);
      yield call(uploadPhoto, authenticateResult, link, photo, parentDir);
    }
  } catch (e) {
    console.log(e);
  }
}

function* uploadPhoto(authenticateResult, link, photo, parentDir) {
  const uploadImgResult = yield call(
    uploadRNFB,
    authenticateResult,
    link,
    photo.contentUri,
    photo.fileName,
    parentDir,
  );
  if (uploadImgResult) {
    console.log(`${photo.fileName} is uploaded`);
    console.log(uploadImgResult);
    const photos = yield retrievePhotos();
    yield storePhotos(photos.filter(e => e.contentUri !== photo.contentUri));
    console.log(`${photos.length} photos left`);
  }
}

export function* batchUpload(action) {
  // const { photos } = action;
  const { server, authenticateResult } = yield select(state => state.accounts);
  const { destinationLibrary, parentDir } = yield select(state => state.library);

  yield call(delay, 2000);
  const files = yield call(
    getDirectories,
    server,
    authenticateResult,
    destinationLibrary.id,
    parentDir,
    'f',
  );
  const photos = yield retrievePhotos();
  const waitingList = photos.filter(element => !files.map(file => file.name).includes(element.fileName));
  storePhotos(waitingList);
  for (let i = 0; i < waitingList.length; i += 1) {
    yield put(UploadActions.uploadFile(waitingList[i]));
    yield call(delay, 1500);
  }
}
