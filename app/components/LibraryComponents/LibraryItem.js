import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import { SmallText } from '../../common/CamText';

export default class LibraryItem extends Component {
  isOnPath = (item, currentPaths) => {
    if (item.path && currentPaths) {
      const pathNames = currentPaths.map(path => path.name);
      return pathNames.includes(item.name) && item.path.every(val => pathNames.includes(val.name));
    }
    return false;
  };

  render() {
    const {
      item, onLibPress, onDirPress, currentPaths, libId,
    } = this.props;
    const itemName = item
      ? item.name.length > 20
        ? `${item.name.substring(0, 18)}..`
        : item.name
      : '';
    const repoInlineView = (
      <View>
        <TouchableOpacity style={styles.Container} onPress={onLibPress}>
          {libId === item.id ? (
            <EntypoIcon name="archive" size={30} />
          ) : (
            <Icon name="archive" size={30} />
          )}
          <SmallText style={styles.libraryText}>{itemName}</SmallText>
        </TouchableOpacity>
      </View>
    );

    const dirInlineView = (
      <View>
        <TouchableOpacity
          style={[styles.Container, { marginLeft: item.path ? (item.path.length + 1) * 16 : 0 }]}
          onPress={onDirPress}
        >
          <Icon name={this.isOnPath(item, currentPaths) ? 'folder-open' : 'folder'} size={24} />
          <SmallText style={styles.dirText}>{itemName}</SmallText>
        </TouchableOpacity>
      </View>
    );
    return item.type === 'dir' ? dirInlineView : repoInlineView;
  }
}

LibraryItem.propTypes = {
  item: PropTypes.object.isRequired,
  onLibPress: PropTypes.func.isRequired,
  onDirPress: PropTypes.func.isRequired,
  libId: PropTypes.string.isRequired,
  currentPaths: PropTypes.array.isRequired,
};

const styles = StyleSheet.create({
  Container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  libraryText: {
    marginHorizontal: 8,
    textAlign: 'center',
  },
  dirText: {
    marginHorizontal: 8,
    textAlign: 'center',
  },
});
