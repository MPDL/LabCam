import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, SafeAreaView, FlatList, TouchableOpacity, StatusBar, NetInfo, Platform } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Immutable from 'seamless-immutable';
import LibraryActions from '../../redux/LibraryRedux';
import LibraryItem from '../../components/LibraryComponents/LibraryItem';
import { SmallText } from '../../common/CamText';
import styles from './styles';
import { requestReadPermission } from '../../tasks/PermissionHelper';

class LibraryScreen extends Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      cachedPaths: [],
      cachedLibrary: null,
    };
  }

  _s0: NavigationEventSubscription;

  componentDidMount() {
    this._s0 = this.props.navigation.addListener('willFocus', this._onWF);
    if (Platform.OS === 'android') {
      requestReadPermission();
    }
  }

  componentWillUnmount() {
    this._s0.remove();
  }

  _onWF = (a) => {
    const { destinationLibrary, paths, fetchLibraries, fetchDirectories } = this.props;
    this.setState({
      cachedPaths: paths,
      cachedLibrary: destinationLibrary,
    });
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if (connectionInfo.type !== 'none') {
        fetchLibraries();
        fetchDirectories(destinationLibrary, paths);
      }
    });
  };

  getDirectories = (library, paths) => {
    const { fetchDirectories } = this.props;
    fetchDirectories(library, paths);
  };

  createDir = paths =>
    (paths ? paths.map(p => `${p.name}/`).reduce((prev, cur) => prev + cur, '/') : '');

  confirmDirectory = () => {
    const { setParentDir, paths } = this.props;
    const parentDir = this.createDir(paths);
    setParentDir(parentDir);
    this.openCam();
  };

  cancelDirectory = () => {
    const { setParentDir, setPaths, setDestinationLibrary } = this.props;
    const { cachedPaths, cachedLibrary } = this.state;
    const parentDir = this.createDir(cachedPaths);
    setDestinationLibrary(cachedLibrary);
    setPaths(cachedPaths);
    setParentDir(parentDir);
  };

  openCam = () => {
    const { routes } = this.props.nav;
    if (routes.length > 1 && routes[routes.length - 2].routeName === 'Camera') {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.dispatch(NavigationActions.navigate({
        routeName: 'Camera',
      }));
    }
  };

  selectLibrary = library => () => {
    this.cleanPaths();
    this.props.setDestinationLibrary(library);
    this.getDirectories(library, []);
  };

  appendSubDir = (library) => {
    Object.values(library.subDir).filter(directory => directory.permission === 'rw');
  };

  cleanPaths = () => {
    const { setPaths } = this.props;
    setPaths([]);
  };

  selectDirectory = directory => () => {
    const { selectDirectories } = this.props;
    const mutableDirectory = Immutable.asMutable(directory, { deep: true });
    const curPaths = [...mutableDirectory.path, directory];
    selectDirectories(curPaths);
  };

  recursiveScan = (rwPermissionObj, rwPermissionList) => {
    const sub = Object.values(rwPermissionObj.subDir);
    for (let j = 0; j < sub.length; j += 1) {
      rwPermissionList.push(sub[j]);
      if (this.isOnPath(sub[j]) && sub[j].subDir) {
        this.recursiveScan(sub[j], rwPermissionList);
      }
    }
  };

  scanLibraries = (rwPermissionLibraries, rwPermissionList) => {
    const { destinationLibrary } = this.props;
    for (let i = 0; i < rwPermissionLibraries.length; i += 1) {
      rwPermissionList.push(rwPermissionLibraries[i]);
      if (
        destinationLibrary &&
        rwPermissionLibraries[i].id === destinationLibrary.id &&
        rwPermissionLibraries[i].subDir
      ) {
        this.recursiveScan(rwPermissionLibraries[i], rwPermissionList);
      }
    }
  };

  isOnPath = (rwPermissionObj) => {
    const { paths } = this.props;
    if (rwPermissionObj.path && paths) {
      const pathNames = paths.map(path => path.name);
      return (
        pathNames.includes(rwPermissionObj.name) &&
        rwPermissionObj.path.every(val => pathNames.includes(val.name))
      );
    }
    return false;
  };

  renderSeparator = () => (
    <View
      style={{
        height: 1,
        backgroundColor: '#CED0CE',
        marginHorizontal: 16,
      }}
    />
  );

  destiny = (destinationLibrary, paths) => {
    const destiny = destinationLibrary
      ? `${destinationLibrary.name} ${paths
        .map(path => (path ? ` > ${path.name}` : ''))
        .reduce((pre, cur) => pre + cur, '')}`
      : '';
    return destiny.length > 50 ? destiny.substring(destiny.length - 49) : destiny;
  };

  render() {
    const { destinationLibrary, libraries, paths } = this.props;

    const { cachedLibrary, cachedPaths } = this.state;

    const rwPermissionLibraries = libraries.filter(library => library.permission === 'rw');

    const rwPermissionList = [];

    this.scanLibraries(rwPermissionLibraries, rwPermissionList);

    const cancelActive =
      rwPermissionList &&
      rwPermissionList.length > 0 &&
      (cachedLibrary !== destinationLibrary || cachedPaths !== paths);

    const cancelTextStyle = cancelActive
      ? styles.cancelText
      : [styles.cancelText, { color: 'grey' }];

    const confirmActive = destinationLibrary && rwPermissionList && rwPermissionList.length > 0;

    const confirmTextStyle = confirmActive
      ? styles.confirmText
      : [styles.confirmText, { color: 'grey' }];

    const libView = (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent barStyle="light-content" />
        <View style={styles.card}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={this.confirmDirectory}
              disabled={!confirmActive}
            >
              <SmallText style={confirmTextStyle}>confirm</SmallText>
            </TouchableOpacity>
            <View style={styles.pathContainer}>
              <SmallText numberOfLines={2} style={styles.destiny}>
                {this.destiny(destinationLibrary, paths)}
              </SmallText>
            </View>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={this.cancelDirectory}
              disabled={!cancelActive}
            >
              <SmallText style={cancelTextStyle}>cancel</SmallText>
            </TouchableOpacity>
          </View>

          <View style={styles.dirList}>
            <FlatList
              data={rwPermissionList}
              renderItem={({ item }) => (
                <LibraryItem
                  item={item}
                  onLibPress={this.selectLibrary(item)}
                  onDirPress={this.selectDirectory(item)}
                  libId={destinationLibrary ? destinationLibrary.id : ''}
                  currentPaths={paths}
                />
              )}
              ItemSeparatorComponent={this.renderSeparator}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
    return libView;
  }
}

LibraryScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  libraries: PropTypes.array.isRequired,
  paths: PropTypes.array.isRequired,
  destinationLibrary: PropTypes.object,
  setDestinationLibrary: PropTypes.func.isRequired,
  setParentDir: PropTypes.func.isRequired,
  fetchLibraries: PropTypes.func.isRequired,
  fetchDirectories: PropTypes.func.isRequired,
  recursiveFetchDirectories: PropTypes.func.isRequired,
  setPaths: PropTypes.func.isRequired,
  selectDirectories: PropTypes.func.isRequired,
  nav: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  libraries: state.library.libraries,
  directories: state.library.directories,
  destinationLibrary: state.library.destinationLibrary,
  paths: state.library.paths,
  nav: state.nav,
});

const mapDispatchToProps = dispatch => ({
  setDestinationLibrary: destinationLibrary =>
    dispatch(LibraryActions.setDestinationLibrary(destinationLibrary)),
  setLibraries: libraries => dispatch(LibraryActions.setLibraries(libraries)),
  setParentDir: parentDir => dispatch(LibraryActions.setParentDir(parentDir)),
  fetchLibraries: () => dispatch(LibraryActions.fetchLibraries()),
  fetchDirectories: (library, path) => dispatch(LibraryActions.fetchDirectories(library, path)),
  recursiveFetchDirectories: (library, path) => dispatch(LibraryActions.recursiveFetchDirectories(library, path)),
  setPaths: paths => dispatch(LibraryActions.setPaths(paths)),
  selectDirectories: path => dispatch(LibraryActions.selectDirectories(path)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LibraryScreen);
