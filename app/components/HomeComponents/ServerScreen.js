import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import ImageGrid from './ImageGrid';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

class ServerScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ImageGrid ImageComponent={Image} />;
      </View>
    );
  }
}

export default ServerScreen;
