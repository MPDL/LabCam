import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { SafeAreaView, View, ScrollView, Text, StatusBar, Dimensions, Platform, StyleSheet } from 'react-native';
import CamColors from '../../common/CamColors';
import { isIphoneX } from '../iphoneXHelper';

class OcrModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLandscape: false,
    };
  }

  onLayout = (e) => {
    const { width, height } = Dimensions.get('window');
    if (width > height) {
      this.setState({
        isLandscape: true,
      });
    } else {
      this.setState({
        isLandscape: false,
      });
    }
  };

  render() {
    const {
      ocrScanText,
    } = this.props;
    const ocrResult = ocrScanText;

    const ocrLayerStyle = Platform.OS === 'android'
      ? styles.ocrLayer
      : isIphoneX() ? this.state.isLandscape
        ? [styles.ocrLayerIosX, { height: Dimensions.get('window').height - 166 }] : [styles.ocrLayerIosX, { height: Dimensions.get('window').height - 186 }]
        : styles.ocrLayerIos;

    return (
      <SafeAreaView style={ocrLayerStyle} onLayout={this.onLayout}>
        {this.props.ocrEnable && (
          <View style={styles.ocrModal}>
            <View style={styles.ocrTopPanel}>
              <Text style={styles.scanningText}>Scanning...</Text>
            </View>
            <ScrollView style={styles.ocrScrollView}>
              <Text textAlign="center">{ocrResult}</Text>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

OcrModal.propTypes = {
  ocrEnable: PropTypes.any.isRequired,
  ocrScanText: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  netOption: state.upload.netOption,
  ocrTextOnPause: state.upload.ocrTextOnPause,
});

export default connect(mapStateToProps)(OcrModal);

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
  ocrLayerIos: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  ocrLayerIosX: {
    position: 'absolute',
    top: 40 + StatusBar.currentHeight,
    left: 0,
    right: 0,
    bottom: 100,
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
    color: CamColors.keeperRed,
    textAlign: 'center',
    marginTop: 16,
  },
});
