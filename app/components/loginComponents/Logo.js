import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Dimensions, View, Text, Animated, Platform, Keyboard, StyleSheet } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import logoImg from '../../images/icon_app.png';

const ANIMATION_DURATION = 250;
const imageWidth = Dimensions.get('window').width / 4;

const styles = EStyleSheet.create({
  $smallContainerSize: imageWidth / 1.5,
  $smallImageSize: imageWidth / 1.5,
  $largeContainerSize: imageWidth,
  $largeImageSize: imageWidth,

  container: {
    alignItems: 'center',
    marginTop: imageWidth / 1.2,
    marginBottom: imageWidth / 2,
  },
  logoImage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '$largeContainerSize',
    height: '$largeContainerSize',
  },
  text: {
    color: 'white',
    fontSize: 28,
    letterSpacing: -0.5,
    marginTop: 15,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
});

export default class Logo extends Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      logoImageWidth: new Animated.Value(styles.$largeContainerSize),
    };
  }

  componentDidMount() {
    const name = Platform.OS === 'ios' ? 'Will' : 'Did';
    this.keyboardDidShowListener = Keyboard.addListener(
      `keyboard${name}Show`,
      this.keyboardWillShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      `keyboard${name}Hide`,
      this.keyboardWillHide,
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  keyboardWillShow = () => {
    Animated.parallel([
      Animated.timing(this.state.logoImageWidth, {
        toValue: styles.$smallContainerSize,
        duration: ANIMATION_DURATION,
      }),
    ]).start();
  };

  keyboardWillHide = () => {
    Animated.parallel([
      Animated.timing(this.state.logoImageWidth, {
        toValue: styles.$largeContainerSize,
        duration: ANIMATION_DURATION,
      }),
    ]).start();
  };

  render() {
    const logoImageStyles = [
      styles.logoImage,
      { width: this.state.logoImageWidth, height: this.state.logoImageWidth },
    ];

    const containerStyle = this.props.isLandscape
      ? [styles.container, { marginTop: 16, marginBottom: 16 }]
      : styles.container;

    return (
      <View style={containerStyle}>
        <Animated.View style={logoImageStyles}>
          <Animated.Image
            resizeMode="contain"
            style={[StyleSheet.absoluteFill, logoImageStyles]}
            source={logoImg}
          />
        </Animated.View>
        <Text style={styles.text}>LabCam</Text>
      </View>
    );
  }
}

Logo.propTypes = {
  isLandscape: PropTypes.bool.isRequired,
};
