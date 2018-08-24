import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Platform, TouchableOpacity, Image, StatusBar, StyleSheet } from 'react-native';

class BigPicModal extends React.Component {
  render() {
    const { toggleBigPic, uri } = this.props;
    return (
      <TouchableOpacity style={styles.ocrLayer} onPress={toggleBigPic}>
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
  ocrLayer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 24,
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
    resizeMode: 'cover',
  },
});
