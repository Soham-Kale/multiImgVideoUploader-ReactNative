import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Video } from 'react-native-video';
import CustomSlider from '../CustomSlider/CustomSlider';
import useVideoTrimmer from '../../hooks/useVideoTrimmer';

/**
 * VideoTrimmer - Instagram-like video trimming interface
 */
const VideoTrimmer = ({ video, onSave, onCancel }) => {
  const {
    video: trimmedVideo,
    startTime,
    endTime,
    duration,
    isTrimming,
    videoRef,
    loadVideo,
    trimVideo,
    setTrimStart,
    setTrimEnd,
    resetTrim,
  } = useVideoTrimmer(video);

  useEffect(() => {
    if (video?.uri) {
      loadVideo(video.uri);
    }
  }, [video?.uri, loadVideo]);

  const handleSave = async () => {
    const trimmedUri = await trimVideo();
    if (trimmedUri && onSave) {
      onSave({ ...video, uri: trimmedUri });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video || video.type !== 'video') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Only videos can be trimmed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trim Video</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={isTrimming}>
          <Text style={[styles.headerButtonText, styles.saveButton]}>
            {isTrimming ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.videoContainer}>
        {isTrimming ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Trimming video...</Text>
          </View>
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: video.uri }}
            style={styles.video}
            resizeMode="contain"
            controls={true}
            paused={false}
          />
        )}
      </View>

      {/* Trim Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>Start: {formatTime(startTime)}</Text>
          <Text style={styles.timeText}>End: {formatTime(endTime)}</Text>
          <Text style={styles.timeText}>
            Duration: {formatTime(endTime - startTime)}
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Start Time</Text>
          <CustomSlider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={startTime}
            onValueChange={setTrimStart}
            minimumTrackTintColor="#0095f6"
            maximumTrackTintColor="#666"
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>End Time</Text>
          <CustomSlider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={endTime}
            onValueChange={setTrimEnd}
            minimumTrackTintColor="#0095f6"
            maximumTrackTintColor="#666"
          />
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetTrim}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
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
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
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
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#262626',
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  resetButton: {
    backgroundColor: '#262626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default VideoTrimmer;

