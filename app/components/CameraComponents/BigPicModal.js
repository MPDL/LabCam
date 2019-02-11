import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Platform, TouchableOpacity, Image, StatusBar, StyleSheet } from 'react-native';
import { isIphoneX } from '../iphoneXHelper';

class BigPicModal extends React.Component {
  render() {
    const { toggleBigPic, uri } = this.props;
    const photoLayerStyle =
      Platform.OS === 'android'
        ? styles.photoLayer
        : isIphoneX()
          ? styles.photoLayerIosX
          : styles.photoLayerIos;
    return (
      <TouchableOpacity style={photoLayerStyle} onPress={toggleBigPic}>
        <Image style={styles.bigPic} source={{ uri }} />
      </TouchableOpacity>
    );
  }
}

BigPicModal.propTypes = {
  toggleBigPic: PropTypes.func.isRequired,
  uri: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  netOption: state.upload.netOption,
  ocrTextOnPause: state.upload.ocrTextOnPause,
});

export default connect(mapStateToProps)(BigPicModal);

const styles = StyleSheet.create({
  photoLayer: {
    position: 'absolute',
    top: StatusBar.currentHeight,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    zIndex: 99,
  },
  photoLayerIos: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    zIndex: 99,
  },
  photoLayerIosX: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    zIndex: 99,
  },
  bigPic: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
