import { call, select, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { getUploadLink, uploadRNFB } from '../api/UploadApi';
import UploadActions from '../redux/UploadRedux';
import AccountsActions from '../redux/AccountsRedux';
import {
  retrievePhotos,
  storePhotos,
  retrieveOcrTextFile,
  storeOcrTextFile,
  retrieveCurrentState,
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
      if (photo.fileName.includes('.jpg')) {
        yield call(uploadPhoto, authenticateResult, link, photo, parentDir);
      } else if (photo.fileName.includes('.md')) {
        yield call(uploadOcrTextFile, authenticateResult, link, photo, parentDir);
      }
    }
  } catch (err) {
    console.log(err);
    if (err.message === '401') {
      yield put(AccountsActions.setLoginState('auth failed'));
    }
  }
}

function* uploadPhoto(authenticateResult, link, photo, parentDir, isBatchUpload = 0) {
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
      if (uploadImgResult === 200) {
        console.log(`${photo.fileName} is uploaded`);
        console.log(uploadImgResult);
        const photos = yield retrievePhotos();
        yield storePhotos(photos.filter(e => e.contentUri !== photo.contentUri));
        console.log(`${photos.length} photos left`);
        if (Platform.OS === 'android') {
          showNotification();
        }
      } else if (uploadImgResult.includes('No file')) {
        const fileStr = photo.fileName.substring(0, photo.fileName.indexOf('.'));
        const photos = yield retrievePhotos();
        yield storePhotos(photos.filter(e => e.contentUri !== photo.contentUri));
        const mdFiles = yield retrieveOcrTextFile();
        yield storeOcrTextFile(mdFiles.filter(e => !e.fileName.includes(fileStr)));
      }

      if (isBatchUpload) {
        const leftPhotos = yield retrievePhotos();
        if (leftPhotos.length > 0) {
          yield call(uploadPhoto, authenticateResult, link, leftPhotos[0], parentDir, 1);
        } else {
          const mdFiles = yield retrieveOcrTextFile();
          if (mdFiles && mdFiles.length > 0) {
            for (let i = 0; i < mdFiles.length; i += 1) {
              const { error } = yield select(state => state.upload);
              if (error === '') {
                yield put(UploadActions.uploadFile(mdFiles[i]));
              } else break;
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
    if (err.message && err.message.includes("Parent dir doesn't exist")) {
      yield put(UploadActions.uploadError('not exist'));
    }
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
      yield storeOcrTextFile(ocrTextFileList.filter(e => e.contentUri !== ocrTextFile.contentUri));
      console.log(`${ocrTextFileList.length} mdFiles left`);
      // create a path you want to delete
      RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${ocrTextFile.fileName}`)
        .then(() => {
          console.log('FILE DELETED');
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch((err) => {
          console.log(err.message);
        });

      if (Platform.OS === 'android') {
        showNotification();
      }
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
  const currentState = yield retrieveCurrentState();
  console.log(`currentState:${currentState}`);
  if (currentState === 'background') return;
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

    const mdFiles = yield retrieveOcrTextFile();
    const waitingTextFileList = mdFiles.filter(element => !files.map(file => file.name).includes(element.fileName));
    storeOcrTextFile(waitingTextFileList);

    const link = yield call(getUploadLink, destinationLibrary.id, server, authenticateResult);
    if (link && photos.length > 0) {
      const { error } = yield select(state => state.upload);
      if (error === '') {
        yield call(uploadPhoto, authenticateResult, link, photos[0], parentDir, 1);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export function* syncUploadProgress(action) {
  const { server, authenticateResult } = yield select(state => state.accounts);
  const { destinationLibrary, parentDir } = yield select(state => state.library);

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

    const mdFiles = yield retrieveOcrTextFile();
    const waitingTextFileList = mdFiles.filter(element => !files.map(file => file.name).includes(element.fileName));
    storeOcrTextFile(waitingTextFileList);
  } catch (e) {
    console.log(e);
    if (e.message === '401') {
      yield put(AccountsActions.setLoginState('auth failed'));
    }
  }
}
