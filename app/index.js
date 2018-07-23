import React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Provider } from 'react-redux';

import Navigator from './config/routes';
import createStore from './redux';
import './common/ReactotronConfig';

const store = createStore();
console.disableYellowBox = true;
export default () => (
  <Provider store={store}>
    <Navigator onNavigationStateChange={null} />
  </Provider>
);

EStyleSheet.build({
  $primaryBlue: '#4F6D7A',
});
