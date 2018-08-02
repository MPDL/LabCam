import { AsyncStorage } from 'react-native';

export const retrievePhotos = async () => {
  let photos = [];
  try {
    const photosPersist = await AsyncStorage.getItem('photos');
    if (photosPersist !== null) {
      photos = JSON.parse(photosPersist);
      console.log('_retrievePhotos');
      console.log(photos);
    }
    return photos;
  } catch (error) {
    console.log(error);
    return photos;
  }
};

export const storePhotos = async (photos) => {
  try {
    await AsyncStorage.setItem('photos', JSON.stringify(photos));
  } catch (error) {
    // Error saving data
    console.log(error);
  }
};

export const retrieveOcrPhotos = async () => {
  let ocr = [];
  try {
    const photosPersist = await AsyncStorage.getItem('ocr');
    if (photosPersist !== null) {
      ocr = JSON.parse(photosPersist);
      console.log('_retrieveOcr');
      console.log(ocr);
    }
    return ocr;
  } catch (error) {
    console.log(error);
    return ocr;
  }
};

export const storeOcrPhotos = async (ocr) => {
  try {
    await AsyncStorage.setItem('ocr', JSON.stringify(ocr));
  } catch (error) {
    // Error saving data
    console.log(error);
  }
};

export const retrieveOcrTextFile = async () => {
  let md = [];
  try {
    const photosPersist = await AsyncStorage.getItem('md');
    if (photosPersist !== null) {
      md = JSON.parse(photosPersist);
      console.log('_retrieveMd');
      console.log(md);
    }
    return md;
  } catch (error) {
    console.log(error);
    return md;
  }
};

export const storeOcrTextFile = async (md) => {
  try {
    await AsyncStorage.setItem('md', JSON.stringify(md));
  } catch (error) {
    // Error saving data
    console.log(error);
  }
};

export const retrieveCurrentState = async () => {
  let currentState = 'none';
  try {
    currentState = await AsyncStorage.getItem('currentState');
    return currentState;
  } catch (error) {
    console.log(error);
    return currentState;
  }
};

export const storeCurrentState = async (currentState) => {
  try {
    await AsyncStorage.setItem('currentState', JSON.stringify(currentState));
  } catch (error) {
    // Error saving data
    console.log(error);
  }
};
