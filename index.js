import { AppRegistry } from 'react-native';
import App from './App';
import UploadTask from './app/tasks/UploadTask';

AppRegistry.registerComponent('LabCam', () => App);
AppRegistry.registerHeadlessTask('UploadTask', () => UploadTask);
