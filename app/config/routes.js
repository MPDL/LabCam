import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Easing, Animated } from 'react-native';
import {
  createReduxBoundAddListener,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';

import { StackNavigator } from 'react-navigation';
import LoginScreen from '../screens/LoginScreen';
import CameraScreen from '../screens/CameraScreen/CameraScreen';
import LibraryScreen from '../screens/LibraryScreen/LibraryScreen';
import StartupScreen from '../screens/StartupScreen';

export const reduxMiddleware = createReactNavigationReduxMiddleware('root', state => state.nav);
const addListener = createReduxBoundAddListener('root');

export const AppNavigator = StackNavigator(
  {
    Startup: {
      screen: StartupScreen,
    },
    Login: {
      screen: LoginScreen,
      navigationOptions: {
        header: () => null,
      },
    },
    Camera: {
      screen: CameraScreen,
      navigationOptions: {
        header: () => null,
      },
    },
    Library: {
      screen: LibraryScreen,
      navigationOptions: {
        header: () => null,
      },
    },
  },
  {
    headerMode: 'none',
    transitionConfig: () => ({
      transitionSpec: {
        duration: 200,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
        useNativeDriver: true,
      },
      screenInterpolator: (sceneProps) => {
        const { position, scene } = sceneProps;

        const thisSceneIndex = scene.index;

        const opacity = position.interpolate({
          inputRange: [thisSceneIndex - 1, thisSceneIndex],
          outputRange: [0, 1],
        });

        return { opacity };
      },
    }),
  },
);

class App extends Component {
  constructor(props) {
    super();
    this.props = props;
  }
  render() {
    return (
      <AppNavigator
        navigation={{
          dispatch: this.props.dispatch,
          state: this.props.nav,
          addListener,
        }}
      />
    );
  }
}
App.propTypes = {
  dispatch: PropTypes.any,
  nav: PropTypes.any,
};

const mapStateToProps = state => ({
  nav: state.nav,
});

export default connect(mapStateToProps)(App);
