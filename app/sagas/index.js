import { takeLatest, takeEvery, all } from 'redux-saga/effects';

/* ------------- Types ------------- */

import { StartupTypes } from '../redux/StartupRedux';
import { AccountsTypes } from '../redux/AccountsRedux';
import { UploadTypes } from '../redux/UploadRedux';
import { LibraryTypes } from '../redux/LibraryRedux';

/* ------------- Sagas ------------- */

import { startup } from './StartupSagas';
import { authenticateAccount } from './AccountsSagas';
import { uploadFile, batchUpload, syncUploadProgress } from './UploadSagas';
import { fetchLibrariesSaga, fetchDirectoriesSaga, selectDirectoriesSaga, recursiveFetchDirectoriesSaga } from './LibrarySagas';

/* ------------- Connect Types To Sagas ------------- */

export default function* rootSaga() {
  yield all([
    takeLatest(StartupTypes.STARTUP, startup),
    takeLatest(AccountsTypes.AUTHENTICATE_ACCOUNT, authenticateAccount),
    takeEvery(UploadTypes.UPLOAD_FILE, uploadFile),
    takeLatest(UploadTypes.BATCH_UPLOAD, batchUpload),
    takeLatest(UploadTypes.SYNC_UPLOAD_PROGRESS, syncUploadProgress),
    takeEvery(LibraryTypes.FETCH_LIBRARIES, fetchLibrariesSaga),
    takeLatest(LibraryTypes.FETCH_DIRECTORIES, fetchDirectoriesSaga),
    takeLatest(LibraryTypes.RECURSIVE_FETCH_DIRECTORIES, recursiveFetchDirectoriesSaga),
    takeLatest(LibraryTypes.SELECT_DIRECTORIES, selectDirectoriesSaga),
  ]);
}
