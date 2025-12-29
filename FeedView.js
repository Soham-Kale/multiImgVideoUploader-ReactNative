import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostView from './PostView';

/**
 * FeedView - Instagram-like feed showing all posts
 */
const FeedView = ({ posts = [], onBack }) => {
  const insets = useSafeAreaInsets();
  const [selectedPost, setSelectedPost] = useState(null);

  if (selectedPost) {
    return (
      <PostView
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Your Posts</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Share your first post!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Your Posts</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item, index) => item.id || `post-${index}`}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => setSelectedPost(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

/**
 * PostCard - Compact post preview for feed
 */
const PostCard = ({ post, onPress }) => {
  const media = post.media || [];
  const firstMedia = media[0];

  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress}>
      {firstMedia?.type === 'video' ? (
        <View style={styles.mediaPreview}>
          <Text style={styles.videoIcon}>▶</Text>
        </View>
      ) : (
        <Image
          source={{ uri: firstMedia?.uri }}
          style={styles.mediaPreview}
          resizeMode="cover"
        />
      )}
      {media.length > 1 && (
        <View style={styles.multiMediaBadge}>
          <Text style={styles.multiMediaText}>📷</Text>
        </View>
      )}
      <View style={styles.postCardInfo}>
        <Text style={styles.postCardCaption} numberOfLines={1}>
          {post.caption || 'No caption'}
        </Text>
        <Text style={styles.postCardDate}>
          {new Date(post.createdAt || Date.now()).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
  },
  listContent: {
    padding: 12,
  },
  postCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    color: '#fff',
    fontSize: 48,
  },
  multiMediaBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  multiMediaText: {
    fontSize: 14,
  },
  postCardInfo: {
    padding: 12,
  },
  postCardCaption: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  postCardDate: {
    color: '#999',
    fontSize: 12,
  },
});

export default FeedView;

