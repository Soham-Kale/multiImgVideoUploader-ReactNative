import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';

/**
 * EditService - Handles image editing operations
 * - Crop with different ratios (1:1, 4:5, 16:9, free)
 * - Rotate images
 * - Apply filters (brightness, contrast, saturation)
 */
class EditService {
  /**
   * Crop image with specific aspect ratio
   * @param {string} uri - Image URI
   * @param {Object} cropData - { x, y, width, height }
   * @param {string} aspectRatio - '1:1', '4:5', '16:9', 'free'
   * @returns {Promise<string>} Cropped image URI
   */
  async cropImage(uri, cropData, aspectRatio = 'free') {
    try {
      // Calculate dimensions based on aspect ratio
      let targetWidth = cropData.width;
      let targetHeight = cropData.height;

      if (aspectRatio !== 'free') {
        const ratio = this.getAspectRatioValue(aspectRatio);
        if (cropData.width / cropData.height > ratio) {
          targetHeight = cropData.width / ratio;
        } else {
          targetWidth = cropData.height * ratio;
        }
      }

      // Use ImageResizer to crop (it crops from center)
      const response = await ImageResizer.createResizedImage(
        uri,
        Math.round(targetWidth),
        Math.round(targetHeight),
        'JPEG',
        90,
        0, // rotation handled separately
        undefined,
        false,
        {
          mode: 'contain',
        }
      );

      return response.uri;
    } catch (error) {
      console.error('Crop error:', error);
      return uri;
    }
  }

  /**
   * Rotate image
   * @param {string} uri - Image URI
   * @param {number} degrees - Rotation degrees (90, 180, 270)
   * @returns {Promise<string>} Rotated image URI
   */
  async rotateImage(uri, degrees) {
    try {
      const response = await ImageResizer.createResizedImage(
        uri,
        1080,
        1080 * 2,
        'JPEG',
        90,
        degrees,
        undefined,
        false,
        {
          mode: 'contain',
          onlyScaleDown: true,
        }
      );
      return response.uri;
    } catch (error) {
      console.error('Rotate error:', error);
      return uri;
    }
  }

  /**
   * Apply filter to image (brightness, contrast, saturation)
   * Note: ImageResizer doesn't support filters directly
   * This is a placeholder - filters would need native implementation
   * or a library like react-native-image-filter-kit
   * @param {string} uri - Image URI
   * @param {Object} filters - { brightness: 0-200, contrast: 0-200, saturation: 0-200 }
   * @returns {Promise<string>} Filtered image URI
   */
  async applyFilters(uri, filters) {
    // TODO: Implement with react-native-image-filter-kit or native module
    // For now, return original URI
    console.log('Filters not yet implemented:', filters);
    return uri;
  }

  /**
   * Get aspect ratio value
   * @param {string} ratio - '1:1', '4:5', '16:9'
   * @returns {number} Aspect ratio value
   */
  getAspectRatioValue(ratio) {
    const ratios = {
      '1:1': 1,
      '4:5': 4 / 5,
      '16:9': 16 / 9,
      'free': null,
    };
    return ratios[ratio] || 1;
  }

  /**
   * Get crop dimensions for aspect ratio
   * @param {number} imageWidth - Original image width
   * @param {number} imageHeight - Original image height
   * @param {string} aspectRatio - '1:1', '4:5', '16:9', 'free'
   * @returns {Object} { width, height }
   */
  getCropDimensions(imageWidth, imageHeight, aspectRatio) {
    if (aspectRatio === 'free') {
      return { width: imageWidth, height: imageHeight };
    }

    const ratio = this.getAspectRatioValue(aspectRatio);
    let width = imageWidth;
    let height = imageHeight;

    if (width / height > ratio) {
      width = height * ratio;
    } else {
      height = width / ratio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }
}

export default new EditService();

