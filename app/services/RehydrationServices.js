import { AsyncStorage } from 'react-native';
import { persistStore } from 'redux-persist';
import StartupActions from '../redux/StartupRedux';
import ReduxPersist from '../config/ReduxPersist';

const updateReducers = (store: Object) => {
  const { reducerVersion } = ReduxPersist;
  const config = ReduxPersist.storeConfig;
  const startup = () => store.dispatch(StartupActions.startup());

  // Check to ensure latest reducer version
  AsyncStorage.getItem('reducerVersion')
    .then((localVersion) => {
      if (localVersion !== reducerVersion) {
        // Purge store
        persistStore(store, config, startup).purge();
        AsyncStorage.setItem('reducerVersion', reducerVersion);
      } else {
        persistStore(store, config, startup);
      }
    })
    .catch(() => {
      persistStore(store, config, startup);
      AsyncStorage.setItem('reducerVersion', reducerVersion);
    });
};

export default { updateReducers };
