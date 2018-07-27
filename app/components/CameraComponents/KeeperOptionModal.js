import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { View, TouchableHighlight, StyleSheet, StatusBar } from 'react-native';
import Triangle from 'react-native-triangle';
import Icon from 'react-native-vector-icons/MaterialIcons';

import UploadActions from '../../redux/UploadRedux';
import { SmallText } from '../../common/CamText';
import CamColors from '../../common/CamColors';
import CamFonts from '../../common/CamFonts';

class KeeperOptionModal extends React.Component {
  constructor(props) {
    super();
    this.props = props;
  }

  toggleNetwork = () => {
    const { setNetOption, netOption } = this.props;
    setNetOption(netOption === 'Wifi only' ? 'Cellular' : 'Wifi only');
  };

  renderRow = (rowData, rowID, highlighted) => (
    <TouchableHighlight>
      <View style={styles.selectNetworkRow}>
        <SmallText style={[styles.selectNetworkRowText, highlighted && { color: 'black' }]}>
          {rowData}
        </SmallText>
      </View>
    </TouchableHighlight>
  );

  render() {
    const { destination } = this.props;
    const destinationText = destination
      ? destination.length > 15
        ? `${destination.substring(0, 13)}..`
        : destination
      : '';

    return (
      <View style={styles.root}>
        <Triangle
          width={20}
          height={12}
          color={CamColors.colorWithAlpha('green2', 0.5)}
          direction="up"
          style={styles.triangle}
        />
        <View style={styles.container}>
          <View style={styles.libraryRow}>
            <SmallText style={styles.folderOptionText}>Upload Photos to Keeper</SmallText>
            <SmallText style={styles.selectedLibrary} onPress={this.props.onSelectLibrary}>
              {destinationText}
              <Icon name="arrow-drop-down" size={16} />
            </SmallText>
          </View>
          <View style={styles.networkRow}>
            <SmallText style={styles.networkOptionText}>Upload Photos to Keeper over</SmallText>
            <SmallText style={styles.networkOption} onPress={this.toggleNetwork}>
              {`${this.props.netOption} `}
              <Icon name="arrow-drop-down" size={16} />
            </SmallText>
          </View>
          <SmallText style={styles.logout} onPress={this.props.logout}>
            Logout
          </SmallText>
        </View>
      </View>
    );
  }
}

KeeperOptionModal.propTypes = {
  destination: PropTypes.string.isRequired,
  onSelectLibrary: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  setNetOption: PropTypes.func.isRequired,
  netOption: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    marginHorizontal: 20,
    width: '100%',
    alignSelf: 'center',
    zIndex: 99,
  },
  triangle: {
    marginTop: 40 + StatusBar.currentHeight,
    marginHorizontal: 20,
  },
  container: {
    backgroundColor: CamColors.colorWithAlpha('green2', 0.5),
    // height: 120,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  libraryRow: {
    paddingHorizontal: 9,
    paddingVertical: CamFonts.normalize(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: CamColors.colorWithAlpha('white', 0.2),
    borderBottomWidth: 1,
  },
  selectedLibrary: {
    color: 'white',
    fontSize: 16,
  },
  networkRow: {
    paddingHorizontal: 9,
    paddingVertical: CamFonts.normalize(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: CamColors.colorWithAlpha('white', 0.2),
    borderBottomWidth: 1,
  },
  folderOptionText: {
    color: 'white',
    fontSize: 16,
  },
  networkOptionText: {
    color: 'white',
    fontSize: 16,
  },
  networkOption: {
    color: 'white',
    fontSize: 16,
  },
  logout: {
    marginTop: 12,
    alignSelf: 'center',
    color: 'red',
    fontSize: 16,
  },
});

const mapStateToProps = state => ({
  netOption: state.upload.netOption,
});

const mapDispatchToProps = dispatch => ({
  setNetOption: netOption => dispatch(UploadActions.setNetOption(netOption)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(KeeperOptionModal);
