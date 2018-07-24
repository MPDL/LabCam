import { AsyncStorage, AppState, NetInfo } from 'react-native';
import { getUploadLink, uploadRNFB } from '../api/UploadApi';
import {
  retrievePhotos,
  storePhotos,
  retrieveOcrPhotos,
  storeOcrPhotos,
} from '../storage/DbHelper';
import { getDirectories } from '../api/LibraryApi';
import { recognizeOcr } from '../tasks/OcrHelper';

let server;
let repo;
let credentials;
let parentDir;
let link;

const UploadTask = async (data) => {
  try {
    const accounts = await AsyncStorage.getItem('reduxPersist:accounts');
    if (accounts !== null) {
      const accountsPersist = JSON.parse(accounts);
      server = accountsPersist.server;
      credentials = accountsPersist.authenticateResult;
      console.log(server + credentials);
    }
  } catch (error) {
    console.log(error);
  }

  try {
    const library = await AsyncStorage.getItem('reduxPersist:library');
    if (library !== null) {
      const libraryPersist = JSON.parse(library);
      repo = libraryPersist.destinationLibrary.id;
      parentDir = libraryPersist.parentDir;
      console.log(repo + parentDir);
    }
  } catch (error) {
    console.log(error);
  }

  try {
    const upload = await AsyncStorage.getItem('reduxPersist:upload');
    if (upload !== null) {
      const uploadPersist = JSON.parse(upload);
      const netOpt = uploadPersist.netOption;
      const netInfo = await NetInfo.getConnectionInfo();
      console.log(netInfo.type);
      console.log(netOpt);

      if (netInfo.type === 'none' || netInfo.type === 'unknown') return;
      if (netInfo.type === 'cellular' && netOpt === 'Wifi only') return;
    }
  } catch (error) {
    console.log(error);
  }

  try {
    link = await getUploadLink(repo, server, credentials);
    console.log(link);
  } catch (e) {
    console.log(e);
  }

  try {
    const photos = await retrievePhotos();
    console.log('photos');
    const uploadedPhotos = await getDirectories(server, credentials, repo, parentDir, 'f');
    console.log('uploadedPhotos');
    const ocrWaitingList = photos.filter(element => !uploadedPhotos.map(file => file.name).includes(element.fileName));
    console.log('ocrWaitingList');
    console.log(ocrWaitingList);
    await storePhotos(ocrWaitingList);
    if (ocrWaitingList && ocrWaitingList.length > 0) {
      uploadPhoto(ocrWaitingList[0]);
      console.log('loguploadPhoto');
    } else {
      uploadOcr();
      console.log('uploadOcr');
    }
  } catch (error) {
    console.log(error);
  }
};

const uploadPhoto = async (photo) => {
  console.log(AppState.currentState);
  if (AppState.currentState === 'active') return;
  const uploadPhotoResult = await uploadRNFB(
    credentials,
    link,
    photo.contentUri,
    photo.fileName,
    parentDir,
  );
  console.log(`uploadPhoto: ${photo.fileName} ${uploadPhotoResult}`);
  if (uploadPhotoResult) {
    const photosAfter = await retrievePhotos();
    const uploadedPhotos = await getDirectories(server, credentials, repo, parentDir, 'f');
    const waitingList = photosAfter.filter(element => !uploadedPhotos.map(file => file.name).includes(element.fileName));
    const photoList = waitingList.filter(e => e.contentUri !== photo.contentUri);
    await storePhotos(photoList);
    console.log(`${photoList.length} photos left`);
    if (photoList && photoList.length === 0) {
      console.log('pic upload finished!');
      uploadOcr();
    } else if (photoList && photoList.length > 0) {
      uploadPhoto(photoList[0]);
    }
  }
};

const uploadOcr = async () => {
  console.log('start OCR');
  try {
    const ocrPhotos = await retrieveOcrPhotos();
    const uploadedPhotos = await getDirectories(server, credentials, repo, parentDir, 'f');
    const ocrWaitingList = ocrPhotos.filter(element => !uploadedPhotos.map(file => file.name).includes(element.fileName));
    await storeOcrPhotos(ocrWaitingList);
    if (link && ocrWaitingList.length > 0) {
      const ocrPhoto = ocrWaitingList[0];
      await uploadNext(ocrPhoto);
    }
  } catch (error) {
    console.log(error);
  }
};

const uploadNext = async (photo) => {
  if (AppState.currentState === 'active') return;
  const ocrPath = await recognizeOcr(photo.contentUri, photo.fileName);
  console.log('recognizeOcr:');
  console.log(ocrPath);
  const uploadOCR = await uploadRNFB(credentials, link, ocrPath, photo.fileName, parentDir);
  console.log(`uploadOCR: ${photo.fileName} ${uploadOCR}`);
  if (uploadOCR) {
    const ocrPhotosAfter = await retrieveOcrPhotos();
    const uploadedOcrPhotos = await getDirectories(server, credentials, repo, parentDir, 'f');
    const ocrWaitingList = ocrPhotosAfter.filter(element => !uploadedOcrPhotos.map(file => file.name).includes(element.fileName));
    const ocrPhotoList = ocrWaitingList.filter(e => e.contentUri !== photo.contentUri);
    await storeOcrPhotos(ocrPhotoList);
    console.log(`${ocrPhotoList.length} ocr left`);
    if (ocrPhotoList.length > 0) {
      uploadNext(ocrPhotoList[0]);
    }
  }
};

export default UploadTask;
