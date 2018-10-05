import RNFetchBlob from 'react-native-fetch-blob';
import { Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';

export const getUploadLink = (repo, server, credentials) =>
  fetch(`${server}repos/${repo}/upload-link/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: credentials,
    },
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json().then(data => data);
    }
    return Promise.reject(new Error(response.status));
  });

export const uploadFiles = (credentials, link, photo, parentDir = '/') => {
  const photoName = photo.uri.substring(photo.uri.lastIndexOf('/') + 1);
  const formData = new FormData();
  formData.append('file', {
    uri: photo.uri,
    type: 'image/jpeg',
    name: photoName,
  });
  formData.append('parent_dir', parentDir);
  console.log(formData);
  return fetch(link, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: credentials,
    },
    body: formData,
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json().then(data => data);
    }
    return Promise.reject(new Error(response.status));
  });
};

export const uploadRNFB = (credentials, link, photo, photoName, parentDir) => {
  const body = [
    {
      name: 'file',
      filename: photoName,
      data: RNFetchBlob.wrap(photo),
    },
    {
      name: 'parent_dir',
      data: parentDir,
    },
    // {
    //   name: 'replace',
    //   data: '1',
    // },
  ];

  return RNFetchBlob.fetch(
    'POST',
    link,
    {
      Authorization: credentials,
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
    body,
  )
    .uploadProgress({ interval: 250 }, (written, total) => {
      console.log('uploaded', written / total);
    })
    .then((response) => {
      console.log(response);
      if (response.respInfo && response.respInfo.status === 200) {
        return 200;
      }
      return Promise.reject(new Error(response.data));
    });
};
