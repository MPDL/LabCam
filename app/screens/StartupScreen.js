import React, { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import CamColors from '../common/CamColors';
import LaunchIcon from '../images/launchScreen.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CamColors.colorWithAlpha('green2', 1),
  },
  pic: {
    width: 280,
    height: 200,
    resizeMode: 'cover',
  },
});

class StartupContainer extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.pic} source={LaunchIcon} />
      </View>
    );
  }
}

export default StartupContainer;
