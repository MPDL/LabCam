import { select, put, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { NavigationActions } from 'react-navigation';
import { authPing } from '../api/AccountsApi';
import AccountsActions from '../redux/AccountsRedux';

// process STARTUP actions
export function* startup(action) {
  const { authenticateResult, server } = yield select(state => state.accounts);
  const { destinationLibrary } = yield select(state => state.library);

  try {
    yield delay(800);
    const pingResult = yield call(authPing, server, authenticateResult);
    if (pingResult) {
      console.log(pingResult);
      yield put(NavigationActions.init({
        params: {
          authenticateResult,
          destinationLibrary,
        },
      }));
    }
  } catch (error) {
    console.log(error);
    if (error.message === '401') {
      yield put(AccountsActions.setAuthenticateResult(null));
      yield put(NavigationActions.init({
        params: {
          authenticateResult: null,
          destinationLibrary,
        },
      }));
    } else {
      yield put(NavigationActions.init({
        params: {
          authenticateResult,
          destinationLibrary,
        },
      }));
    }
  }
}
