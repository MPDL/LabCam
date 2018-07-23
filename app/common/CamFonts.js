import { Platform, Dimensions } from 'react-native';

const DEVICE_SCALE = Dimensions.get('window').width / 375;

const DEFAULT_FONT = 'helvetica';
const SECONDARY_FONT = Platform.OS === 'android' ? 'basis' : 'helvetica';

const fontWithWeight = (family = DEFAULT_FONT, weight = 'regular') => family;
const normalize = size => Math.round(DEVICE_SCALE * size);

const lineHeight = (val = 1, scale = 1, normalized = true) => {
  const adjusted = normalized ? normalize(val) : val;
  return Math.round(Platform.OS === 'android' ? adjusted * scale : adjusted);
};

export default {
  default: DEFAULT_FONT,
  helvetica: DEFAULT_FONT,
  basis: SECONDARY_FONT,
  h1: DEFAULT_FONT,
  h2: DEFAULT_FONT,
  h3: DEFAULT_FONT,
  h4: DEFAULT_FONT,
  p: DEFAULT_FONT,
  button: DEFAULT_FONT,

  fontWithWeight,
  lineHeight,
  normalize,
};
