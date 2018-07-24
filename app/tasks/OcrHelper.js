import RNTesseractOcr from 'react-native-tesseract-ocr';
import RNFS from 'react-native-fs';

const tessOptions = {
  whitelist: null,
  blacklist: null,
};

export const recognizeOcr = async (uri, imgName) => {
  let normalizedUri = uri;
  if (uri.includes('file://')) {
    normalizedUri = uri.replace('file://', '');
  }

  try {
    const ocrUri = await RNFS.stat(normalizedUri);
    console.log(ocrUri.originalFilepath);
    // const ocrText = await recognize(ocrUri.originalFilepath);
    const ocrText = await recognize(normalizedUri);
    const path = await createFile(imgName, ocrText);
    return path;
  } catch (err) {
    console.log('stat Error: ', err);
  }
};

const recognize = imgOriginalPath =>
  RNTesseractOcr.recognize(imgOriginalPath, 'LANG_ENGLISH', tessOptions)
    .then(result =>
    // console.log('OCR Result: ', result);
      result)
    .catch((err) => {
      console.log('OCR Error: ', err);
    });

const createFile = (imgName, text) => {
  const path = `${RNFS.DocumentDirectoryPath}/test.md`;
  return RNFS.writeFile(path, text, 'utf8')
    .then((success) => {
      console.log(`FILE WRITTEN: ${path}`);
      return path;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

export const startService = async () => {
  await RNTesseractOcr.startService();
};

export const stopService = async () => {
  await RNTesseractOcr.stopService();
};
