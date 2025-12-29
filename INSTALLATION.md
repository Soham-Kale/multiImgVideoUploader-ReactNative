# Installation Guide - Instagram-like Multi-Media Picker

## Installation Commands

Run these commands to install all required dependencies:

```bash
# Using npm
npm install react-native-image-picker@^7.1.2 react-native-reanimated@^3.15.4 react-native-gesture-handler@^2.20.0 react-native-image-resizer@^3.1.2 react-native-image-viewing@^0.2.2 react-native-toast-message@^2.2.0 react-native-safe-area-context@^4.12.0 react-native-permissions@^4.1.5 @react-native-async-storage/async-storage@^2.1.2 react-native-video@^6.0.0

# OR using yarn
yarn add react-native-image-picker@^7.1.2 react-native-reanimated@^3.15.4 react-native-gesture-handler@^2.20.0 react-native-image-resizer@^3.1.2 react-native-image-viewing@^0.2.2 react-native-toast-message@^2.2.0 react-native-safe-area-context@^4.12.0 react-native-permissions@^4.1.5 @react-native-async-storage/async-storage@^2.1.2 react-native-video@^6.0.0
```

## iOS Setup

1. **Install Pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Permissions are already configured** in `ios/multiImgVideo/Info.plist`:
   - NSCameraUsageDescription
   - NSPhotoLibraryUsageDescription
   - NSPhotoLibraryAddUsageDescription

## Android Setup

1. **Permissions are already configured** in `android/app/src/main/AndroidManifest.xml`:
   - CAMERA
   - READ_EXTERNAL_STORAGE
   - READ_MEDIA_IMAGES
   - READ_MEDIA_VIDEO
   - WRITE_EXTERNAL_STORAGE (for Android <= 12)

2. **Rebuild the app:**
   ```bash
   # For Android
   npm run android
   # or
   yarn android

   # For iOS
   npm run ios
   # or
   yarn ios
   ```

## Important Notes

1. **Babel Configuration**: The `babel.config.js` has been updated to include the `react-native-reanimated/plugin`. Make sure to restart Metro bundler after this change.

2. **Metro Bundler**: After installing dependencies, restart Metro bundler:
   ```bash
   npm start -- --reset-cache
   ```

3. **Native Modules**: Some packages require native code linking. After installation:
   - iOS: Run `pod install` in the `ios` directory
   - Android: Rebuild the app

4. **API Endpoint**: The upload endpoint is set to `/api/posts` in `PostScreen.js`. Update this to your actual backend endpoint.

5. **Video Support**: `react-native-video` requires additional native setup. Make sure to follow their installation guide if you encounter issues.

## Features Implemented

✅ Multi-media selection (up to 10 items)
✅ Gallery and camera support
✅ Image compression (1080px width, 80% quality)
✅ Video support (<15 seconds)
✅ Horizontal scrollable preview carousel
✅ Drag-to-reorder with smooth animations
✅ Tap-to-view full-screen preview
✅ Zoom/pinch gestures for images
✅ Individual delete buttons
✅ Parallel upload with progress tracking
✅ Error handling with retry
✅ Toast notifications
✅ Safe area handling
✅ Accessibility support
✅ Caption, location, and tags input

## File Structure

- `MultiMediaPicker.js` - Main media picker component
- `PreviewModal.js` - Full-screen preview modal
- `PostScreen.js` - Main post creation screen
- `App.js` - Updated to use PostScreen

## Testing

1. Test media selection from gallery
2. Test camera capture
3. Test drag-to-reorder functionality
4. Test full-screen preview
5. Test upload flow (mock endpoint)
6. Test error handling and retry

## Troubleshooting

- If drag-to-reorder doesn't work, ensure `react-native-gesture-handler` is properly linked
- If images don't compress, check `react-native-image-resizer` installation
- If permissions don't work, verify Info.plist (iOS) and AndroidManifest.xml (Android)
- If reanimated animations don't work, ensure babel plugin is configured and Metro is restarted

