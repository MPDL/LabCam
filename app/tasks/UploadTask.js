import { AsyncStorage, AppState } from 'react-native';
import { getUploadLink, uploadRNFB } from '../api/UploadApi';
import {
  retrievePhotos,
  storePhotos,
  retrieveOcrTextFile,
  storeOcrTextFile,
  retrieveCurrentState,
} from '../storage/DbHelper';
import { getDirectories } from '../api/LibraryApi';
import { showNotification } from './OcrHelper';

const UploadTask = async (data) => {
  const netOpt = await retrieveNetOpt(data);
  if (data.internetType === 'cellular' && netOpt === 'Wifi only') return;
  const [server, credentials] = await retrieveAccountInfo();
  const [repo, parentDir] = await retrieveLibraryInfo();
  const link = await updateUploadLink(repo, server, credentials);

  try {
    const photos = await retrievePhotos();
    console.log('photos');
    const uploadedPhotos = await getDirectories(server, credentials, repo, parentDir, 'f');
    console.log('uploadedPhotos');
    const photoWaitingList = photos.filter(element => !uploadedPhotos.map(file => file.name).includes(element.fileName));
    console.log('photoWaitingList');
    console.log(photoWaitingList);
    await storePhotos(photoWaitingList);
    if (photoWaitingList && photoWaitingList.length > 0) {
      uploadPhoto(photoWaitingList[0], server, credentials, link, repo, parentDir);
      console.log('uploadPhoto');
    } else {
      uploadOcr(server, credentials, link, repo, parentDir);
    }
  } catch (error) {
    console.log(error);
  }
};

const uploadOcr = async (server, credentials, link, repo, parentDir) => {
  const mdFiles = await retrieveOcrTextFile();
  const uploadedMdFiles = await getDirectories(server, credentials, repo, parentDir, 'f');
  console.log('upload ocrTextFiles');
  const ocrWaitingList = mdFiles.filter(element => !uploadedMdFiles.map(file => file.name).includes(element.fileName));
  console.log('ocrWaitingList');
  console.log(ocrWaitingList);
  await storeOcrTextFile(ocrWaitingList);
  if (ocrWaitingList && ocrWaitingList.length > 0) {
    uploadOcrTextFile(ocrWaitingList[0], credentials, link, parentDir);
  }
  console.log('uploadOcr');
};

const uploadPhoto = async (photo, server, credentials, link, repo, parentDir) => {
  const isActive = await isForeground();
  if (isActive) return;
  try {
    const uploadPhotoResult = await uploadRNFB(
      credentials,
      link,
      photo.contentUri,
      photo.fileName,
      parentDir,
    );
    console.log(`uploadPhoto: ${photo.fileName} ${uploadPhotoResult}`);
    if (uploadPhotoResult) {
      showNotification();
      const photosAfter = await retrievePhotos();
      const uploadedPhotos = await getDirectories(server, credentials, repo, parentDir, 'f');
      const waitingList = photosAfter.filter(element => !uploadedPhotos.map(file => file.name).includes(element.fileName));
      const photoList = waitingList.filter(e => e.contentUri !== photo.contentUri);
      await storePhotos(photoList);
      console.log(`${photoList.length} photos left`);
      if (photoList && photoList.length === 0) {
        console.log('pic upload finished!');
        uploadOcr(server, credentials, link, repo, parentDir);
      } else if (photoList && photoList.length > 0) {
        uploadPhoto(photoList[0], server, credentials, link, repo, parentDir);
      }
    }
  } catch (e) {
    console.log(e);
    if (e.message === 'Network request failed') {
      uploadPhoto(photo, server, credentials, link, repo, parentDir);
    }
  }
};

const uploadOcrTextFile = async (ocrTextFile, credentials, link, parentDir) => {
  const isActive = await isForeground();
  if (isActive) return;
  try {
    const uploadPhotoResult = await uploadRNFB(
      credentials,
      link,
      ocrTextFile.contentUri,
      ocrTextFile.fileName,
      parentDir,
    );
    console.log(`uploadMd: ${ocrTextFile.fileName} ${uploadPhotoResult}`);
    if (uploadPhotoResult) {
      showNotification();
      const mdAfter = await retrieveOcrTextFile();
      const mdFileList = mdAfter.filter(e => e.fileName !== ocrTextFile.fileName);
      await storeOcrTextFile(mdFileList);
      console.log(mdFileList);
      console.log(`${mdFileList.length} md left`);
      if (mdFileList && mdFileList.length === 0) {
        console.log('md upload finished!');
      } else if (mdFileList && mdFileList.length > 0) {
        uploadOcrTextFile(mdFileList[0], credentials, link, parentDir);
      }
    }
  } catch (e) {
    console.log(e);
    if (e.message === 'Network request failed') {
      uploadOcrTextFile(ocrTextFile, credentials, link, parentDir);
    }
  }
};

const isForeground = async () => {
  console.log(`AppState:${AppState.currentState}`);
  const currentState = await retrieveCurrentState();
  console.log(`currentState:${currentState}`);
  return currentState === 'active';
};

const retrieveNetOpt = async (data) => {
  try {
    const upload = await AsyncStorage.getItem('reduxPersist:upload');
    if (upload !== null) {
      const uploadPersist = JSON.parse(upload);
      const netOpt = uploadPersist.netOption;
      console.log(`internetType: ${data.internetType}`);
      console.log(`netOpt: ${netOpt}`);
      return netOpt;
    }
  } catch (error) {
    console.log(error);
  }
};

const retrieveAccountInfo = async () => {
  try {
    const accounts = await AsyncStorage.getItem('reduxPersist:accounts');
    if (accounts !== null) {
      const accountsPersist = JSON.parse(accounts);
      const server = accountsPersist.server;
      const credentials = accountsPersist.authenticateResult;
      console.log(`server:${server}`);
      console.log(`credentials:${credentials}`);
      return [server, credentials];
    }
  } catch (error) {
    console.log(error);
  }
};

const retrieveLibraryInfo = async () => {
  try {
    const library = await AsyncStorage.getItem('reduxPersist:library');
    if (library !== null) {
      const libraryPersist = JSON.parse(library);
      const repo = libraryPersist.destinationLibrary.id;
      const parentDir = libraryPersist.parentDir;
      console.log(`repo:${repo}`);
      console.log(`parentDir:${parentDir}`);
      return [repo, parentDir];
    }
  } catch (error) {
    console.log(error);
  }
};

let count = 1;
const updateUploadLink = async (repo, server, credentials) => {
  try {
    if (count > 1) {
      await timeout(3000);
    }
    const link = await getUploadLink(repo, server, credentials);
    console.log(link);
    return link;
  } catch (e1) {
    if (e1.message === 'Network request failed') {
      if (count < 10) {
        count += 1;
        console.log(`try updateUploadLink:${count}`);
        updateUploadLink();
      }
    }
  }
};

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

export default UploadTask;
