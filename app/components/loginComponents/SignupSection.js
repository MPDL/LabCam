import React, { Component } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    top: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 50,
    paddingHorizontal: 40,
  },
  text: {
    color: 'white',
    backgroundColor: 'transparent',
  },
});

class SignupSection extends Component {
  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    const { onCreatePress, onForgotPress } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text} onPress={onCreatePress}>
          Create Account
        </Text>
        <Text style={styles.text} onPress={onForgotPress}>
          Forgot Password?
        </Text>
      </View>
    );
  }
}
SignupSection.propTypes = {
  onCreatePress: PropTypes.func.isRequired,
  onForgotPress: PropTypes.func.isRequired,
};
export default SignupSection;
