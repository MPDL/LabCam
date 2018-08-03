import { call, select, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { getUploadLink, uploadRNFB } from '../api/UploadApi';
import UploadActions from '../redux/UploadRedux';
import {
  retrievePhotos,
  storePhotos,
  retrieveOcrTextFile,
  storeOcrTextFile,
} from '../storage/DbHelper';
import { getDirectories } from '../api/LibraryApi';
import { showNotification } from '../tasks/OcrHelper';

export function* uploadFile(action) {
  const { photo } = action;
  const { server, authenticateResult } = yield select(state => state.accounts);
  const { destinationLibrary, parentDir } = yield select(state => state.library);

  try {
    const link = yield call(getUploadLink, destinationLibrary.id, server, authenticateResult);
    if (link) {
      console.log(link);
      if (photo.fileName.includes('.jpg')) {
        yield call(uploadPhoto, authenticateResult, link, photo, parentDir);
      } else if (photo.fileName.includes('.md')) {
        yield call(uploadOcrTextFile, authenticateResult, link, photo, parentDir);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function* uploadPhoto(authenticateResult, link, photo, parentDir) {
  try {
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
      showNotification();
    }
  } catch (e) {
    console.log(e);
  }
}

function* uploadOcrTextFile(authenticateResult, link, ocrTextFile, parentDir) {
  try {
    const uploadImgResult = yield call(
      uploadRNFB,
      authenticateResult,
      link,
      ocrTextFile.contentUri,
      ocrTextFile.fileName,
      parentDir,
    );
    if (uploadImgResult) {
      console.log(`${ocrTextFile.fileName} is uploaded`);
      console.log(uploadImgResult);
      const ocrTextFileList = yield retrieveOcrTextFile();
      yield storeOcrTextFile(ocrTextFileList.filter(e => e.contentUri !== ocrTextFileList.contentUri));
      console.log(`${ocrTextFileList.length} mdFiles left`);
      showNotification();
    }
  } catch (e) {
    console.log(e);
  }
}

export function* batchUpload(action) {
  // const { photos } = action;
  const { server, authenticateResult } = yield select(state => state.accounts);
  const { destinationLibrary, parentDir } = yield select(state => state.library);

  yield call(delay, 10000);
  try {
    const files = yield call(
      getDirectories,
      server,
      authenticateResult,
      destinationLibrary.id,
      parentDir,
      'f',
    );
    const photos = yield retrievePhotos();
    const waitingPhotoList = photos.filter(element => !files.map(file => file.name).includes(element.fileName));
    storePhotos(waitingPhotoList);
    for (let i = 0; i < waitingPhotoList.length; i += 1) {
      yield put(UploadActions.uploadFile(waitingPhotoList[i]));
      yield call(delay, 1500);
    }

    const mdFiles = yield retrieveOcrTextFile();
    const waitingTextFileList = mdFiles.filter(element => !files.map(file => file.name).includes(element.fileName));
    storeOcrTextFile(waitingTextFileList);
    for (let i = 0; i < waitingTextFileList.length; i += 1) {
      yield put(UploadActions.uploadFile(waitingTextFileList[i]));
    }
  } catch (e) {
    console.log(e);
  }
}
