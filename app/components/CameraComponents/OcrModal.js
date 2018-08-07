import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { View, ScrollView, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import CamColors from '../../common/CamColors';
import UploadActions from '../../redux/UploadRedux';

class OcrModal extends React.Component {
  render() {
    const {
      ocrScanText, isScanning, ocrTextOnPause, toggleScan,
    } = this.props;
    const ocrResult = ocrTextOnPause === '' ? ocrScanText : ocrTextOnPause;

    const scanSwitchStyle = !isScanning
      ? styles.scanSwitch
      : [styles.scanSwitch, { backgroundColor: CamColors.red2 }];

    return (
      <View style={styles.ocrLayer}>
        {this.props.ocrEnable && (
          <View style={styles.ocrModal}>
            <View style={styles.ocrTopPanel}>
              <Text style={styles.scanningText}>{isScanning ? 'Scanning...' : ''}</Text>
              <TouchableOpacity style={scanSwitchStyle} onPress={toggleScan}>
                <Text style={styles.toggleText}>{isScanning ? 'Pause' : 'Resume'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hintSaveText}>
              {isScanning ? '' : 'OCR Text will be upload with next Photo'}
            </Text>
            <ScrollView style={styles.ocrScrollView}>
              <Text textAlign="center">{ocrResult}</Text>
            </ScrollView>
          </View>
        )}
      </View>
    );
  }
}

OcrModal.propTypes = {
  ocrEnable: PropTypes.any.isRequired,
  isScanning: PropTypes.bool.isRequired,
  ocrScanText: PropTypes.string.isRequired,
  ocrTextOnPause: PropTypes.string.isRequired,
  toggleScan: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  netOption: state.upload.netOption,
  ocrTextOnPause: state.upload.ocrTextOnPause,
});

const mapDispatchToProps = dispatch => ({
  setOcrTextOnPause: ocrTextOnPause => dispatch(UploadActions.setOcrTextOnPause(ocrTextOnPause)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OcrModal);

const styles = StyleSheet.create({
  ocrLayer: {
    position: 'absolute',
    top: 40 + StatusBar.currentHeight,
    left: 0,
    right: 0,
    bottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  ocrModal: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: CamColors.colorWithAlpha('white', 0.5),
    padding: 5,
  },
  ocrTopPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    height: 50,
    width: '100%',
  },
  scanSwitch: {
    backgroundColor: CamColors.green2,
    width: 80,
    height: 30,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ocrScrollView: {
    flex: 1,
    padding: 16,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  scanningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CamColors.green2,
  },
  hintSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CamColors.red2,
    textAlign: 'center',
    marginTop: 16,
  },
});
