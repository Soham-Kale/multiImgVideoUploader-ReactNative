import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  PinchGestureHandler,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import CustomSlider from '../CustomSlider/CustomSlider';
import useMediaEditor from '../../hooks/useMediaEditor';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ASPECT_RATIOS = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:5', value: '4:5' },
  { label: '16:9', value: '16:9' },
];

/**
 * MediaEditor - Instagram-like image editor
 * Features: Crop ratios, pinch zoom, rotate, filters
 */
const MediaEditor = ({ media, onSave, onCancel }) => {
  const {
    media: editedMedia,
    aspectRatio,
    rotation,
    filters,
    isProcessing,
    setAspectRatio,
    rotateImage,
    applyFilters,
    resetEdits,
    saveEdits,
  } = useMediaEditor(media);

  const [showFilters, setShowFilters] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleSave = () => {
    const savedMedia = saveEdits();
    if (onSave) {
      onSave(savedMedia);
    }
  };

  const handleRotate = () => {
    rotateImage(90);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation}deg` },
    ],
  }));

  if (!editedMedia || editedMedia.type !== 'image') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Only images can be edited</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, styles.saveButton]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        <View style={styles.previewContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <PinchGestureHandler
              onGestureEvent={(event) => {
                scale.value = withSpring(event.nativeEvent.scale);
              }}>
              <Animated.View style={styles.imageContainer}>
                <Animated.Image
                  source={{ uri: editedMedia.uri }}
                  style={[styles.previewImage, animatedStyle]}
                  resizeMode="contain"
                />
              </Animated.View>
            </PinchGestureHandler>
          )}
        </View>

        {/* Controls */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.controlsContainer}
          contentContainerStyle={styles.controlsContent}>
          {/* Aspect Ratio Selector */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Aspect Ratio</Text>
            <View style={styles.ratioButtons}>
              {ASPECT_RATIOS.map((ratio) => (
                <TouchableOpacity
                  key={ratio.value}
                  style={[
                    styles.ratioButton,
                    aspectRatio === ratio.value && styles.ratioButtonActive,
                  ]}
                  onPress={() => setAspectRatio(ratio.value)}>
                  <Text
                    style={[
                      styles.ratioButtonText,
                      aspectRatio === ratio.value &&
                        styles.ratioButtonTextActive,
                    ]}>
                    {ratio.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rotate Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRotate}>
            <Text style={styles.controlIcon}>🔄</Text>
            <Text style={styles.controlLabel}>Rotate</Text>
          </TouchableOpacity>

          {/* Filters Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFilters(!showFilters)}>
            <Text style={styles.controlIcon}>🎨</Text>
            <Text style={styles.controlLabel}>Filters</Text>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity style={styles.controlButton} onPress={resetEdits}>
            <Text style={styles.controlIcon}>↺</Text>
            <Text style={styles.controlLabel}>Reset</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Filter Controls */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterControl}>
              <Text style={styles.filterLabel}>
                Brightness: {filters.brightness}%
              </Text>
              <CustomSlider
                style={styles.slider}
                minimumValue={0}
                maximumValue={200}
                value={filters.brightness}
                onValueChange={(value) =>
                  applyFilters({ brightness: Math.round(value) })
                }
                minimumTrackTintColor="#0095f6"
                maximumTrackTintColor="#666"
              />
            </View>

            <View style={styles.filterControl}>
              <Text style={styles.filterLabel}>
                Contrast: {filters.contrast}%
              </Text>
              <CustomSlider
                style={styles.slider}
                minimumValue={0}
                maximumValue={200}
                value={filters.contrast}
                onValueChange={(value) =>
                  applyFilters({ contrast: Math.round(value) })
                }
                minimumTrackTintColor="#0095f6"
                maximumTrackTintColor="#666"
              />
            </View>

            <View style={styles.filterControl}>
              <Text style={styles.filterLabel}>
                Saturation: {filters.saturation}%
              </Text>
              <CustomSlider
                style={styles.slider}
                minimumValue={0}
                maximumValue={200}
                value={filters.saturation}
                onValueChange={(value) =>
                  applyFilters({ saturation: Math.round(value) })
                }
                minimumTrackTintColor="#0095f6"
                maximumTrackTintColor="#666"
              />
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#262626',
  },
  headerButton: {
    paddingVertical: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    color: '#0095f6',
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
  },
  processingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  controlsContainer: {
    maxHeight: 120,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#262626',
  },
  controlsContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  controlSection: {
    marginRight: 24,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  ratioButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#333',
  },
  ratioButtonActive: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  ratioButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ratioButtonTextActive: {
    color: '#fff',
  },
  controlButton: {
    alignItems: 'center',
    marginRight: 24,
  },
  controlIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  filtersContainer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#262626',
  },
  filterControl: {
    marginBottom: 16,
  },
  filterLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default MediaEditor;

