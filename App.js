import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PostScreen from './PostScreen';
import FeedView from './FeedView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const POSTS_STORAGE_KEY = '@multiImgVideo:posts';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentView, setCurrentView] = useState('post'); // 'post' or 'feed'
  const [posts, setPosts] = useState([]);

  // Load posts from storage on mount
  React.useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const savePost = async (postData) => {
    try {
      const updatedPosts = [postData, ...posts];
      setPosts(updatedPosts);
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handlePostCreated = (postData) => {
    if (postData) {
      savePost(postData);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {currentView === 'post' ? (
        <PostScreen
          onPostCreated={handlePostCreated}
        />
      ) : (
        <FeedView
          posts={posts}
          onBack={() => setCurrentView('post')}
        />
      )}
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, currentView === 'post' && styles.navButtonActive]}
          onPress={() => setCurrentView('post')}>
          <Text style={styles.navButtonText}>➕ Create</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentView === 'feed' && styles.navButtonActive]}
          onPress={() => setCurrentView('feed')}>
          <Text style={styles.navButtonText}>📱 Feed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#262626',
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: '#262626',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;
