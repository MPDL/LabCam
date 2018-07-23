import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  CameraRoll,
  Image,
  View,
  Text,
  TouchableOpacity,
  Picker,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import UploadActions from '../redux/UploadRedux';
import LibraryActions from '../redux/LibraryRedux';

class PlayGroundScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      library: 'not selected',
      photo: null,
    };
  }

  componentWillMount() {
    this.getLibraries();
  }

  onUploadPress = () => {
    const { uploadFile } = this.props;
    const repo = this.state.library;
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'All',
    })
      .then((r) => {
        console.log(r);
        if ((repo, r.edges[0].node.image)) {
          this.setState({
            photo: r.edges[0],
          });
          uploadFile(repo, r.edges[0].node.image);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getLibraries = () => {
    const { fetchLibraries } = this.props;
    fetchLibraries();
  };

  openCamera = () => {
    console.log('openCamera');
    this.props.navigation.dispatch(NavigationActions.navigate({
      routeName: 'Camera',
    }));
  };

  render() {
    const { libraries } = this.props;
    const simpleView = (
      <View style={styles.container}>
        <StatusBar translucent barStyle="light-content" />
        <View style={styles.header} />
        <View style={styles.main}>
          <TouchableOpacity onPress={this.onUploadPress}>
            <Text style={styles.uploadLabel}>upload</Text>
          </TouchableOpacity>
          <Picker
            style={styles.libraryPicker}
            selectedValue={this.state.library}
            onValueChange={(itemValue) => {
              console.log(itemValue);
              this.setState({ library: itemValue });
              if (itemValue) {
                this.props.setDestinationLibrary(itemValue);
              }
            }}
          >
            {libraries.map(item => <Picker.Item label={item.name} value={item} key={item.id} />)}
          </Picker>
          {this.state.photo && (
            <Image
              style={{
                width: 400,
                height: 500,
              }}
              source={{ uri: this.state.photo.node.image.uri }}
            />
          )}
        </View>
        <View style={styles.footer}>
          <Text onPress={this.openCamera}>Camera</Text>
        </View>
      </View>
    );
    return simpleView;
  }
}

PlayGroundScreen.propTypes = {
  libraries: PropTypes.array.isRequired,
  uploadFile: PropTypes.func.isRequired,
  fetchLibraries: PropTypes.func.isRequired,
  setDestinationLibrary: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    // backgroundColor: 'black',
  },
  header: {
    height: 0,
  },
  footer: {
    height: 100,
    backgroundColor: '#ccc',
  },
  main: {
    flex: 1,
    alignItems: 'center',
  },
  getDestinationLibraryLabel: {
    fontSize: 40,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  uploadLabel: {
    fontSize: 40,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  libraryPicker: {
    width: 150,
  },
});

const mapStateToProps = state => ({
  server: state.accounts.server,
  libraries: state.library.libraries,
});

const mapDispatchToProps = dispatch => ({
  uploadFile: (repo, file) => dispatch(UploadActions.uploadFile(repo, file)),
  fetchLibraries: () => dispatch(LibraryActions.fetchLibraries()),
  setDestinationLibrary: destinationLibrary =>
    dispatch(LibraryActions.setDestinationLibrary(destinationLibrary)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PlayGroundScreen);
