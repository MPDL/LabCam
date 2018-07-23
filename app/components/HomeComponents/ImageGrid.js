import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

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
const getImageUrl = (id, width, height) => `https://unsplash.it/${width}/${height}?image=${id}`;

class ImageGrid extends Component {
  static propTypes = {
    ImageComponent: PropTypes.any.isRequired,
  };

  constructor(props: Object) {
    super(props);

    fetch('https://unsplash.it/list')
      .then(res => res.json())
      .then(this.onFetchImagesSuccess)
      .catch(this.onFetchImagesError);
  }

  state = {
    images: [],
    itemHeight: 0,
  };

  onFetchImagesError = () => {
    this.setState({
      error: true,
    });
  };

  onFetchImagesSuccess = (images) => {
    this.setState({
      images,
    });
  };

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

  extractKey = item => item.id;

  renderItem = ({ item }) => {
    const { ImageComponent } = this.props;
    const uri = getImageUrl(item.id, 100, 100);
    return (
      <View style={styles.imageContainer}>
        <ImageComponent source={{ uri }} style={styles.image} />
      </View>
    );
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Error fetching images.</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <FlatList
          onLayout={this.onLayout}
          style={styles.list}
          columnWrapperStyle={[styles.columnWrapper, { height: this.state.itemHeight }]}
          data={this.state.images}
          renderItem={this.renderItem}
          numColumns={4}
          keyExtractor={this.extractKey}
          getItemLayout={this.getItemLayout}
        />
      </View>
    );
  }
}

export default ImageGrid;
