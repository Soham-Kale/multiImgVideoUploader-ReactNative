import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { Video } from 'react-native-video';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * PreviewModal - Full-screen preview modal for viewing selected media
 * Supports images with zoom/pinch gestures and video playback
 */

const PreviewModal = ({ visible, media, currentIndex, onClose, onDelete }) => {
  const [imageIndex, setImageIndex] = React.useState(currentIndex || 0);

  React.useEffect(() => {
    if (currentIndex !== undefined) {
      setImageIndex(currentIndex);
    }
  }, [currentIndex]);

  // Filter only images for ImageViewing (videos handled separately)
  // This must be computed BEFORE useMemo to ensure hooks order consistency
  const images = React.useMemo(() => {
    if (!media || media.length === 0) return [];
    return media
      .map((item, idx) => ({
        uri: item.type === 'image' ? item.uri : null,
        id: idx,
      }))
      .filter((item) => item.uri !== null);
  }, [media]);

  // Check if current item is video (safe even if media is empty)
  const currentMedia = media && media.length > 0 ? media[imageIndex] : null;
  const isVideo = currentMedia?.type === 'video';

  // Find the image index for ImageViewing (only counting images)
  // This hook MUST be called BEFORE any early returns to maintain hooks order
  const imageViewingIndex = React.useMemo(() => {
    if (!media || media.length === 0 || isVideo || images.length === 0) return 0;
    let imageCount = 0;
    for (let i = 0; i < imageIndex; i++) {
      if (media[i]?.type === 'image') {
        imageCount++;
      }
    }
    return Math.max(0, Math.min(imageCount, images.length - 1));
  }, [imageIndex, media, isVideo, images.length]);

  // Early return AFTER all hooks have been called
  if (!media || media.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityLabel="Media preview modal"
      accessibilityRole="dialog">
      <View style={styles.container}>
        {isVideo ? (
          // Video preview
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: currentMedia.uri }}
              style={styles.video}
              controls={true}
              resizeMode="contain"
              paused={false}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close preview"
              accessibilityRole="button">
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  onDelete(imageIndex);
                  if (imageIndex >= media.length - 1 && imageIndex > 0) {
                    setImageIndex(imageIndex - 1);
                  } else if (media.length === 1) {
                    onClose();
                  }
                }}
                accessibilityLabel="Delete media"
                accessibilityRole="button">
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Image preview with zoom/pinch
          <ImageViewing
            images={images.map((img) => ({ uri: img.uri }))}
            imageIndex={imageViewingIndex >= 0 ? imageViewingIndex : 0}
            visible={visible && !isVideo}
            onRequestClose={onClose}
            HeaderComponent={({ imageIndex: idx }) => (
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityLabel="Close preview"
                  accessibilityRole="button">
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                {onDelete && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      const actualIndex = images[idx]?.id;
                      if (actualIndex !== undefined) {
                        onDelete(actualIndex);
                        if (actualIndex >= media.length - 1 && actualIndex > 0) {
                          setImageIndex(actualIndex - 1);
                        } else if (media.length === 1) {
                          onClose();
                        }
                      }
                    }}
                    accessibilityLabel="Delete image"
                    accessibilityRole="button">
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            FooterComponent={({ imageIndex: idx }) => (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {idx + 1} / {images.length}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PreviewModal;

