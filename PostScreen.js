import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import MultiMediaPicker from './MultiMediaPicker';

const API_ENDPOINT = '/api/posts';

/**
 * PostScreen - Instagram-like post creation screen
 * Features:
 * - Multi-media selection and preview
 * - Caption, location, and tags input
 * - Parallel upload with progress tracking
 * - Error handling with retry
 */
const PostScreen = ({ navigation, onPostCreated }) => {
  const insets = useSafeAreaInsets();
  const [media, setMedia] = useState([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [failedUploads, setFailedUploads] = useState([]);

  /**
   * Handle media changes from MultiMediaPicker
   */
  const handleMediaChange = useCallback((newMedia) => {
    setMedia(newMedia);
  }, []);

  /**
   * Upload single media item
   */
  const uploadMediaItem = useCallback(
    async (item, index, total) => {
      try {
        const formData = new FormData();

        // Determine file type and name
        const fileExtension = item.type === 'video' ? 'mp4' : 'jpg';
        const fileName = `media_${index}.${fileExtension}`;
        const fileType = item.type === 'video' ? 'video/mp4' : 'image/jpeg';

        formData.append('media', {
          uri: item.uri,
          type: fileType,
          name: fileName,
        });
        formData.append('index', index.toString());
        formData.append('type', item.type);

        // Mock upload - replace with actual API endpoint
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Upload successful for item ${index}:`, result);

        // Update progress
        const progress = ((index + 1) / total) * 100;
        setUploadProgress(progress);

        return { success: true, index, result };
      } catch (error) {
        console.error(`Upload error for item ${index}:`, error);
        return { success: false, index, error: error.message };
      }
    },
    []
  );

  /**
   * Retry failed uploads
   */
  const retryFailedUploads = useCallback(async () => {
    if (failedUploads.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const retryResults = [];

    // Upload failed items in parallel
    const uploadPromises = failedUploads.map((failedItem) =>
      uploadMediaItem(failedItem.item, failedItem.index, media.length)
    );

    const results = await Promise.allSettled(uploadPromises);

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value.success) {
        retryResults.push(result.value);
      } else {
        const failedItem = failedUploads[idx];
        retryResults.push({
          success: false,
          index: failedItem.index,
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    const stillFailed = retryResults.filter((r) => !r.success);
    setFailedUploads(stillFailed);

    if (stillFailed.length === 0) {
      Toast.show({
        type: 'success',
        text1: 'Upload complete',
        text2: 'All media uploaded successfully',
      });
      setUploading(false);
      if (onPostCreated) {
        onPostCreated();
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Some uploads failed',
        text2: `${stillFailed.length} items failed to upload`,
      });
      setUploading(false);
    }
  }, [failedUploads, media.length, uploadMediaItem, onPostCreated]);

  /**
   * Handle share/post action
   */
  const handleShare = useCallback(async () => {
    if (media.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No media selected',
        text2: 'Please select at least one image or video',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setFailedUploads([]);

    try {
      // Upload all media in parallel
      console.log(`Starting upload of ${media.length} media items...`);

      const uploadPromises = media.map((item, index) =>
        uploadMediaItem(item, index, media.length)
      );

      const results = await Promise.allSettled(uploadPromises);

      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successful.push(result.value);
        } else {
          failed.push({
            item: media[index],
            index,
            error:
              result.reason?.message ||
              result.value?.error ||
              'Unknown error',
          });
        }
      });

      console.log(`Upload complete: ${successful.length} successful, ${failed.length} failed`);

      // If all successful, create post with metadata
      if (failed.length === 0) {
        // Create post with caption, location, tags
        const postData = {
          media: successful.map((s) => s.result),
          caption,
          location: location || null,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0),
        };

        // Mock API call to create post
        // const postResponse = await fetch(API_ENDPOINT, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(postData),
        // });

        Toast.show({
          type: 'success',
          text1: 'Post created',
          text2: 'Your post has been shared successfully',
        });

        setUploading(false);
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        // Some uploads failed - offer retry
        setFailedUploads(failed);
        setUploading(false);

        Alert.alert(
          'Upload incomplete',
          `${failed.length} of ${media.length} items failed to upload. Would you like to retry?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: retryFailedUploads },
          ]
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: error.message || 'An error occurred while uploading',
      });
      setUploading(false);
    }
  }, [
    media,
    caption,
    location,
    tags,
    uploadMediaItem,
    retryFailedUploads,
    onPostCreated,
  ]);

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    if (media.length > 0 || caption.length > 0) {
      Alert.alert(
        'Discard post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setMedia([]);
              setCaption('');
              setLocation('');
              setTags('');
              if (navigation) {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } else if (navigation) {
      navigation.goBack();
    }
  }, [media.length, caption.length, navigation]);

  const canShare = media.length > 0 && !uploading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel"
            accessibilityRole="button">
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.title} accessibilityRole="header">
            New Post
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            disabled={!canShare}
            style={[
              styles.shareButton,
              !canShare && styles.shareButtonDisabled,
            ]}
            accessibilityLabel={
              uploading ? 'Uploading' : canShare ? 'Share post' : 'Share disabled'
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: !canShare }}>
            {uploading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text
                style={[
                  styles.shareButtonText,
                  !canShare && styles.shareButtonTextDisabled,
                ]}>
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(uploadProgress)}% uploaded
            </Text>
          </View>
        )}

        {/* Main Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          {/* Media Picker */}
          <MultiMediaPicker
            onMediaChange={handleMediaChange}
            initialMedia={media}
          />

          {/* Caption Input */}
          <View style={styles.inputSection}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              placeholderTextColor="#999"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={2200}
              accessibilityLabel="Caption input"
              accessibilityHint="Enter a caption for your post"
            />
            <Text style={styles.characterCount}>
              {caption.length} / 2200
            </Text>
          </View>

          {/* Location Input */}
          <View style={styles.inputSection}>
            <TextInput
              style={styles.locationInput}
              placeholder="Add location"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
              accessibilityLabel="Location input"
              accessibilityHint="Add a location to your post"
            />
          </View>

          {/* Tags Input */}
          <View style={styles.inputSection}>
            <TextInput
              style={styles.tagsInput}
              placeholder="Add tags (comma separated)"
              placeholderTextColor="#999"
              value={tags}
              onChangeText={setTags}
              accessibilityLabel="Tags input"
              accessibilityHint="Add tags separated by commas"
            />
          </View>
        </ScrollView>

        {/* Toast Message */}
        <Toast />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#000',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  shareButtonTextDisabled: {
    color: '#999',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  inputSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  captionInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  locationInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  tagsInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
});

export default PostScreen;

