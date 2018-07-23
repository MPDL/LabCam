import React from 'react';
import { StyleSheet, View, FlatList, CameraRoll, Image } from 'react-native';

const MARGIN = 2;
const STATUS_BAR_HEIGHT = 0;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  list: {
    marginTop: STATUS_BAR_HEIGHT,
    flex: 1,
  },
  columnWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: -MARGIN,
    marginRight: -MARGIN,
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    margin: MARGIN,
    backgroundColor: '#eee',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'stretch',
  },
});

class LocalScreen extends React.Component {
  state = {
    photos: [],
    itemHeight: 0,
  };
  componentDidMount() {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Photos',
    })
      .then((r) => {
        this.setState({ photos: r.edges });
      })
      .catch((err) => {
        // Error Loading Images
      });
  }

  onLayout = (e) => {
    const { width } = e.nativeEvent.layout;
    this.setState({
      itemHeight: width / 4,
    });
  };
  getItemLayout = (data, index) => {
    const { itemHeight } = this.state;
    return { length: itemHeight, offset: itemHeight * index, index };
  };

  extractKey = item => item.uri;
  renderItem = ({ item }) => {
    const { uri } = item.node.image;
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri }} style={styles.image} />
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          onLayout={this.onLayout}
          style={styles.list}
          columnWrapperStyle={[styles.columnWrapper, { height: this.state.itemHeight }]}
          data={this.state.photos}
          renderItem={this.renderItem}
          numColumns={4}
          keyExtractor={this.extractKey}
          getItemLayout={this.getItemLayout}
        />
      </View>
    );
  }
}

export default LocalScreen;
