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
