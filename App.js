import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PostScreen from './PostScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <PostScreen
        onPostCreated={() => {
          console.log('Post created successfully');
          // Handle post creation success (e.g., navigate back, refresh feed, etc.)
        }}
      />
    </SafeAreaProvider>
  );
}

export default App;
