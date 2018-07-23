import React from 'react';
import { Modal, Animated, View, StyleSheet } from 'react-native';
import CamColors from '../common/CamColors';
import { Heading3, Paragraph } from '../common/CamText';

const INTRO_DELAY_DUR = 300;
const SHOW_DELAY_DUR = 800;
const OUTRO_ANIM_DUR = 150;
const TRANSLATE_Y_DISTANCE = 60;

class CamToast extends React.Component {
  static defaultProps = {
    backgroundColor: CamColors.colorWithAlpha('tangaroa', 0.95),
    titleColor: CamColors.white,
    textColor: CamColors.white,
    onComplete: (_) => {},
  };

  constructor() {
    super();

    this.state = {
      contentAnimation: new Animated.Value(0),
    };

    this.animatedContentStyles = {
      opacity: this.state.contentAnimation,
      transform: [
        {
          translateY: this.state.contentAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [TRANSLATE_Y_DISTANCE, 0],
          }),
        },
      ],
    };

    this.intro();
  }

  intro = (_) => {
    Animated.spring(this.state.contentAnimation, {
      delay: INTRO_DELAY_DUR,
      toValue: 1,
    }).start(this.outro);
  };

  outro = (_) => {
    Animated.timing(this.state.contentAnimation, {
      delay: SHOW_DELAY_DUR,
      toValue: 0,
      duration: OUTRO_ANIM_DUR,
    }).start(this.props.onComplete);
  };

  render() {
    const {
      title, text, backgroundColor, titleColor, textColor,
    } = this.props;
    if (!title && !text) {
      return null;
    }

    return (
      <Modal transparent animationType="fade" visible>
        <View style={styles.container}>
          <Animated.View style={[styles.content, { backgroundColor }, this.animatedContentStyles]}>
            {title ? (
              <Heading3 style={[styles.title, { color: titleColor }]}>{title}</Heading3>
            ) : null}
            {text ? (
              <Paragraph style={[styles.text, { color: textColor }]}>{text}</Paragraph>
            ) : null}
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 4,
  },
  title: {
    marginBottom: 4,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

module.exports = CamToast;
module.exports.__cards__ = (define) => {
  define('Default', _ => <CamToast text="Thanks for your review!" />);
};
