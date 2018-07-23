import { combineReducers } from 'redux';

import configureStore from '../config/CreateStore';
import rootSaga from '../sagas/';
import { reducer as accountsReducer } from '../redux/AccountsRedux';
import { reducer as libraryReducer } from '../redux/LibraryRedux';
import { reducer as uploadReducer } from '../redux/UploadRedux';
import { navigationReducer } from './NavigationRedux';

export default () => {
  /* ------------- Assemble The Reducers ------------- */
  const rootReducer = combineReducers({
    accounts: accountsReducer,
    library: libraryReducer,
    nav: navigationReducer,
    upload: uploadReducer,
  });

  return configureStore(rootReducer, rootSaga);
};
