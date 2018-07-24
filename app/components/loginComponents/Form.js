import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import UserInput from './UserInput';

import usernameImg from '../../images/username.png';
import passwordImg from '../../images/password.png';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 120,
  },
});

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPass: true,
    };
  }

  render() {
    const { account, onAccountChange, onPasswordChange } = this.props;
    return (
      <View style={styles.container}>
        <UserInput
          account={account}
          source={usernameImg}
          placeholder="Username"
          autoCapitalize="none"
          returnKeyType="done"
          autoCorrect={false}
          onChangeText={onAccountChange}
        />
        <UserInput
          source={passwordImg}
          secureTextEntry={this.state.showPass}
          placeholder="Password"
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onPasswordChange}
        />
      </View>
    );
  }
}

Form.propTypes = {
  onAccountChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  account: PropTypes.string.isRequired,
};
