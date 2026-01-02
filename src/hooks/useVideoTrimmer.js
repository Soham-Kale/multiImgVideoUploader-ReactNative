import { useState, useCallback, useRef } from 'react';
import VideoService from '../services/VideoService';

/**
 * useVideoTrimmer - Hook for video trimming operations
 */
const useVideoTrimmer = (initialVideo = null) => {
  const [video, setVideo] = useState(initialVideo);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const videoRef = useRef(null);

  /**
   * Load video and get duration
   */
  const loadVideo = useCallback(async (videoUri) => {
    try {
      const videoDuration = await VideoService.getVideoDuration(videoUri);
      setDuration(videoDuration);
      setEndTime(videoDuration);
      setVideo({ uri: videoUri, duration: videoDuration });
      return videoDuration;
    } catch (error) {
      console.error('Load video error:', error);
      return 0;
    }
  }, []);

  /**
   * Trim video
   */
  const trimVideo = useCallback(async () => {
    if (!video || !video.uri) return null;

    setIsTrimming(true);
    try {
      const trimmedUri = await VideoService.trimVideo(
        video.uri,
        startTime,
        endTime
      );
      setVideo({ ...video, uri: trimmedUri });
      return trimmedUri;
    } catch (error) {
      console.error('Trim error:', error);
      return null;
    } finally {
      setIsTrimming(false);
    }
  }, [video, startTime, endTime]);

  /**
   * Set trim start time
   */
  const setTrimStart = useCallback(
    (time) => {
      const clampedTime = Math.max(0, Math.min(time, endTime - 0.1));
      setStartTime(clampedTime);
    },
    [endTime]
  );

  /**
   * Set trim end time
   */
  const setTrimEnd = useCallback(
    (time) => {
      const clampedTime = Math.max(startTime + 0.1, Math.min(time, duration));
      setEndTime(clampedTime);
    },
    [startTime, duration]
  );

  /**
   * Reset trim
   */
  const resetTrim = useCallback(() => {
    setStartTime(0);
    setEndTime(duration);
  }, [duration]);

  return {
    video,
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
    setVideo,
  };
};

export default useVideoTrimmer;

