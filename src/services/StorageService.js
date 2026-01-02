import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const POSTS_STORAGE_KEY = '@multiImgVideo:posts';
const MEDIA_STORAGE_KEY = '@multiImgVideo:media';

/**
 * StorageService - Handles local storage operations
 * - Save/load posts
 * - Manage media files
 * - Cleanup old files
 */
class StorageService {
  /**
   * Save post to local storage
   * @param {Object} post - Post object
   * @returns {Promise<void>}
   */
  async savePost(post) {
    try {
      const posts = await this.getAllPosts();
      const updatedPosts = [post, ...posts];
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      return post;
    } catch (error) {
      console.error('Save post error:', error);
      throw error;
    }
  }

  /**
   * Get all posts
   * @returns {Promise<Array>} Array of posts
   */
  async getAllPosts() {
    try {
      const storedPosts = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      return storedPosts ? JSON.parse(storedPosts) : [];
    } catch (error) {
      console.error('Get posts error:', error);
      return [];
    }
  }

  /**
   * Get post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object|null>} Post object or null
   */
  async getPostById(postId) {
    try {
      const posts = await this.getAllPosts();
      return posts.find((p) => p.id === postId) || null;
    } catch (error) {
      console.error('Get post error:', error);
      return null;
    }
  }

  /**
   * Delete post
   * @param {string} postId - Post ID
   * @returns {Promise<boolean>} Success status
   */
  async deletePost(postId) {
    try {
      const posts = await this.getAllPosts();
      const filteredPosts = posts.filter((p) => p.id !== postId);
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(filteredPosts));
      return true;
    } catch (error) {
      console.error('Delete post error:', error);
      return false;
    }
  }

  /**
   * Save media file to local storage
   * @param {string} sourceUri - Source file URI
   * @param {string} fileName - Target file name
   * @returns {Promise<string>} Local file URI
   */
  async saveMediaFile(sourceUri, fileName) {
    try {
      const documentsPath = RNFS.DocumentDirectoryPath;
      const mediaPath = `${documentsPath}/media`;
      
      // Create media directory if it doesn't exist
      const dirExists = await RNFS.exists(mediaPath);
      if (!dirExists) {
        await RNFS.mkdir(mediaPath);
      }

      const targetPath = `${mediaPath}/${fileName}`;
      await RNFS.copyFile(sourceUri.replace('file://', ''), targetPath);
      
      return `file://${targetPath}`;
    } catch (error) {
      console.error('Save media file error:', error);
      return sourceUri;
    }
  }

  /**
   * Get storage size
   * @returns {Promise<number>} Storage size in bytes
   */
  async getStorageSize() {
    try {
      const documentsPath = RNFS.DocumentDirectoryPath;
      const stat = await RNFS.stat(documentsPath);
      return stat.size || 0;
    } catch (error) {
      console.error('Get storage size error:', error);
      return 0;
    }
  }

  /**
   * Cleanup old files (older than specified days)
   * @param {number} daysOld - Days old threshold
   * @returns {Promise<number>} Number of files deleted
   */
  async cleanupOldFiles(daysOld = 30) {
    try {
      const documentsPath = RNFS.DocumentDirectoryPath;
      const mediaPath = `${documentsPath}/media`;
      
      if (!(await RNFS.exists(mediaPath))) {
        return 0;
      }

      const files = await RNFS.readDir(mediaPath);
      const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        if (file.mtime && file.mtime < cutoffDate) {
          await RNFS.unlink(file.path);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }
}

export default new StorageService();

