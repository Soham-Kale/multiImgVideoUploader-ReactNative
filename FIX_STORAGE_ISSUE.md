# Fix INSTALL_FAILED_INSUFFICIENT_STORAGE Error

## Problem
The Android device/emulator doesn't have enough storage space to install the app.

## Solutions

### Option 1: Free Up Space on Emulator (Recommended)

1. **Open Android Studio**
2. **Go to Device Manager:**
   - Click `Tools` → `Device Manager` (or `View` → `Tool Windows` → `Device Manager`)
3. **Wipe Emulator Data:**
   - Find your emulator (e.g., "Pixel_8(AVD)")
   - Click the dropdown arrow (▼) next to the emulator
   - Select **"Wipe Data"** or **"Cold Boot Now"**
   - This will reset the emulator and free up all space

### Option 2: Uninstall Previous App Version

If you have a previous version installed:

1. **On the Emulator/Device:**
   - Go to `Settings` → `Apps`
   - Find `multiImgVideo` (or your app name)
   - Tap it and select **"Uninstall"**

2. **Or via Command Line:**
   ```bash
   # Find Android SDK path (usually in AppData\Local\Android\Sdk)
   # Then run:
   %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe uninstall com.multiimgvideo
   ```

### Option 3: Increase Emulator Storage

1. **In Android Studio Device Manager:**
   - Click the dropdown arrow next to your emulator
   - Click **"Edit"** (pencil icon)
   - Go to **"Show Advanced Settings"**
   - Increase **"Internal Storage"** (e.g., from 2GB to 4GB or more)
   - Click **"Finish"**
   - Delete and recreate the emulator if needed

### Option 4: Clear App Data (If App Already Installed)

1. **On Emulator:**
   - Go to `Settings` → `Apps` → `multiImgVideo`
   - Tap **"Storage"**
   - Tap **"Clear Data"** and **"Clear Cache"**

### Option 5: Use Physical Device

If emulator storage is consistently an issue:
- Connect a physical Android device via USB
- Enable USB Debugging on the device
- Free up space on the device manually
- Run: `npx react-native run-android`

## After Freeing Space

1. **Rebuild the app:**
   ```bash
   npx react-native run-android
   ```

2. **If still failing, clean build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

## About the Deprecation Warnings

The warnings about deprecated APIs in `react-native-async-storage` and `react-native-worklets` are **NOT** causing the build failure. They're just warnings that:
- Don't prevent the app from running
- May need attention in future updates
- Can be ignored for now

The **only** issue preventing installation is insufficient storage space.

