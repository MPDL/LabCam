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
} from '../../storage/DbHelper';
import { startService, stopService, createFile, hasFlash } from '../../tasks/OcrHelper';
import CamColors from '../../common/CamColors';
import styles from './styles';
import OcrModal from '../../components/CameraComponents/OcrModal';
import KeeperOptionModal from '../../components/CameraComponents/KeeperOptionModal';
import BigPicModal from '../../components/CameraComponents/BigPicModal';

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
    hasFlash().then(flash =>
      this.setState({
        hasFlash: flash,
      }));
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
      stopService();
    } else if (this.state.appState.match(/active/) && nextAppState === 'background') {
      console.log('App has come to the background!');
      storeCurrentState('background');
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

  toggleOcr = () => {
    const { setOcrTextOnPause } = this.props;
    this.setState({
      ocrEnable:
        this.state.ocrEnable === false
          ? (d) => {
            if (Date.now() - this.state.dateTime > 3000) {
              const ocrScanText = d.textBlocks.map(e => e.value).reduce((prev, cur) =>
                `${prev}\n${cur}`, '');
              this.setState({
                ocrScanText,
              });
              this.setState({
                dateTime: Date.now(),
              });
              console.log(d);
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
            this.uploadToKeeper({
              fileName,
              contentUri,
            });
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
    const contentUri = await createFile(ocrTextOnPause);
    const ocrTextFileList = await retrieveOcrTextFile();
    const mdFileName = fileName.replace('jpg', 'md');
    ocrTextFileList.push({
      fileName: mdFileName,
      contentUri,
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
          <TouchableOpacity onPress={this.toggleOcr}>
            <Text style={OCRStyle}>OCR</Text>
          </TouchableOpacity>
          {/* <Text style={styles.photoHelper}>
            {`${this.state.netInfo} ${this.state.countClick}/${this.state.countTakePhoto}`}
          </Text> */}
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
      exif
      onTextRecognized={this.state.ocrEnable}
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

  render() {
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
  setAuthenticateResult: PropTypes.func.isRequired,
  netOption: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  destinationLibrary: PropTypes.object,
  nav: PropTypes.object.isRequired,
  setOcrTextOnPause: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  server: state.accounts.server,
  libraries: state.library.libraries,
  destinationLibrary: state.library.destinationLibrary,
  paths: state.library.paths,
  netOption: state.upload.netOption,
  ocrTextOnPause: state.upload.ocrTextOnPause,
  nav: state.nav,
});

const mapDispatchToProps = dispatch => ({
  uploadFile: photo => dispatch(UploadActions.uploadFile(photo)),
  batchUpload: photos => dispatch(UploadActions.batchUpload(photos)),
  fetchLibraries: () => dispatch(LibraryActions.fetchLibraries()),
  setDestinationLibrary: destinationLibrary =>
    dispatch(LibraryActions.setDestinationLibrary(destinationLibrary)),
  setAuthenticateResult: result => dispatch(AccountsActions.setAuthenticateResult(result)),
  setNetOption: netOption => dispatch(UploadActions.setNetOption(netOption)),
  setOcrTextOnPause: ocrTextOnPause => dispatch(UploadActions.setOcrTextOnPause(ocrTextOnPause)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CameraScreen);
