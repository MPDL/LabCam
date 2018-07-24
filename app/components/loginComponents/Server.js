import React, { Component } from 'react';
import { Dimensions, Text, StyleSheet } from 'react-native';

class Server extends Component {
  constructor(props) {
    super();
    this.props = props;

    this.state = {
      server: 'https://keeper.mpdl.mpg.de',
    };
  }

  render() {
    const { width, height } = Dimensions.get('window');
    const textStyle =
      width > height
        ? [styles.serverText, { marginLeft: 24 + (width - height) / 2 }]
        : [styles.serverText, { marginLeft: 36 }];
    return <Text style={textStyle}>{this.state.server}</Text>;
    // return <Image style={styles.keeper} source={keeper} />;
  }
}

const styles = StyleSheet.create({
  serverText: {
    color: 'white',
    backgroundColor: 'transparent',
    marginLeft: 24,
    marginVertical: 10,
    alignSelf: 'flex-start',
  },
  keeper: {
    height: 23,
    width: 85,
    marginLeft: 24,
  },
});

export default Server;
