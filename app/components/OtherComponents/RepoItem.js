import React, { Component } from 'react';
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native';
import PropTypes from 'prop-types';

export default class RepoItem extends Component {
  onItemPress = () => {
    const { id } = this.props.repo;
    return this.props.selectRepo ? this.props.selectRepo(id) : {};
  };
  render() {
    const { description, name, stargazers_count } = this.props.repo;
    const itemStyle = (this.props.isSelected && [styles.item, styles.selected]) || styles.item;
    return (
      <TouchableHighlight onPress={this.onItemPress()}>
        <View style={itemStyle}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.stars}>{`${stargazers_count} stars`}</Text>
          {this.props.isSelected ? <Text>{description}</Text> : null}
        </View>
      </TouchableHighlight>
    );
  }
}

RepoItem.propTypes = {
  repo: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  selectRepo: PropTypes.func,
};

const styles = StyleSheet.create({
  root: {},
  item: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: 'normal',
    paddingBottom: 4,
  },
  stars: {
    paddingBottom: 8,
  },
  selected: {
    backgroundColor: '#B2DFDB',
  },
});
