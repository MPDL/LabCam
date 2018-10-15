import { call, select, put } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { login, authPing } from '../api/AccountsApi';
import AccountsActions from '../redux/AccountsRedux';
import LibraryActions from '../redux/LibraryRedux';

export function* authenticateAccount(action) {
  const { account, password } = action;
  const { server } = yield select(state => state.accounts);

  try {
    const token = yield call(login, server, account, password);
    yield put(AccountsActions.setAuthenticateResult(`Token ${token}`));
    // yield put(LibraryActions.fetchLibraries());
    yield put(AccountsActions.setAccount(account));
    yield put(NavigationActions.navigate({
      routeName: 'Library',
    }));
  } catch (error) {
    if (error) {
      console.log(error);
      if (error.message === '400') {
        console.log('Login failed, wrong username or password');
        yield put(AccountsActions.setLoginState('failed'));
      }
    }
  }
}

export function* pingServer(action) {
  const { authenticateResult, server } = yield select(state => state.accounts);
  try {
    yield call(authPing, server, authenticateResult);
  } catch (error) {
    console.log(error);
    if (error.message === '401') {
      yield put(AccountsActions.setLoginState('auth failed'));
    }
  }
}