import React, { Component } from 'react';
import { Dimensions, TouchableOpacity, Text, TextInput, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import CamColors from '../../common/CamColors';

class Server extends Component {
  constructor(props) {
    super();
    this.props = props;

    this.state = {
      // server: 'https://keeper.mpdl.mpg.de',
      category: 'keeper',
    };
  }

  selectServer = category => () => {
    this.setState({
      category,
    });
  }

  render() {
    const { width, height } = Dimensions.get('window');
    const rootStyle =
      width > height
        ? [styles.root, { marginLeft: 24 + (width - height) / 2 }]
        : [styles.root, { marginLeft: 36 }];

    let serverUrl = 'https://keeper.mpdl.mpg.de';
    switch (this.state.category) {
      case 'keeper':
        serverUrl = 'https://keeper.mpdl.mpg.de';
        break;
      case 'seaCloud':
        serverUrl = 'https://seacloud.cc';
        break;
      case 'Others':
        serverUrl = '';
        break;
      default:
        serverUrl = 'https://keeper.mpdl.mpg.de';
        break;
    }


    return (
      <View style={rootStyle}>
        <View style={styles.serverTab}>
          <TouchableOpacity style={this.state.category === 'keeper' ? styles.categorySelected : styles.categoryUnselected} onPress={this.selectServer('keeper')}>
            <Text style={this.state.category === 'keeper' ? styles.categorySelectedText : styles.categoryUnselectedText}>KEEPER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={this.state.category === 'seaCloud' ? styles.categorySelected : styles.categoryUnselected} onPress={this.selectServer('seaCloud')}>
            <Text style={this.state.category === 'seaCloud' ? styles.categorySelectedText : styles.categoryUnselectedText}>SeaCloud.cc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={this.state.category === 'Others' ? styles.categorySelected : styles.categoryUnselected} onPress={this.selectServer('Others')}>
            <Text style={this.state.category === 'Others' ? styles.categorySelectedText : styles.categoryUnselectedText}>Others</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.serverText} placeholder="https://">{serverUrl}</TextInput>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
    marginLeft: 24,
    alignSelf: 'flex-start',
  },
  serverTab: {
    flexDirection: 'row',
  },
  serverText: {
    color: 'white',
    marginVertical: 10,
  },
  categorySelected: {
    color: 'white',
    backgroundColor: CamColors.colorWithAlpha('green3', 1),
    padding: 6,
    borderRadius: 6,
  },
  categoryUnselected: {
    padding: 6,
    color: 'grey',
  },
  categorySelectedText: {
    color: 'white',
  },
  categoryUnselectedText: {
    color: 'grey',
  },

  keeper: {
    height: 23,
    width: 85,
    marginLeft: 24,
  },
});

const mapStateToProps = state => ({
  server: state.accounts.server,
});

const mapDispatchToProps = dispatch => ({
  setLoginState: state => dispatch(AccountsActions.setLoginState(state)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Server);
