import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

/**
 * AudioService - Handles audio/music operations
 * - Load local audio files
 * - Play/pause/stop audio
 * - Sync audio with media carousel
 * - Trim audio
 */
class AudioService {
  constructor() {
    this.currentSound = null;
    this.isPlaying = false;
  }

  /**
   * Load audio file
   * @param {string} audioUri - Audio file URI
   * @returns {Promise<Sound>} Sound object
   */
  async loadAudio(audioUri) {
    return new Promise((resolve, reject) => {
      // Enable playback in silence mode (iOS)
      Sound.setCategory('Playback');

      const sound = new Sound(audioUri, '', (error) => {
        if (error) {
          console.error('Failed to load audio:', error);
          reject(error);
          return;
        }
        this.currentSound = sound;
        resolve(sound);
      });
    });
  }

  /**
   * Play audio
   * @param {string} audioUri - Audio file URI
   * @param {Function} onFinish - Callback when audio finishes
   * @returns {Promise<void>}
   */
  async playAudio(audioUri, onFinish) {
    try {
      // Stop current audio if playing
      await this.stopAudio();

      const sound = await this.loadAudio(audioUri);
      
      sound.play((success) => {
        this.isPlaying = false;
        if (success) {
          console.log('Audio playback finished');
          if (onFinish) onFinish();
        } else {
          console.log('Audio playback failed');
        }
        sound.release();
      });

      this.isPlaying = true;
    } catch (error) {
      console.error('Play audio error:', error);
      this.isPlaying = false;
    }
  }

  /**
   * Pause audio
   */
  pauseAudio() {
    if (this.currentSound && this.isPlaying) {
      this.currentSound.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume audio
   */
  resumeAudio() {
    if (this.currentSound && !this.isPlaying) {
      this.currentSound.play();
      this.isPlaying = true;
    }
  }

  /**
   * Stop audio
   */
  async stopAudio() {
    return new Promise((resolve) => {
      if (this.currentSound) {
        this.currentSound.stop(() => {
          this.currentSound.release();
          this.currentSound = null;
          this.isPlaying = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get audio duration
   * @param {string} audioUri - Audio file URI
   * @returns {Promise<number>} Duration in seconds
   */
  async getAudioDuration(audioUri) {
    try {
      const sound = await this.loadAudio(audioUri);
      return new Promise((resolve) => {
        sound.getDuration((duration) => {
          sound.release();
          resolve(duration);
        });
      });
    } catch (error) {
      console.error('Get audio duration error:', error);
      return 0;
    }
  }

  /**
   * Trim audio (requires native implementation)
   * @param {string} audioUri - Source audio URI
   * @param {number} startTime - Start time in seconds
   * @param {number} endTime - End time in seconds
   * @returns {Promise<string>} Trimmed audio URI
   */
  async trimAudio(audioUri, startTime, endTime) {
    try {
      // TODO: Implement with react-native-ffmpeg or native module
      console.log('Audio trimming:', { audioUri, startTime, endTime });
      return audioUri;
    } catch (error) {
      console.error('Audio trim error:', error);
      return audioUri;
    }
  }

  /**
   * Get local music files from device
   * @returns {Promise<Array>} Array of audio file objects
   */
  async getLocalMusicFiles() {
    try {
      // This would require accessing device music library
      // For now, return empty array
      // In production, use a library or native module to access music library
      return [];
    } catch (error) {
      console.error('Get local music error:', error);
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAudio();
  }
}

export default new AudioService();

