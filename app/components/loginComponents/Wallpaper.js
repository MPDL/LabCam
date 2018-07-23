import React, { Component } from 'react';
import propTypes from 'prop-types';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const styles = StyleSheet.create({
  picture: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: '#006f7b',
    paddingTop: StatusBar.currentHeight,
  },
});

class Wallpaper extends Component {
  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    return (
      <SafeAreaView onLayout={this.props.onLayout} style={styles.picture}>
        {this.props.children}
      </SafeAreaView>
    );
  }
}

Wallpaper.propTypes = {
  children: propTypes.any.isRequired,
  onLayout: propTypes.func.isRequired,
};

export default Wallpaper;
