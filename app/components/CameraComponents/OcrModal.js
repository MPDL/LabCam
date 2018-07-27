import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import CamColors from '../../common/CamColors';

class OcrModal extends React.Component {
  state = {
    isScanning: true,
    ocrTempResult: '',
  };

  toggleScan = () => {
    const { ocrText } = this.props;
    console.log(ocrText);
    if (this.state.isScanning) {
      this.setState({
        ocrTempResult: ocrText,
      });
    } else {
      this.setState({
        ocrTempResult: '',
      });
    }

    this.setState({
      isScanning: !this.state.isScanning,
    });
  };

  render() {
    const { ocrText } = this.props;
    const { isScanning, ocrTempResult } = this.state;
    const ocrResult = ocrTempResult === '' ? ocrText : ocrTempResult;

    return (
      <View style={styles.ocrLayer}>
        {this.props.ocrEnable && (
          <View style={styles.ocrModal}>
            <View style={styles.ocrTopPanel}>
              <Text>Scanning...</Text>
              <TouchableOpacity style={styles.scanSwitch} onPress={this.toggleScan}>
                <Text>{isScanning ? 'Stop' : 'Start'}</Text>
              </TouchableOpacity>
            </View>
            <Text textAlign="center" style={styles.ocrResult}>
              {ocrResult}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

OcrModal.propTypes = {
  ocrEnable: PropTypes.any.isRequired,
  ocrText: PropTypes.string.isRequired,
};

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
    width: '80%',
    height: '60%',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: CamColors.colorWithAlpha('white', 0.5),
    borderRadius: 20,
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
  scanSwitch: {},
  ocrResult: {
    flex: 1,
    padding: 16,
  },
});

const mapStateToProps = state => ({
  netOption: state.upload.netOption,
});

export default connect(mapStateToProps)(OcrModal);
