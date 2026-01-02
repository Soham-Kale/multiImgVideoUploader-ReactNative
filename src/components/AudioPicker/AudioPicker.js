import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import AudioService from '../../services/AudioService';

/**
 * AudioPicker - Component for selecting and syncing background music
 */
const AudioPicker = ({ onAudioSelected, onRemove, selectedAudio = null }) => {
  const [localMusicFiles, setLocalMusicFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLocalMusic();
  }, []);

  const loadLocalMusic = async () => {
    setIsLoading(true);
    try {
      // Get music files from common directories
      const musicPaths = [
        Platform.OS === 'ios'
          ? '/var/mobile/Media/iTunes_Control/Music'
          : '/storage/emulated/0/Music',
      ];

      const files = [];
      for (const path of musicPaths) {
        try {
          if (await RNFS.exists(path)) {
            const dirFiles = await RNFS.readDir(path);
            const musicFiles = dirFiles.filter(
              (file) =>
                file.isFile() &&
                (file.name.endsWith('.mp3') ||
                  file.name.endsWith('.m4a') ||
                  file.name.endsWith('.wav'))
            );
            files.push(...musicFiles);
          }
        } catch (error) {
          // Directory might not exist or be accessible
          console.log('Music directory not accessible:', path);
        }
      }

      setLocalMusicFiles(files);
    } catch (error) {
      console.error('Load music error:', error);
      Alert.alert(
        'Music Access',
        'Unable to access music files. You can add music files manually to the app directory.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAudio = async (audioFile) => {
    try {
      const audioUri = `file://${audioFile.path}`;
      if (onAudioSelected) {
        onAudioSelected({
          uri: audioUri,
          name: audioFile.name,
          size: audioFile.size,
        });
      }
    } catch (error) {
      console.error('Select audio error:', error);
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  const handleRemoveAudio = () => {
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Background Music</Text>
        {selectedAudio && (
          <TouchableOpacity onPress={handleRemoveAudio}>
            <Text style={styles.removeButton}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedAudio ? (
        <View style={styles.selectedAudioContainer}>
          <Text style={styles.selectedAudioIcon}>🎵</Text>
          <View style={styles.selectedAudioInfo}>
            <Text style={styles.selectedAudioName} numberOfLines={1}>
              {selectedAudio.name || 'Selected Music'}
            </Text>
            <Text style={styles.selectedAudioSize}>
              {(selectedAudio.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.musicList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading music files...</Text>
            </View>
          ) : localMusicFiles.length > 0 ? (
            localMusicFiles.map((file, index) => (
              <TouchableOpacity
                key={index}
                style={styles.musicItem}
                onPress={() => handleSelectAudio(file)}>
                <Text style={styles.musicIcon}>🎵</Text>
                <View style={styles.musicInfo}>
                  <Text style={styles.musicName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.musicSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                <Text style={styles.selectButton}>Select</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No music files found</Text>
              <Text style={styles.emptySubtext}>
                Add music files to your device's Music folder
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    color: '#ff3b30',
    fontSize: 14,
  },
  selectedAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
  },
  selectedAudioIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedAudioInfo: {
    flex: 1,
  },
  selectedAudioName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedAudioSize: {
    color: '#999',
    fontSize: 12,
  },
  musicList: {
    maxHeight: 200,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  musicIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  musicInfo: {
    flex: 1,
  },
  musicName: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  musicSize: {
    color: '#999',
    fontSize: 12,
  },
  selectButton: {
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AudioPicker;

