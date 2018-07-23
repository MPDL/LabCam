import React from 'react';
import ReactNative from 'react-native';
import CamColors from '../common/CamColors';
import CamFonts from '../common/CamFonts';
import StyleSheet from '../common/CamStyleSheet';

export function Heading1({ style, ...props }) {
  return <ReactNative.Text style={[styles.h1, style]} {...props} />;
}

export function Heading2({ style, ...props }) {
  return <ReactNative.Text style={[styles.h2, style]} {...props} />;
}

export function Heading3({ style, ...props }) {
  return <ReactNative.Text style={[styles.h3, style]} {...props} />;
}

export function Heading4({ style, ...props }) {
  return <ReactNative.Text style={[styles.h4, style]} {...props} />;
}

export function Heading5({ style, ...props }) {
  return <ReactNative.Text style={[styles.h5, style]} {...props} />;
}

export function Paragraph({ style, ...props }) {
  return <ReactNative.Text style={[styles.p, style]} {...props} />;
}

// export function Hyperlink({style, ...props}) {
//   return <ReactNative.Text style={[styles.a, style]} {...props} />;
// }

export function HeaderTitle({ style, ...props }) {
  return <ReactNative.Text style={[styles.headerTitle, style]} {...props} />;
}

export function HorizontalRule({ style, ...props }) {
  return <ReactNative.View style={[styles.hr, style]} {...props} />;
}

export function SmallText({ style, ...props }) {
  return <ReactNative.Text style={[styles.small, style]} {...props} />;
}

// Styles
// =============================================================================

const styles = StyleSheet.create({
  text: {
    fontFamily: CamFonts.default,
  },
  h1: {
    fontFamily: CamFonts.h1,
    fontSize: CamFonts.normalize(30),
    lineHeight: CamFonts.lineHeight(37),
    color: CamColors.blue,
  },
  h2: {
    fontFamily: CamFonts.h2,
    fontSize: CamFonts.normalize(23),
    lineHeight: CamFonts.lineHeight(27), // , 1.4
    color: CamColors.tangaroa,
    letterSpacing: -0.24,
  },
  h3: {
    fontFamily: CamFonts.h3,
    fontSize: CamFonts.normalize(17),
    lineHeight: CamFonts.lineHeight(20),
    color: CamColors.sapphire,
    letterSpacing: -0.11,
  },
  h4: {
    fontFamily: CamFonts.h4,
    fontSize: CamFonts.normalize(13),
    lineHeight: CamFonts.lineHeight(22),
    color: CamColors.tangaroa,
  },
  h5: {
    fontFamily: CamFonts.helvetica,
    fontSize: CamFonts.normalize(13),
    lineHeight: CamFonts.lineHeight(22),
    color: CamColors.tangaroa,
  },
  p: {
    fontFamily: CamFonts.p,
    fontSize: CamFonts.normalize(17),
    lineHeight: CamFonts.lineHeight(25), // , 1.25
    color: CamColors.tangaroa,
  },
  hr: {
    height: 1,
    backgroundColor: CamColors.colorWithAlpha('black', 0.1),
  },
  headerTitle: {
    fontFamily: CamFonts.fontWithWeight('helvetica', 'semibold'),
    ios: { fontSize: 17 },
    android: { fontSize: 20 },
  },
  small: {
    fontFamily: CamFonts.helvetica,
    fontSize: CamFonts.normalize(10),
    lineHeight: CamFonts.lineHeight(18),
    color: CamColors.tangaroa,
  },
});
