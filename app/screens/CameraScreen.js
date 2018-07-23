import React from 'react';
import PropTypes from 'prop-types';
import {
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Image,
  Text,
  View,
  Alert,
  TouchableOpacity,
  CameraRoll,
  NetInfo,
  AppState,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import AccountsActions from '../redux/AccountsRedux';
import UploadActions from '../redux/UploadRedux';
import LibraryActions from '../redux/LibraryRedux';
import KeeperOptionModal from '../components/CameraComponents/KeeperOptionModal';
import KeeperIcon from '../images/keeper.png';
import {
  retrievePhotos,
  storePhotos,
  retrieveOcrPhotos,
  storeOcrPhotos,
} from '../storage/DbHelper';
import { startService, stopService, startOcrService } from '../tasks/OcrHelper';

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    autoFocus: 'on',
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    keeperOptionVisible: false,
    countClick: 0,
    countTakePhoto: 0,
    isCameraReady: true,
    netInfo: '',
    appState: AppState.currentState,
  };

  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      this.setState({
        netInfo: connectionInfo.type,
      });
    });
    NetInfo.addEventListener('connectionChange', this._handleConnectionChange);
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this._handleConnectionChange);
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  onSelectLibrary = () => {
    this.goBack();
  };

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatiosAsync();
    Alert.alert('Ratios', ratios.join());
    startOcrService();
  };

  setFocusDepth = (depth) => {
    this.setState({
      depth,
    });
  };

  _handleConnectionChange = (connectionInfo) => {
    const { batchUpload } = this.props;
    console.log(connectionInfo);
    retrievePhotos().then((photos) => {
      if (photos && photos.length > 0 && connectionInfo.type === 'wifi') {
        batchUpload(photos);
      }
      this.setState({
        netInfo: connectionInfo.type,
      });
    });
  };

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      stopService();
    } else if (this.state.appState.match(/active/) && nextAppState === 'background') {
      console.log('App has come to the background!');
      startService();
    }
    this.setState({ appState: nextAppState });
  };

  toggleKeeperOption = () => {
    this.setState({
      keeperOptionVisible: !this.state.keeperOptionVisible,
    });
  };

  closeKeeperOption = () => {
    this.setState({
      keeperOptionVisible: false,
    });
  };

  toggleFacing = () => {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  };

  toggleFlash = () => {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  };

  toggleWB = () => {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  };

  toggleFocus = () => {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  };

  takePicture = async () => {
    this.setState({
      countClick: this.state.countClick + 1,
      isCameraReady: false,
    });
    if (this.camera) {
      this.camera.takePictureAsync({ quality: 1 }).then((photo) => {
        console.log(photo);
        this.setState({
          isCameraReady: true,
          countTakePhoto: this.state.countTakePhoto + 1,
        });
        this.saveToCameraRoll(photo);
      });
    }
  };

  uploadToKeeper = (photoDTO) => {
    const { uploadFile } = this.props;
    uploadFile(photoDTO);
  };

  saveToCameraRoll = (image) => {
    CameraRoll.saveToCameraRoll(image.uri).then((contentUri) => {
      const fileName = image.uri.substring(image.uri.lastIndexOf('/') + 1);
      retrievePhotos().then((photos) => {
        photos.push({
          fileName,
          contentUri,
        });

        storePhotos(photos).then(() => {
          if (this.state.netInfo !== 'none') {
            this.uploadToKeeper({
              fileName,
              contentUri,
            });
          }
        });
      });

      // recognizeOcr(contentUri, fileName).then((ocr) => { console.log(ocr); });
      retrieveOcrPhotos().then((photos) => {
        const mdFileName = fileName.replace('jpg', 'md');
        photos.push({
          fileName: mdFileName,
          contentUri,
        });
        storeOcrPhotos(photos);
      });
    });
  };

  goBack = () => {
    const { nav } = this.props;
    if (nav.index === 0) {
      this.props.navigation.dispatch(NavigationActions.navigate({
        routeName: 'Library',
      }));
    } else {
      this.props.navigation.goBack();
    }
  };

  logout = () => {
    Alert.alert('Logout', 'Are you sure to logout?', [
      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          const { setAuthenticateResult } = this.props;
          setAuthenticateResult(null);
          this.props.navigation.dispatch(NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'Login',
              }),
            ],
          }));
        },
      },
    ]);
  };

  destination = () => {
    const { paths, destinationLibrary } = this.props;
    if (paths && paths.length) {
      return paths[paths.length - 1].name;
    }
    return destinationLibrary.name;
  };

  resetCount = () => {
    this.setState({
      countClick: 0,
      countTakePhoto: 0,
    });
    storePhotos([]);
  };

  renderTopMenu = () => (
    <View style={styles.menuBar}>
      <TouchableOpacity style={styles.keeperIcon} onPress={this.toggleKeeperOption}>
        <Image
          style={{
            alignSelf: 'center',
            height: 24,
            width: 24,
          }}
          resizeMode="cover"
          source={KeeperIcon}
        />
      </TouchableOpacity>

      <View style={styles.cameraOption}>
        <TouchableOpacity onPress={this.resetCount}>
          <Text style={styles.photoHelper}>R</Text>
        </TouchableOpacity>
        <Text style={styles.photoHelper}>
          {`${this.state.netInfo} ${this.state.countClick}/${this.state.countTakePhoto}`}
        </Text>
        <TouchableOpacity onPress={this.toggleFlash}>
          <Icon name="flash" color="white" size={24} style={styles.flipIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.getRatios}>
          <MIcon name="aspect-ratio" color="white" size={24} style={styles.flipIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.toggleFacing}>
          <Icon name="refresh" color="white" size={24} style={styles.flipIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  renderCamera = () => (
    <RNCamera
      ref={(ref) => {
        this.camera = ref;
      }}
      style={{
        flex: 1,
      }}
      type={this.state.type}
      flashMode={this.state.flash}
      autoFocus={this.state.autoFocus}
      whiteBalance={this.state.whiteBalance}
      ratio={this.state.ratio}
      focusDepth={this.state.depth}
      permissionDialogTitle="Permission to use camera"
      permissionDialogMessage="We need your permission to use your camera phone"
    >
      <Text
        style={{
          flex: 0.85,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
        onPress={this.closeKeeperOption}
      />
      <View
        style={{
          flex: 0.15,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          alignSelf: 'center',
        }}
      >
        <TouchableOpacity
          style={[{ alignSelf: 'flex-end', marginBottom: 6 }]}
          onPress={this.takePicture}
          disabled={!this.state.isCameraReady}
        >
          <Icon name="camera" color="white" size={24} style={styles.cameraIcon} />
        </TouchableOpacity>
      </View>
    </RNCamera>
  );

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent barStyle="light-content" />
        {this.renderTopMenu()}
        {this.state.keeperOptionVisible && (
          <KeeperOptionModal
            libraries={this.props.libraries}
            onSelectLibrary={this.onSelectLibrary}
            destination={this.destination()}
            logout={this.logout}
          />
        )}
        {this.renderCamera()}
      </SafeAreaView>
    );
  }
}

CameraScreen.propTypes = {
  paths: PropTypes.array.isRequired,
  libraries: PropTypes.array.isRequired,
  batchUpload: PropTypes.func.isRequired,
  uploadFile: PropTypes.func.isRequired,
  // photos: PropTypes.array.isRequired,
  // setPhotos: PropTypes.func.isRequired,
  setAuthenticateResult: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  destinationLibrary: PropTypes.object,
  nav: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  server: state.accounts.server,
  libraries: state.library.libraries,
  destinationLibrary: state.library.destinationLibrary,
  paths: state.library.paths,
  // photos: state.upload.photos,
  nav: state.nav,
});

const mapDispatchToProps = dispatch => ({
  uploadFile: photo => dispatch(UploadActions.uploadFile(photo)),
  batchUpload: photos => dispatch(UploadActions.batchUpload(photos)),
  fetchLibraries: () => dispatch(LibraryActions.fetchLibraries()),
  setDestinationLibrary: destinationLibrary =>
    dispatch(LibraryActions.setDestinationLibrary(destinationLibrary)),
  // setPhotos: photos => dispatch(UploadActions.setPhotos(photos)),
  setAuthenticateResult: result => dispatch(AccountsActions.setAuthenticateResult(result)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CameraScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: StatusBar.currentHeight,
  },
  navigation: {
    flex: 1,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuBar: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    height: 40,
  },
  keeperIcon: {
    marginLeft: 10,
    width: 24,
    height: 24,
  },
  cameraOption: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  flipIcon: {
    marginHorizontal: 16,
  },
  cameraIcon: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 30,
    zIndex: 99,
  },
  row: {
    flexDirection: 'row',
  },
  photoHelper: {
    color: 'red',
    fontSize: 15,
    marginHorizontal: 8,
  },
});
