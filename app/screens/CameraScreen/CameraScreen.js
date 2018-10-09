import React from 'react';
import PropTypes from 'prop-types';
import {
  StatusBar,
  SafeAreaView,
  Image,
  Text,
  View,
  Alert,
  TouchableOpacity,
  CameraRoll,
  NetInfo,
  AppState,
  Platform,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import IIcon from 'react-native-vector-icons/Ionicons';
import AccountsActions from '../../redux/AccountsRedux';
import UploadActions from '../../redux/UploadRedux';
import LibraryActions from '../../redux/LibraryRedux';
import KeeperIcon from '../../images/keeper.png';
import {
  retrievePhotos,
  storePhotos,
  retrieveOcrTextFile,
  storeOcrTextFile,
  storeCurrentState,
  retrieveUploadError,
  storeUploadError,
} from '../../storage/DbHelper';
import { startService, stopService, createFile, hasFlash } from '../../tasks/OcrHelper';
import CamColors from '../../common/CamColors';
import styles from './styles';
import OcrModal from '../../components/CameraComponents/OcrModal';
import KeeperOptionModal from '../../components/CameraComponents/KeeperOptionModal';
import BigPicModal from '../../components/CameraComponents/BigPicModal';
// import WarningModal from '../../components/CameraComponents/WarningModal';

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const androidOptions = {
  fixOrientation: true,
  // quality: 1,
  // base64: true,
  // exif: true,
  skipProcessing: true,
};

const iosOptions = {
  forceUpOrientation: true,
};

class CameraScreen extends React.Component {
  state = {
    hasFlash: false,
    flash: 'off',
    autoFocus: 'on',
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    keeperOptionVisible: false,
    bigPicVisible: false,
    countClick: 0,
    countTakePhoto: 0,
    isCameraReady: true,
    lastPhotoUri: '',
    netInfo: '',
    appState: AppState.currentState,
    ocrEnable: false,
    isScanning: true,
    ocrScanText: '',
    dateTime: 0,
  };

  componentWillMount() {
    if (Platform.OS === 'android') {
      hasFlash().then(flash =>
        this.setState({
          hasFlash: flash,
        }));
    } else {
      this.setState({
        hasFlash: true,
      });
    }
  }

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
  };

  setFocusDepth = (depth) => {
    this.setState({
      depth,
    });
  };

  _handleConnectionChange = (connectionInfo) => {
    const { batchUpload, netOption } = this.props;
    console.log(connectionInfo);
    console.log(netOption);

    retrievePhotos().then((photos) => {
      if (photos && photos.length > 0) {
        switch (netOption) {
          case 'Wifi only':
            if (connectionInfo.type === 'wifi') {
              console.log('Wifi only');
              batchUpload(photos);
            }
            break;
          case 'Cellular':
            if (connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') {
              batchUpload(photos);
            }
            break;
          default:
            break;
        }
      }
      this.setState({
        netInfo: connectionInfo.type,
      });
    });
  };

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      storeCurrentState('active');
      if (Platform.OS === 'android') {
        stopService();
        retrieveUploadError().then((uploadError) => {
          if (uploadError && uploadError.length > 0) {
            this.showFolderNotExistAlert();
            storeUploadError('');
          }
        });
      } else if (Platform.OS === 'ios') {
        this.props.syncUploadProgress(); // ios background db write bug
      }
      NetInfo.getConnectionInfo().then((connectionInfo) => {
        this.setState({
          netInfo: connectionInfo.type,
        });
      });
    } else if (this.state.appState.match(/active/) && nextAppState === 'background') {
      console.log('App has come to the background!');
      storeCurrentState('background');
      if (Platform.OS === 'android') {
        startService();
      }
    }
    this.setState({ appState: nextAppState });
  };

  toggleKeeperOption = () => {
    this.setState({
      keeperOptionVisible: !this.state.keeperOptionVisible,
      ocrEnable: false,
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

  toggleOcr = () => {
    const { setOcrTextOnPause } = this.props;
    this.setState({
      keeperOptionVisible: false,
    });

    this.setState({
      ocrEnable:
        this.state.ocrEnable === false
          ? (d) => {
            if (Date.now() - this.state.dateTime > 3000) {
              const ocrScanText = d.textBlocks.sort((a, b) => a.bounds.origin.y - b.bounds.origin.y).map(e => e.value).reduce((prev, cur) =>
                `${prev}\n${cur}`, '');
              this.setState({
                ocrScanText,
              });
              this.setState({
                dateTime: Date.now(),
              });
            }
          }
          : false,
    });

    this.setState({
      ocrScanText: '',
    });

    setOcrTextOnPause('');
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

  toggleScan = () => {
    const { ocrScanText, isScanning } = this.state;
    const { setOcrTextOnPause } = this.props;
    if (isScanning) {
      // pause
      setOcrTextOnPause(ocrScanText);
    } else {
      setOcrTextOnPause('');
    }

    this.setState({
      isScanning: !this.state.isScanning,
    });
  };

  toggleBigPic = () => {
    if (this.state.lastPhotoUri) {
      this.setState({
        bigPicVisible: !this.state.bigPicVisible,
      });
    }
  }

  takePicture = async () => {
    this.setState({
      countClick: this.state.countClick + 1,
      isCameraReady: false,
    });

    const options = Platform.OS === 'android' ? androidOptions : iosOptions;
    if (this.camera) {
      this.camera.takePictureAsync(options).then((photo) => {
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
    const { uploadFile, netOption } = this.props;
    const { netInfo } = this.state;
    console.log(netInfo);
    console.log(netOption);
    switch (netOption) {
      case 'Wifi only':
        if (netInfo === 'wifi') {
          console.log('Wifi only');
          uploadFile(photoDTO);
        }
        break;
      case 'Cellular':
        if (netInfo === 'wifi' || netInfo === 'cellular') {
          uploadFile(photoDTO);
        }
        break;
      default:
        break;
    }
  };

  saveToCameraRoll = (image) => {
    CameraRoll.saveToCameraRoll(image.uri).then((contentUri) => {
      this.setState({
        lastPhotoUri: contentUri,
      });
      const fileName = image.uri.substring(image.uri.lastIndexOf('/') + 1);
      retrievePhotos().then((photos) => {
        photos.push({
          fileName,
          contentUri,
        });

        storePhotos(photos).then(() => {
          if (this.state.netInfo !== 'none') {
            setTimeout(() => {
              this.uploadToKeeper({
                fileName,
                contentUri,
              });
            }, 2000);
          }
        });
      });
      this.uploadOcr(fileName);
    });
  };

  uploadOcr = async (fileName) => {
    const { ocrTextOnPause } = this.props;
    const { isScanning } = this.state;
    if (isScanning) return;
    if (ocrTextOnPause === '') {
      this.toggleScan();
      return;
    }
    const mdFileName = fileName.replace('jpg', 'md');
    const contentUri = await createFile(ocrTextOnPause, mdFileName);
    const ocrTextFileList = await retrieveOcrTextFile();
    ocrTextFileList.push({
      fileName: mdFileName,
      contentUri,
      text: ocrTextOnPause,
    });
    storeOcrTextFile(ocrTextFileList);
    if (this.state.netInfo !== 'none') {
      this.uploadToKeeper({
        fileName: mdFileName,
        contentUri,
      });
    }
    this.toggleScan();
  }

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
    retrievePhotos().then((photos) => {
      if (photos.length > 0) {
        this.logoutAlert('Unuploaded files detected, these files will not be uploaded by clicking the "Logout" button.');
      } else {
        retrieveOcrTextFile().then((files) => {
          if (files.length > 0) {
            this.logoutAlert('Unuploaded files detected, these files will not be uploaded by clicking the "Logout" button.');
          } else {
            this.logoutAlert('Are you sure to logout?');
          }
        });
      }
    });
  };

  logoutAlert = (message) => {
    Alert.alert('Logout', message, [
      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          const {
            setAuthenticateResult, setDestinationLibrary, setPaths, setParentDir, setLibraries,
          } = this.props;
          setAuthenticateResult(null);
          setDestinationLibrary(null);
          setPaths([]);
          setParentDir(null);
          setLibraries([]);
          storePhotos([]);
          storeOcrTextFile([]);
          storeCurrentState('none');
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
  }

  destination = () => {
    const { paths, destinationLibrary } = this.props;
    if (paths && paths.length) {
      return paths[paths.length - 1].name;
    }
    return destinationLibrary ? destinationLibrary.name : null;
  };

  isShowWarning = () => {
    const { netInfo, keeperOptionVisible, bigPicVisible } = this.state;
    const { netOption } = this.props;
    if (Platform.OS === 'ios' && !keeperOptionVisible && !bigPicVisible) {
      switch (netOption) {
        case 'Wifi only':
          if (netInfo && netInfo !== 'wifi' && netInfo !== 'unknown') { // 'unknown at init'
            return true;
          }
          break;
        case 'Cellular':
          if (netInfo !== 'wifi' && netInfo !== 'cellular') {
            return true;
          }
          break;
        default:
          break;
      }
    }
    return false;
  }

  renderTopMenu = () => {
    const OCRStyle = this.state.ocrEnable === false ?
      [styles.photoHelper, { color: 'grey' }]
      : [styles.photoHelper, { color: CamColors.green2 }];
    return (
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
          {
            <TouchableOpacity onPress={this.toggleOcr}>
              <Text style={OCRStyle}>OCR</Text>
            </TouchableOpacity>
          }
          {
            this.state.hasFlash &&
            <TouchableOpacity onPress={this.toggleFlash}>
              <MIcon name={`flash-${this.state.flash}`} color="white" size={24} style={styles.topMenuIcon} />
            </TouchableOpacity>
          }
          {/* <TouchableOpacity onPress={this.getRatios}>
              <MIcon name="aspect-ratio" color="white" size={24} style={styles.topMenuIcon} />
            </TouchableOpacity> */}
        </View>
      </View>
    );
  }

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
      onTextRecognized={this.state.ocrEnable}
      // onTextRecognized={this.onTxtRecognized}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={this.closeKeeperOption}
      />
      <View
        style={{
          height: 80,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignSelf: 'center',
          width: '100%',
        }}
      >
        <TouchableOpacity
          style={[{ alignSelf: 'flex-end', marginBottom: 10 }]}
          onPress={this.toggleBigPic}
        >
          {this.state.lastPhotoUri === '' ?
            <View
              style={[styles.preview, { backgroundColor: CamColors.colorWithAlpha('white', 0.5) }]}
            /> :
            <Image
              style={styles.preview}
              source={{ uri: this.state.lastPhotoUri }}
            />}

        </TouchableOpacity>
        <TouchableOpacity
          style={[{ alignSelf: 'flex-end', marginBottom: 6 }]}
          onPress={this.takePicture}
          disabled={!this.state.isCameraReady}
        >
          <Icon name="camera" color="white" size={24} style={styles.cameraIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[{ alignSelf: 'flex-end', marginBottom: 6 }]}
          onPress={this.toggleFacing}
        >
          <IIcon name="ios-reverse-camera" color="white" size={38} style={styles.flipIcon} />
        </TouchableOpacity>
      </View >
    </RNCamera>
  );

  showFolderNotExistAlert = () => {
    Alert.alert(
      'Upload not successful', "Couldn't find selected folder, please choose another one", [
        {
          text: 'change',
          onPress: () => {
            this.props.clearUploadError();
            this.props.navigation.dispatch(NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'Library',
                }),
              ],
            }));
          },
        }],
      { cancelable: false },
    );
  }

  render() {
    if (this.props.uploadError && this.props.uploadError.length > 0) {
      this.showFolderNotExistAlert();
    }
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent barStyle="light-content" />
        {this.renderTopMenu()}
        {!this.state.ocrEnable && this.state.keeperOptionVisible && (
          <KeeperOptionModal
            libraries={this.props.libraries}
            onSelectLibrary={this.onSelectLibrary}
            destination={this.destination()}
            logout={this.logout}
          />
        )}
        {this.state.ocrEnable &&
          <OcrModal
            ocrEnable={this.state.ocrEnable}
            ocrScanText={this.state.ocrScanText}
            isScanning={this.state.isScanning}
            toggleScan={this.toggleScan}
          />
        }
        {this.state.bigPicVisible &&
          <BigPicModal
            toggleBigPic={this.toggleBigPic}
            uri={this.state.lastPhotoUri}
          />
        }
        {/* {this.isShowWarning() &&
          <WarningModal />
        } */}
        {this.renderCamera()}
      </SafeAreaView>
    );
  }
}

