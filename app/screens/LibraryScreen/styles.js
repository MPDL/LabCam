import { StatusBar, StyleSheet } from 'react-native';
import CamFonts from '../../common/CamFonts';
import CamColors from '../../common/CamColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
  },
  card: {
    flexDirection: 'column',
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  topContainer: {
    backgroundColor: '#CED0CE',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    flexWrap: 'nowrap',
  },
  pathContainer: {
    flex: 5,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  destiny: {
    marginHorizontal: 8,
  },
  libraryGrid: {
    height: CamFonts.normalize(64),
  },
  cancelBtn: {
    flex: 1,
    borderColor: 'white',
  },
  cancelText: {
    color: CamColors.green2,
    textAlign: 'center',
    marginVertical: 10,
  },
  confirmBtn: {
    flex: 1,
  },
  confirmText: {
    color: CamColors.green2,
    textAlign: 'center',
    marginVertical: 10,
  },
  dirList: {
    paddingBottom: 64,
  },
});

export default styles;
