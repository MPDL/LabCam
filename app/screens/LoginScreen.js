import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Dimensions,
  StatusBar,
  NetInfo,
  Linking,
  Keyboard,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';

import Logo from '../components/loginComponents/Logo';
import Server from '../components/loginComponents/Server';
import Form from '../components/loginComponents/Form';
import Wallpaper from '../components/loginComponents/Wallpaper';
import ButtonSubmit from '../components/loginComponents/ButtonSubmit';
import SignupSection from '../components/loginComponents/SignupSection';

import AccountsActions from '../redux/AccountsRedux';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      password: '',
      createUrl: 'https://keeper.mpdl.mpg.de/accounts/register/',
      isLandscape: false,
      netInfo: '',
    };
  }

  _s0: NavigationEventSubscription;

  componentWillMount() {
    const { account } = this.props;
    this.setState({ account });
    this._s0 = this.props.navigation.addListener('willFocus', this._onWF);
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      this.setState({
        netInfo: connectionInfo.type,
      });
    });
    NetInfo.addEventListener('connectionChange', this._handleConnectionChange);
  }

  componentWillUnmount() {
    this._s0.remove();
    NetInfo.removeEventListener('connectionChange', this._handleConnectionChange);
  }

  _handleConnectionChange = (connectionInfo) => {
    this.setState({
      netInfo: connectionInfo.type,
    });
  };

  _onWF = (a) => {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      this.setState({
        netInfo: connectionInfo.type,
      });
    });
    console.log('_willFocus OrdersScreen', a);
  };

  onLayout = (e) => {
    const { width, height } = Dimensions.get('window');
    if (width > height) {
      this.setState({
        isLandscape: true,
      });
    } else {
      this.setState({
        isLandscape: false,
      });
    }
  };

  onAccountChange = (account) => {
    this.setState({ account });
  };

  onPasswordChange = (password) => {
    this.setState({ password });
  };

  onPress = () => {
    const { authenticateAccount } = this.props;
    const { account, password, netInfo } = this.state;
    Keyboard.dismiss();
    if (netInfo !== 'none') {
      if (!account) {
        Alert.alert('Login', 'Email or username cannot be blank');
      } else if (!password) {
        Alert.alert('Login', 'Password cannot be blank');
      } else {
        authenticateAccount(account, password);
      }
    } else {
      Alert.alert('Login', 'Please check your Internet Connection');
    }
  };

  onCreatePress = () => {
    Linking.canOpenURL(this.state.createUrl).then((supported) => {
      if (supported) {
        Linking.openURL(this.state.createUrl);
      } else {
        console.log(`Don't know how to open URI: ${this.state.createUrl}`);
      }
    });
  };

  onForgotPress = () => {
    const { server } = this.props;
    if (server && server.length > 6) {
      const forgetUrl = `${server.substring(0, server.length - 5)}accounts/password/reset/`;
      console.log(forgetUrl);
      Linking.canOpenURL(forgetUrl).then((supported) => {
        if (supported) {
          Linking.openURL(forgetUrl);
        } else {
          console.log(`Don't know how to open URI: ${forgetUrl}`);
        }
      });
    }
  };

  render() {
    if (this.props.loginState === 'failed') {
      Alert.alert('Login', 'Incorrect email or password', [
        {
          text: 'OK',
          onPress: () => {
            this.props.setLoginState('');
          },
        },
      ]);
    }

    return (
      <Wallpaper onLayout={this.onLayout}>
        <StatusBar translucent barStyle="light-content" />
        <KeyboardAvoidingView
          behavior="padding"
          style={{
            alignItems: 'center',
          }}
        >
          <Logo isLandscape={this.state.isLandscape} />
          <Server />
          <Form
            account={this.state.account}
            onAccountChange={this.onAccountChange}
            onPasswordChange={this.onPasswordChange}
          />
          <ButtonSubmit onPress={this.onPress} />
          <SignupSection onCreatePress={this.onCreatePress} onForgotPress={this.onForgotPress} />
        </KeyboardAvoidingView>
      </Wallpaper>
    );
  }
}

LoginScreen.propTypes = {
  authenticateAccount: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  account: PropTypes.string.isRequired,
  setLoginState: PropTypes.func.isRequired,
  loginState: PropTypes.string.isRequired,
  server: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  server: state.accounts.server,
  account: state.accounts.account,
  loginState: state.accounts.loginState,
});

const mapDispatchToProps = dispatch => ({
  authenticateAccount: (username, password) =>
    dispatch(AccountsActions.authenticateAccount(username, password)),
  setLoginState: state => dispatch(AccountsActions.setLoginState(state)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginScreen);
