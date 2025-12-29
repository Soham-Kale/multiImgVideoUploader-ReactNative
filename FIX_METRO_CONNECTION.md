# Fix "Unable to load script" Error

## Why This Error Happens

The error "Unable to load script" occurs when your Android device/emulator **cannot connect to Metro bundler** (the JavaScript development server). This happens because:

1. **Metro bundler is not running** - The most common cause
2. **Network connectivity issues** - Device can't reach Metro on port 8081
3. **ADB reverse not set up** - For USB-connected physical devices
4. **Firewall blocking connection** - Windows Firewall blocking port 8081

## Quick Fix (Step-by-Step)

### Step 1: Start Metro Bundler

**Option A: Using the helper script (Easiest)**
```powershell
.\start-metro.ps1
```

**Option B: Manual start**
```bash
npm start -- --reset-cache
```

You should see:
```
Metro waiting on port 8081
```

### Step 2: Set Up ADB Reverse (For USB Physical Devices Only)

If you're using a **physical Android device connected via USB**, run:

```powershell
# Find ADB (usually in Android SDK)
$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe reverse tcp:8081 tcp:8081
```

Or use the helper script which does this automatically.

**Note:** If using an **emulator** or **Wi-Fi connection**, skip this step.

### Step 3: Verify Connection

1. **Check Metro is running:**
   - Look for a terminal window showing Metro bundler
   - Should display "Metro waiting on port 8081"

2. **Check device can reach Metro:**
   - **Emulator:** Uses `10.0.2.2:8081` automatically
   - **USB Device:** Needs `adb reverse` (see Step 2)
   - **Wi-Fi Device:** Must be on same network, use your computer's IP

3. **Reload the app:**
   - Press `R` twice on the device, OR
   - Shake device and tap "Reload", OR
   - Run: `npx react-native run-android` again

## Detailed Solutions

### Solution 1: Metro Not Running

**Symptoms:**
- Error shows "Unable to load script"
- No Metro terminal window visible

**Fix:**
```bash
npm start -- --reset-cache
```

Keep this terminal window open. Metro must be running for the app to work.

### Solution 2: USB Device Connection

**Symptoms:**
- Using physical Android device via USB
- Metro is running but app still can't connect

**Fix:**
```bash
# Set up port forwarding
adb reverse tcp:8081 tcp:8081

# Verify it worked
adb reverse --list
# Should show: tcp:8081 tcp:8081
```

### Solution 3: Wi-Fi Connection

**Symptoms:**
- Using physical device over Wi-Fi
- Device and computer on same network

**Fix:**
1. Find your computer's IP address:
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Shake device → Dev Settings → Debug server host → Enter: `YOUR_IP:8081`
   - Example: `192.168.1.100:8081`

3. Reload app (press R twice)

### Solution 4: Firewall Blocking

**Symptoms:**
- Metro running, ADB reverse set, but still can't connect

**Fix:**
1. Open Windows Defender Firewall
2. Allow Node.js through firewall
3. Or temporarily disable firewall to test

### Solution 5: Port Already in Use

**Symptoms:**
- Metro fails to start
- Error: "Port 8081 already in use"

**Fix:**
```bash
# Kill process on port 8081
netstat -ano | findstr :8081
taskkill /PID <PID_NUMBER> /F

# Then start Metro again
npm start -- --reset-cache
```

## Verification Checklist

- [ ] Metro bundler is running (terminal shows "Metro waiting on port 8081")
- [ ] If using USB device: `adb reverse tcp:8081 tcp:8081` is set
- [ ] If using Wi-Fi: Device and computer on same network
- [ ] App reloaded (press R twice on device)
- [ ] No firewall blocking port 8081

## Common Mistakes

1. **Closing Metro terminal** - Metro must stay running
2. **Wrong network** - Wi-Fi device and computer must be on same network
3. **Forgot ADB reverse** - USB devices need port forwarding
4. **Old Metro cache** - Use `--reset-cache` flag

## Still Not Working?

1. **Kill all Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Clear all caches:**
   ```bash
   npm start -- --reset-cache
   ```

3. **Rebuild app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

4. **Check Metro logs** - Look at the Metro terminal for error messages

