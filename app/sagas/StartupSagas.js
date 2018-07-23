import { select, put } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';

// process STARTUP actions
export function* startup(action) {
  const { authenticateResult } = yield select(state => state.accounts);
  const { destinationLibrary } = yield select(state => state.library);
  yield put(NavigationActions.init({
    params: {
      authenticateResult,
      destinationLibrary,
    },
  }));
}
