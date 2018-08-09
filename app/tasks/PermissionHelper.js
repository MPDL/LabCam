import { PermissionsAndroid } from 'react-native';

export async function requestReadPermission() {
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ],
      {
        title: ' read storage Permission',
        message:
          'LabCam needs access to your external storage, so you can upload awesome pictures.',
      },
    );
    console.log(granted);
  } catch (err) {
    console.warn(err);
  }
}
