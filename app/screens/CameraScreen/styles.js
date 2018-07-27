import { StatusBar, StyleSheet } from 'react-native';
import CamColors from '../../common/CamColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: StatusBar.currentHeight,
  },
  navigation: {
    flex: 1,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuBar: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    height: 40,
  },
  keeperIcon: {
    marginLeft: 10,
    width: 24,
    height: 24,
  },
  cameraOption: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  flipIcon: {
    marginHorizontal: 16,
  },
  cameraIcon: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 30,
    zIndex: 99,
  },
  row: {
    flexDirection: 'row',
  },
  photoHelper: {
    color: 'red',
    fontSize: 15,
    marginHorizontal: 8,
  },
});

export default styles;
