import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 64; // Account for padding
const THUMB_SIZE = 20;
const TRACK_HEIGHT = 4;

/**
 * CustomSlider - Pure JavaScript slider component
 * No native dependencies, works with React Native 0.83.1
 */
const CustomSlider = ({
  value,
  minimumValue = 0,
  maximumValue = 100,
  onValueChange,
  onSlidingComplete,
  minimumTrackTintColor = '#0095f6',
  maximumTrackTintColor = '#666',
  style,
  disabled = false,
  ...props
}) => {
  const translateX = useSharedValue(
    ((value - minimumValue) / (maximumValue - minimumValue)) * SLIDER_WIDTH
  );

  useEffect(() => {
    translateX.value = withSpring(
      ((value - minimumValue) / (maximumValue - minimumValue)) * SLIDER_WIDTH,
      { damping: 15, stiffness: 150 }
    );
  }, [value, minimumValue, maximumValue, translateX]);

  const handleGesture = (event) => {
    'worklet';
    const { translationX } = event;
    const startX = ((value - minimumValue) / (maximumValue - minimumValue)) * SLIDER_WIDTH;
    const newX = Math.max(0, Math.min(SLIDER_WIDTH, startX + translationX));
    translateX.value = newX;

    const newValue = minimumValue + (newX / SLIDER_WIDTH) * (maximumValue - minimumValue);
    if (onValueChange) {
      runOnJS(onValueChange)(newValue);
    }
  };

  const handleGestureEnd = () => {
    'worklet';
    const currentX = translateX.value;
    const newValue = minimumValue + (currentX / SLIDER_WIDTH) * (maximumValue - minimumValue);
    if (onSlidingComplete) {
      runOnJS(onSlidingComplete)(newValue);
    }
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackFillStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <GestureHandlerRootView style={[styles.container, style]}>
      <View style={styles.trackContainer}>
        <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
          <Animated.View
            style={[
              styles.trackFill,
              { backgroundColor: minimumTrackTintColor },
              trackFillStyle,
            ]}
          />
        </View>
        <PanGestureHandler
          onGestureEvent={handleGesture}
          onEnded={handleGestureEnd}
          enabled={!disabled}>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  trackContainer: {
    width: SLIDER_WIDTH,
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    width: '100%',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0095f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -THUMB_SIZE / 2,
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0095f6',
  },
});

export default CustomSlider;
