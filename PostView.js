import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Video } from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PreviewModal from './PreviewModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POST_WIDTH = SCREEN_WIDTH;

/**
 * PostView - Instagram-like post display component
 * Shows a single post with media carousel, caption, location, tags, and engagement buttons
 */
const PostView = ({ post, onBack }) => {
  const insets = useSafeAreaInsets();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 1000) + 50);
  const [previewVisible, setPreviewVisible] = useState(false);

  const media = post.media || [];
  const currentMedia = media[currentMediaIndex];

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleMediaPress = () => {
    if (media.length > 0) {
      setPreviewVisible(true);
    }
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Your Post</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Media Carousel */}
        <View style={styles.mediaCarouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentMediaIndex(index);
            }}
            style={styles.mediaCarousel}>
            {media.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.mediaContainer}
                onPress={handleMediaPress}
                activeOpacity={1}>
                {item.type === 'video' ? (
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.media}
                    resizeMode="contain"
                    controls={true}
                    paused={index !== currentMediaIndex}
                  />
                ) : (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.media}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Media Indicators */}
          {media.length > 1 && (
            <View style={styles.mediaIndicators}>
              {media.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentMediaIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Engagement Section */}
        <View style={styles.engagementSection}>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Text style={styles.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📤</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔖</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.likesText}>
            {likesCount.toLocaleString()} likes
          </Text>
        </View>

        {/* Caption Section */}
        <View style={styles.captionSection}>
          <Text style={styles.username}>you</Text>
          <Text style={styles.caption}>{post.caption || 'No caption'}</Text>
        </View>

        {/* Location */}
        {post.location && (
          <View style={styles.locationSection}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{post.location}</Text>
          </View>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsLabel}>Tags: </Text>
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  #{tag}{' '}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Media Count Info */}
        {media.length > 1 && (
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaInfoText}>
              {currentMediaIndex + 1} of {media.length}
            </Text>
          </View>
        )}

        {/* Timestamp */}
        <View style={styles.timestampSection}>
          <Text style={styles.timestamp}>
            {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </ScrollView>

      {/* Full Screen Preview Modal */}
      <PreviewModal
        visible={previewVisible}
        media={media}
        currentIndex={currentMediaIndex}
        onClose={handlePreviewClose}
        onDelete={null} // No delete in post view
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#262626',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  mediaCarouselContainer: {
    width: POST_WIDTH,
    height: POST_WIDTH,
    backgroundColor: '#000',
    position: 'relative',
  },
  mediaCarousel: {
    width: POST_WIDTH,
    height: POST_WIDTH,
  },
  mediaContainer: {
    width: POST_WIDTH,
    height: POST_WIDTH,
    backgroundColor: '#000',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaIndicators: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  engagementSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButton: {
    marginRight: 16,
    padding: 4,
  },
  actionIcon: {
    fontSize: 24,
  },
  spacer: {
    flex: 1,
  },
  likesText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  captionSection: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tagsLabel: {
    color: '#999',
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    color: '#0095f6',
    fontSize: 12,
  },
  mediaInfo: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  mediaInfoText: {
    color: '#999',
    fontSize: 12,
  },
  timestampSection: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});

export default PostView;

