import { useState, useCallback, useEffect, useRef } from 'react';
import AudioService from '../services/AudioService';

/**
 * useAudioSync - Hook for audio synchronization with media carousel
 */
const useAudioSync = (mediaItems = [], autoPlay = false) => {
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const audioServiceRef = useRef(AudioService);

  /**
   * Select audio file
   */
  const selectAudio = useCallback(async (audioUri) => {
    try {
      await audioServiceRef.current.stopAudio();
      setSelectedAudio(audioUri);
      if (autoPlay) {
        await playAudio();
      }
    } catch (error) {
      console.error('Select audio error:', error);
    }
  }, [autoPlay]);

  /**
   * Play audio
   */
  const playAudio = useCallback(async () => {
    if (!selectedAudio) return;

    try {
      await audioServiceRef.current.playAudio(selectedAudio, () => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Play audio error:', error);
      setIsPlaying(false);
    }
  }, [selectedAudio]);

  /**
   * Pause audio
   */
  const pauseAudio = useCallback(() => {
    audioServiceRef.current.pauseAudio();
    setIsPlaying(false);
  }, []);

  /**
   * Resume audio
   */
  const resumeAudio = useCallback(() => {
    audioServiceRef.current.resumeAudio();
    setIsPlaying(true);
  }, []);

  /**
   * Stop audio
   */
  const stopAudio = useCallback(async () => {
    await audioServiceRef.current.stopAudio();
    setIsPlaying(false);
  }, []);

  /**
   * Remove audio
   */
  const removeAudio = useCallback(async () => {
    await stopAudio();
    setSelectedAudio(null);
  }, [stopAudio]);

  /**
   * Sync audio with media index (restart audio when media changes)
   */
  useEffect(() => {
    if (selectedAudio && isPlaying && mediaItems.length > 0) {
      // Restart audio when media changes (for carousel sync)
      stopAudio().then(() => {
        if (autoPlay) {
          playAudio();
        }
      });
    }
  }, [currentMediaIndex, mediaItems.length]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      audioServiceRef.current.cleanup();
    };
  }, []);

  return {
    selectedAudio,
    isPlaying,
    selectAudio,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    removeAudio,
    setCurrentMediaIndex,
  };
};

export default useAudioSync;

