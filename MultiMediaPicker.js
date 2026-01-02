import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PreviewModal from './PreviewModal';
import MediaEditor from './src/components/MediaEditor/MediaEditor';
import VideoTrimmer from './src/components/VideoTrimmer/VideoTrimmer';

const MAX_MEDIA_COUNT = 10;
const MAX_VIDEO_DURATION = 15; // seconds
const TARGET_WIDTH = 1080;
const TARGET_QUALITY = 80;

/**
 * MultiMediaPicker - Instagram-like media picker with multi-selection, preview, reorder, and delete
 * Features:
 * - Select up to 10 images/videos from gallery or camera
 * - Horizontal scrollable preview carousel
 * - Drag-to-reorder with smooth animations
 * - Tap-to-view full-screen preview
 * - Individual delete buttons
 */
const MultiMediaPicker = ({ onMediaChange, initialMedia = [] }) => {
  const [media, setMedia] = useState(initialMedia);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'image' or 'video'

  // Notify parent component of media changes
  React.useEffect(() => {
    if (onMediaChange) {
      onMediaChange(media);
    }
  }, [media, onMediaChange]);

  /**
   * Request camera/gallery permissions
   */
  const requestPermissions = useCallback(async (isCamera = false) => {
    try {
      const permission = isCamera
        ? Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA
        : Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        return true;
      }

      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }, []);

  /**
   * Compress and resize image
   */
  const compressImage = useCallback(async (uri) => {
    try {
      // API for @bam.tech/react-native-image-resizer v3.0.11:
      // createResizedImage(uri, width, height, format, quality, rotation, outputPath, keepMeta, options)
      const response = await ImageResizer.createResizedImage(
        uri,
        TARGET_WIDTH,
        TARGET_WIDTH * 2, // Max height (will maintain aspect ratio)
        'JPEG',
        TARGET_QUALITY,
        0, // rotation
        undefined, // outputPath (undefined = auto-generate)
        false, // keepMeta
        {
          mode: 'contain',
          onlyScaleDown: true,
        }
      );
      return response.uri;
    } catch (error) {
      console.error('Image compression error:', error);
      return uri; // Return original if compression fails
    }
  }, []);

  /**
   * Process selected media items
   */
  const processMediaItems = useCallback(
    async (assets) => {
      setCompressing(true);
      const processedMedia = [];

      for (const asset of assets) {
        try {
          let processedUri = asset.uri;
          let type = asset.type?.startsWith('video') ? 'video' : 'image';

          // Compress images only
          if (type === 'image') {
            processedUri = await compressImage(asset.uri);
          }

          // Check video duration
          if (type === 'video' && asset.duration) {
            if (asset.duration > MAX_VIDEO_DURATION) {
              Alert.alert(
                'Video too long',
                `Videos must be shorter than ${MAX_VIDEO_DURATION} seconds.`
              );
              continue;
            }
          }

          processedMedia.push({
            uri: processedUri,
            type,
            originalUri: asset.uri,
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            fileSize: asset.fileSize,
            id: Date.now() + Math.random(), // Unique ID for reordering
          });
        } catch (error) {
          console.error('Error processing media:', error);
        }
      }

      setCompressing(false);
      return processedMedia;
    },
    [compressImage]
  );

  /**
   * Handle media selection from gallery
   */
  const handleSelectFromGallery = useCallback(async () => {
    if (media.length >= MAX_MEDIA_COUNT) {
      Alert.alert(
        'Limit reached',
        `You can select up to ${MAX_MEDIA_COUNT} media items.`
      );
      return;
    }

    const hasPermission = await requestPermissions(false);
    if (!hasPermission) {
      Alert.alert(
        'Permission denied',
        'Please grant photo library access to select media.'
      );
      return;
    }

    const remainingSlots = MAX_MEDIA_COUNT - media.length;

    launchImageLibrary(
      {
        mediaType: 'mixed',
        selectionLimit: remainingSlots,
        quality: 1,
        videoQuality: 'high',
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const processed = await processMediaItems(response.assets);
          setMedia((prev) => [...prev, ...processed]);
        }
      }
    );
  }, [media.length, requestPermissions, processMediaItems]);

  /**
   * Handle media capture from camera
   */
  const handleTakePhoto = useCallback(async () => {
    if (media.length >= MAX_MEDIA_COUNT) {
      Alert.alert(
        'Limit reached',
        `You can select up to ${MAX_MEDIA_COUNT} media items.`
      );
      return;
    }

    const hasPermission = await requestPermissions(true);
    if (!hasPermission) {
      Alert.alert(
        'Permission denied',
        'Please grant camera access to take photos/videos.'
      );
      return;
    }

    launchCamera(
      {
        mediaType: 'mixed',
        quality: 1,
        videoQuality: 'high',
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const processed = await processMediaItems(response.assets);
          setMedia((prev) => [...prev, ...processed]);
        }
      }
    );
  }, [media.length, requestPermissions, processMediaItems]);

  /**
   * Show action sheet for media selection
   */
  const showMediaPicker = useCallback(() => {
    Alert.alert(
      'Select Media',
      'Choose an option',
      [
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Gallery', onPress: handleSelectFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [handleTakePhoto, handleSelectFromGallery]);

  /**
   * Delete media item
   */
  const handleDelete = useCallback((index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Open preview modal
   */
  const handlePreview = useCallback((index) => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  }, []);

  /**
   * Handle edit media
   */
  const handleEdit = useCallback((index) => {
    const item = media[index];
    setEditingMedia({ ...item, index });
    setEditingType(item.type);
  }, [media]);

  /**
   * Save edited media
   */
  const handleSaveEdit = useCallback((editedItem) => {
    if (editedItem && editedItem.index !== undefined) {
      setMedia((prev) => {
        const updated = [...prev];
        updated[editedItem.index] = {
          ...updated[editedItem.index],
          ...editedItem,
        };
        return updated;
      });
    }
    setEditingMedia(null);
    setEditingType(null);
  }, []);

  /**
   * Cancel editing
   */
  const handleCancelEdit = useCallback(() => {
    setEditingMedia(null);
    setEditingType(null);
  }, []);

  /**
   * Reorder media items (drag and drop)
   */
  const handleReorder = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setMedia((prev) => {
      const newMedia = [...prev];
      const [removed] = newMedia.splice(fromIndex, 1);
      newMedia.splice(toIndex, 0, removed);
      return newMedia;
    });
  }, []);

  // Memoized thumbnail component with drag-to-reorder
  const ThumbnailItem = useCallback(
    ({ item, index }) => {
      const translateX = useSharedValue(0);
      const translateY = useSharedValue(0);
      const scale = useSharedValue(1);
      const opacity = useSharedValue(1);

      const panGesture = useCallback(
        (event) => {
          translateX.value = event.translationX;
          translateY.value = event.translationY;
          scale.value = withSpring(1.1);
          opacity.value = 0.8;

          // Calculate target index based on position
          const itemWidth = 80;
          const scrollOffset = event.absoluteX - itemWidth * index;
          const targetIndex = Math.round(scrollOffset / itemWidth);
          const clampedIndex = Math.max(
            0,
            Math.min(targetIndex, media.length - 1)
          );

          if (clampedIndex !== index && clampedIndex !== draggedIndex) {
            runOnJS(setDraggedIndex)(clampedIndex);
          }
        },
        [index, media.length, draggedIndex, translateX, translateY, scale, opacity, setDraggedIndex]
      );

      const panGestureEnd = useCallback(() => {
        const targetIndex = draggedIndex !== null ? draggedIndex : index;
        if (targetIndex !== index) {
          runOnJS(handleReorder)(index, targetIndex);
        }
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
        runOnJS(setDraggedIndex)(null);
      }, [index, draggedIndex, handleReorder, translateX, translateY, scale, opacity, setDraggedIndex]);

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ],
        opacity: opacity.value,
      }));

      return (
        <PanGestureHandler
          onGestureEvent={panGesture}
          onEnded={panGestureEnd}
          minPointers={1}
          maxPointers={1}>
          <Animated.View style={[styles.thumbnailContainer, animatedStyle]}>
            <TapGestureHandler
              onActivated={() => handlePreview(index)}
              numberOfTaps={1}>
              <Animated.View>
                {item.type === 'video' ? (
                  <View style={styles.videoThumbnail}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                    <View style={styles.videoBadge}>
                      <Text style={styles.videoBadgeText}>▶</Text>
                    </View>
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                )}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(index)}
                  accessibilityLabel={`Edit ${item.type} ${index + 1}`}
                  accessibilityRole="button">
                  <Text style={styles.editButtonText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(index)}
                  accessibilityLabel={`Delete ${item.type} ${index + 1}`}
                  accessibilityRole="button">
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      );
    },
    [handlePreview, handleDelete, handleReorder, draggedIndex, media.length]
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.pickerContainer}>
        {/* Add Media Button */}
        {media.length < MAX_MEDIA_COUNT && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showMediaPicker}
            accessibilityLabel="Add media"
            accessibilityRole="button"
            accessibilityHint={`Add up to ${MAX_MEDIA_COUNT - media.length} more media items`}>
            <Text style={styles.addButtonText}>+ Add Media</Text>
          </TouchableOpacity>
        )}

        {/* Compression Indicator */}
        {compressing && (
          <View style={styles.compressingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.compressingText}>Processing...</Text>
          </View>
        )}

        {/* Preview Carousel */}
        {media.length > 0 && (
          <View style={styles.previewContainer}>
            <Text
              style={styles.mediaCount}
              accessibilityLabel={`${media.length} media items selected`}>
              {media.length} / {MAX_MEDIA_COUNT}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
              accessibilityLabel="Media preview carousel">
              {media.map((item, index) => (
                <ThumbnailItem key={item.id || index} item={item} index={index} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Preview Modal */}
        <PreviewModal
          visible={previewVisible}
          media={media}
          currentIndex={previewIndex}
          onClose={() => setPreviewVisible(false)}
          onDelete={(index) => {
            handleDelete(index);
            if (media.length === 1) {
              setPreviewVisible(false);
            }
          }}
        />

        {/* Media Editor Modal */}
        {editingMedia && editingType === 'image' && (
          <MediaEditor
            media={editingMedia}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Video Trimmer Modal */}
        {editingMedia && editingType === 'video' && (
          <VideoTrimmer
            video={editingMedia}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickerContainer: {
    paddingVertical: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  compressingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  compressingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  previewContainer: {
    marginTop: 10,
  },
  mediaCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  carousel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  thumbnailContainer: {
    marginHorizontal: 5,
    position: 'relative',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  videoThumbnail: {
    position: 'relative',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 2,
  },
  editButton: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MultiMediaPicker;

