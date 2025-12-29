# PowerShell script to start Metro bundler and set up ADB reverse for Android

Write-Host "Starting Metro Bundler..." -ForegroundColor Green
Write-Host ""

# Start Metro in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start -- --reset-cache"

Write-Host "Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Try to find ADB
$adbPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools\adb.exe"
)

$adb = $null
foreach ($path in $adbPaths) {
    if (Test-Path $path) {
        $adb = $path
        break
    }
}

if ($adb) {
    Write-Host "Found ADB at: $adb" -ForegroundColor Green
    Write-Host "Setting up ADB reverse for USB connection..." -ForegroundColor Yellow
    
    # Check if device is connected
    $devices = & $adb devices 2>&1
    if ($devices -match "device$") {
        Write-Host "Device found. Setting up port forwarding..." -ForegroundColor Green
        & $adb reverse tcp:8081 tcp:8081
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ ADB reverse configured successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠ ADB reverse setup failed, but Metro should still work over Wi-Fi" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ No device connected. Make sure:" -ForegroundColor Yellow
        Write-Host "  - Your emulator is running, OR" -ForegroundColor Yellow
        Write-Host "  - Your physical device is connected with USB debugging enabled" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "If using Wi-Fi, ensure device and computer are on the same network." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ ADB not found. If using USB device, you may need to manually run:" -ForegroundColor Yellow
    Write-Host "  adb reverse tcp:8081 tcp:8081" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If using emulator or Wi-Fi, this is not needed." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Metro bundler should now be running in a new window." -ForegroundColor Green
Write-Host "You should see 'Metro waiting on...' message." -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run: npx react-native run-android" -ForegroundColor Cyan