CameraScreen.propTypes = {
  paths: PropTypes.array.isRequired,
  libraries: PropTypes.array.isRequired,
  batchUpload: PropTypes.func.isRequired,
  syncUploadProgress: PropTypes.func.isRequired,
  uploadFile: PropTypes.func.isRequired,
  setAuthenticateResult: PropTypes.func.isRequired,
  setDestinationLibrary: PropTypes.func.isRequired,
  setLibraries: PropTypes.func.isRequired,
  setPaths: PropTypes.func.isRequired,
  setParentDir: PropTypes.func.isRequired,
  netOption: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  destinationLibrary: PropTypes.object,
  nav: PropTypes.object.isRequired,
  setOcrTextOnPause: PropTypes.func.isRequired,
  uploadError: PropTypes.string.isRequired,
  clearUploadError: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  server: state.accounts.server,
  libraries: state.library.libraries,
  destinationLibrary: state.library.destinationLibrary,
  paths: state.library.paths,
  netOption: state.upload.netOption,
  ocrTextOnPause: state.upload.ocrTextOnPause,
  uploadError: state.upload.error,
  nav: state.nav,
});

const mapDispatchToProps = dispatch => ({
  uploadFile: photo => dispatch(UploadActions.uploadFile(photo)),
  batchUpload: photos => dispatch(UploadActions.batchUpload(photos)),
  syncUploadProgress: () => dispatch(UploadActions.syncUploadProgress()),
  fetchLibraries: () => dispatch(LibraryActions.fetchLibraries()),
  setDestinationLibrary: destinationLibrary =>
    dispatch(LibraryActions.setDestinationLibrary(destinationLibrary)),
  setLibraries: libraries => dispatch(LibraryActions.setLibraries(libraries)),
  setPaths: paths => dispatch(LibraryActions.setPaths(paths)),
  setParentDir: parentDir => dispatch(LibraryActions.setParentDir(parentDir)),
  setAuthenticateResult: result => dispatch(AccountsActions.setAuthenticateResult(result)),
  setNetOption: netOption => dispatch(UploadActions.setNetOption(netOption)),
  setOcrTextOnPause: ocrTextOnPause => dispatch(UploadActions.setOcrTextOnPause(ocrTextOnPause)),
  clearUploadError: () => dispatch(UploadActions.uploadError('')),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CameraScreen);
