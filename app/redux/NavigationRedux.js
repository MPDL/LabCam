import { NavigationActions } from 'react-navigation';
import { AppNavigator } from '../config/routes';

const initialState = AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams('Startup'));

export const navigationReducer = (state = initialState, action) => {
  if (action.type === 'Navigation/INIT') {
    const { params } = action;
    let initRouteName = 'Camera';

    if (!params.authenticateResult) {
      initRouteName = 'Login';
    } else if (!params.destinationLibrary) {
      initRouteName = 'Library';
    }

    const newState = AppNavigator.router.getStateForAction(
      NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: initRouteName })],
      }),
      state,
    );
    return newState || state;
  }
  const newState = AppNavigator.router.getStateForAction(action, state);
  return newState || state;
};
