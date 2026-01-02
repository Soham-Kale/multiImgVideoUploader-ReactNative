import { useState, useCallback } from 'react';
import EditService from '../services/EditService';

/**
 * useMediaEditor - Hook for image editing operations
 * Provides crop, rotate, and filter functionality
 */
const useMediaEditor = (initialMedia = null) => {
  const [media, setMedia] = useState(initialMedia);
  const [aspectRatio, setAspectRatio] = useState('free');
  const [rotation, setRotation] = useState(0);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Crop image with aspect ratio
   */
  const cropImage = useCallback(
    async (cropData) => {
      if (!media) return null;

      setIsProcessing(true);
      try {
        const croppedUri = await EditService.cropImage(
          media.uri,
          cropData,
          aspectRatio
        );
        setMedia({ ...media, uri: croppedUri });
        return croppedUri;
      } catch (error) {
        console.error('Crop error:', error);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [media, aspectRatio]
  );

  /**
   * Rotate image
   */
  const rotateImage = useCallback(
    async (degrees) => {
      if (!media) return null;

      setIsProcessing(true);
      try {
        const rotatedUri = await EditService.rotateImage(media.uri, degrees);
        const newRotation = (rotation + degrees) % 360;
        setRotation(newRotation);
        setMedia({ ...media, uri: rotatedUri });
        return rotatedUri;
      } catch (error) {
        console.error('Rotate error:', error);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [media, rotation]
  );

  /**
   * Apply filters
   */
  const applyFilters = useCallback(
    async (newFilters) => {
      if (!media) return null;

      setIsProcessing(true);
      try {
        const filteredUri = await EditService.applyFilters(media.uri, {
          ...filters,
          ...newFilters,
        });
        setFilters({ ...filters, ...newFilters });
        setMedia({ ...media, uri: filteredUri });
        return filteredUri;
      } catch (error) {
        console.error('Filter error:', error);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [media, filters]
  );

  /**
   * Reset all edits
   */
  const resetEdits = useCallback(() => {
    setAspectRatio('free');
    setRotation(0);
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
    });
    if (initialMedia) {
      setMedia(initialMedia);
    }
  }, [initialMedia]);

  /**
   * Save edited media
   */
  const saveEdits = useCallback(() => {
    return media;
  }, [media]);

  return {
    media,
    aspectRatio,
    rotation,
    filters,
    isProcessing,
    setMedia,
    setAspectRatio,
    cropImage,
    rotateImage,
    applyFilters,
    resetEdits,
    saveEdits,
  };
};

export default useMediaEditor;

