import { AsyncStorage, AppState } from 'react-native';
import { getUploadLink, uploadRNFB } from '../api/UploadApi';
import {
  retrievePhotos,
  storePhotos,
  retrieveOcrTextFile,
  storeOcrTextFile,
} from '../storage/DbHelper';
import { getDirectories } from '../api/LibraryApi';

let server;
let repo;
let credentials;
let parentDir;
let link;

const UploadTask = async (data) => {
  try {
    const upload = await AsyncStorage.getItem('reduxPersist:upload');
    if (upload !== null) {
      const uploadPersist = JSON.parse(upload);
      const netOpt = uploadPersist.netOption;
      console.log(`internetType: ${data.internetType}`);
      console.log(`netOpt: ${netOpt}`);

      if (data.internetType === 'cellular' && netOpt === 'Wifi only') return;
    }
  } catch (error) {
    console.log(error);
  }

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
    link = await getUploadLink(repo, server, credentials);
    console.log(link);
  } catch (e1) {
    if (e1.message === 'Network request failed') {
      try {
        link = await getUploadLink(repo, server, credentials);
      } catch (e2) {
        console.log(e2);
      }
    }
  }

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
      uploadPhoto(photoWaitingList[0]);
      console.log('uploadPhoto');
    } else {
      uploadOcr();
    }
  } catch (error) {
    console.log(error);
  }
};

const uploadOcr = async () => {
  const mdFiles = await retrieveOcrTextFile();
  const uploadedMdFiles = await getDirectories(server, credentials, repo, parentDir, 'f');
  console.log('upload ocrTextFiles');
  const ocrWaitingList = mdFiles.filter(element => !uploadedMdFiles.map(file => file.name).includes(element.fileName));
  console.log('ocrWaitingList');
  console.log(ocrWaitingList);
  await storeOcrTextFile(ocrWaitingList);
  if (ocrWaitingList && ocrWaitingList.length > 0) {
    uploadOcrTextFile(ocrWaitingList[0]);
  }
  console.log('uploadOcr');
};

const uploadPhoto = async (photo) => {
  console.log(AppState.currentState);
  if (AppState.currentState === 'active') return;
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
  } catch (e) {
    console.log(e);
    if (e.message === 'Network request failed') {
      uploadPhoto(photo);
    }
  }
};

const uploadOcrTextFile = async (ocrTextFile) => {
  console.log(AppState.currentState);
  if (AppState.currentState === 'active') return;
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
      const mdAfter = await retrieveOcrTextFile();
      const mdFileList = mdAfter.filter(e => e.fileName !== ocrTextFile.fileName);
      await storeOcrTextFile(mdFileList);
      console.log(mdAfter);
      console.log(mdFileList);
      console.log(`${mdFileList.length} md left`);
      if (mdFileList && mdFileList.length === 0) {
        console.log('md upload finished!');
      } else if (mdFileList && mdFileList.length > 0) {
        uploadOcrTextFile(mdFileList[0]);
      }
    }
  } catch (e) {
    console.log(e);
    if (e.message === 'Network request failed') {
      uploadOcrTextFile(ocrTextFile);
    }
  }
};

export default UploadTask;
