# PowerShell script to uninstall the app from connected Android device/emulator
# This helps free up space before reinstalling

Write-Host "Attempting to uninstall multiImgVideo app..." -ForegroundColor Yellow

# Try to find ADB in common locations
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

if (-not $adb) {
    Write-Host "ADB not found. Please uninstall manually:" -ForegroundColor Red
    Write-Host "1. Open Android Studio" -ForegroundColor Yellow
    Write-Host "2. Go to Device Manager" -ForegroundColor Yellow
    Write-Host "3. Wipe emulator data or uninstall app from device" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found ADB at: $adb" -ForegroundColor Green

# Check if device is connected
$devices = & $adb devices
if ($devices -match "device$") {
    Write-Host "Device found. Uninstalling app..." -ForegroundColor Green
    & $adb uninstall com.multiimgvideo
    if ($LASTEXITCODE -eq 0) {
        Write-Host "App uninstalled successfully!" -ForegroundColor Green
    } else {
        Write-Host "App may not be installed, or uninstall failed." -ForegroundColor Yellow
        Write-Host "This is okay - you can proceed to build." -ForegroundColor Yellow
    }
} else {
    Write-Host "No device/emulator connected." -ForegroundColor Red
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Start your Android emulator, OR" -ForegroundColor Yellow
    Write-Host "2. Connect a physical device with USB debugging enabled" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
}

