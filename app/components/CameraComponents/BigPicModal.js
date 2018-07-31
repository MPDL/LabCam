import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { TouchableOpacity, Image, StatusBar, StyleSheet } from 'react-native';
import CamColors from '../../common/CamColors';

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
    top: 40 + StatusBar.currentHeight,
    left: 0,
    right: 0,
    bottom: 0,
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
