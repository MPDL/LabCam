import React from 'react';
import { View, StyleSheet } from 'react-native';
import CamColors from '../../common/CamColors';
import { SmallText } from '../../common/CamText';

class WarningModal extends React.Component {
  render() {
    return (
      <View style={styles.root}>
        <SmallText style={styles.warningText}>
          Photos will be uploaded when you reopen LabCam with Internet Connection
        </SmallText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    marginTop: 60,
    marginHorizontal: 20,
    width: '100%',
    alignSelf: 'center',
    zIndex: 100,
    backgroundColor: CamColors.colorWithAlpha(CamColors.keeperRed, 0.5),
    paddingVertical: 10,
  },
  warningText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default WarningModal;
