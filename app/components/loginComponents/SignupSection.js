import React, { Component } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const DEVICE_WIDTH =
  Dimensions.get('window').width < Dimensions.get('window').height
    ? Dimensions.get('window').width
    : Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    top: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
    width: DEVICE_WIDTH,
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
          {this.props.server === 'https://keeper.mpdl.mpg.de/api2/' ? 'Create Account' : ''}
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
  server: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  server: state.accounts.server,
});

export default connect(mapStateToProps)(SignupSection);
