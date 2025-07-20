# Device Detection Module

The device detection module provides comprehensive device type detection, operating system identification, browser detection, and related functionality to help developers better adapt to different devices and environments.

## Features

- 📱 **Device Type Detection**: Detect mobile devices, tablets, desktop devices
- 🖥️ **Operating System Identification**: Identify Windows, macOS, Linux, Android, iOS
- 🌐 **Browser Detection**: Detect Chrome, Firefox, Safari, Edge, and other browsers
- 👆 **Touch Device Detection**: Detect touch operation support
- 📺 **Screen Information**: Get screen size, resolution, orientation, etc.
- 🌐 **Network Status**: Detect network connection type and status
- 🔋 **Hardware Information**: Get battery, memory, GPU, and other hardware info
- 🎨 **Feature Support Detection**: Detect WebGL, WebAssembly, Service Worker support

## Quick Start

```javascript
import { device, getDeviceInfo, isMobile, isTablet, isDesktop } from 'js-use-core';

// Get complete device information
const deviceInfo = getDeviceInfo();
console.log(deviceInfo);

// Detect device type
console.log('Is mobile device:', isMobile());
console.log('Is tablet device:', isTablet());
console.log('Is desktop device:', isDesktop());
```

## API Documentation

### Basic Device Detection

#### isMobile(options?)

Detect if it's a mobile device.

**Parameters:**
- `options` (MobileDetectOptions, optional): Detection options

**Returns:**
- `boolean`: Whether it's a mobile device

```javascript
import { isMobile } from 'js-use-core';

// Basic detection
console.log(isMobile()); // true/false

// Custom user agent
console.log(isMobile({ 
  ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' 
}));

// Enable feature detection
console.log(isMobile({ 
  featureDetect: true,
  tablet: true 
}));
```

#### isTablet(options?)

Detect if it's a tablet device.

```javascript
import { isTablet } from 'js-use-core';

console.log(isTablet()); // true/false
console.log(isTablet({ ua: 'iPad User Agent' }));
```

#### isDesktop(options?)

Detect if it's a desktop device.

```javascript
import { isDesktop } from 'js-use-core';

console.log(isDesktop()); // true/false
```

#### getDeviceType(options?)

Get device type.

```javascript
import { getDeviceType, DeviceType } from 'js-use-core';

const type = getDeviceType();
console.log(type); // 'mobile' | 'tablet' | 'desktop'

// Using enum
if (type === DeviceType.MOBILE) {
  console.log('This is a mobile device');
}
```

### Operating System and Browser Detection

#### detectOS(ua?)

Detect operating system type.

```javascript
import { detectOS, OSType } from 'js-use-core';

const os = detectOS();
console.log(os); // 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown'

// Custom user agent
const customOS = detectOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
```

#### detectBrowser(ua?)

Detect browser type.

```javascript
import { detectBrowser, BrowserType } from 'js-use-core';

const browser = detectBrowser();
console.log(browser); // 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'opera' | 'unknown'
```

### Device Feature Detection

#### isTouchDevice()

Detect if it's a touch device.

```javascript
import { isTouchDevice } from 'js-use-core';

if (isTouchDevice()) {
  console.log('Touch operations supported');
}
```

#### isRetinaDisplay()

Detect if it's a high-resolution screen.

```javascript
import { isRetinaDisplay } from 'js-use-core';

if (isRetinaDisplay()) {
  console.log('High-resolution screen');
}
```

#### isDarkMode()

Detect if dark theme is preferred.

```javascript
import { isDarkMode } from 'js-use-core';

if (isDarkMode()) {
  console.log('User prefers dark theme');
}
```

### Screen and Viewport Information

#### getScreenSize()

Get screen size information.

```javascript
import { getScreenSize } from 'js-use-core';

const screen = getScreenSize();
console.log(screen);
// { width: 1920, height: 1080, pixelRatio: 2 }
```

#### getViewportSize()

Get viewport size.

```javascript
import { getViewportSize } from 'js-use-core';

const viewport = getViewportSize();
console.log(viewport);
// { width: 1200, height: 800 }
```

#### getScreenOrientation()

Get screen orientation.

```javascript
import { getScreenOrientation, ScreenOrientation } from 'js-use-core';

const orientation = getScreenOrientation();
console.log(orientation); // 'portrait' | 'landscape'
```

#### onOrientationChange(callback)

Listen for screen orientation changes.

```javascript
import { onOrientationChange } from 'js-use-core';

const unsubscribe = onOrientationChange((orientation) => {
  console.log('Screen orientation changed:', orientation);
});

// Unsubscribe
unsubscribe();
```

### Network Status Detection

#### getNetworkType()

Get network connection type.

```javascript
import { getNetworkType, NetworkType } from 'js-use-core';

const networkType = getNetworkType();
console.log(networkType); // 'wifi' | 'cellular' | 'ethernet' | 'unknown'
```

#### getNetworkSpeed()

Get network connection speed.

```javascript
import { getNetworkSpeed } from 'js-use-core';

const speed = getNetworkSpeed();
console.log(speed);
// { downlink: 10, rtt: 50, effectiveType: '4g' }
```

#### isOnline()

Detect if online.

```javascript
import { isOnline } from 'js-use-core';

if (isOnline()) {
  console.log('Network connection is normal');
}
```

#### onNetworkChange(callback)

Listen for network status changes.

```javascript
import { onNetworkChange } from 'js-use-core';

const unsubscribe = onNetworkChange((isOnline) => {
  console.log('Network status:', isOnline ? 'Online' : 'Offline');
});
```

### Hardware Information

#### getBatteryInfo()

Get battery information.

```javascript
import { getBatteryInfo } from 'js-use-core';

getBatteryInfo().then(battery => {
  if (battery) {
    console.log('Battery info:', battery);
    // { charging: false, level: 0.8, chargingTime: Infinity, dischargingTime: 3600 }
  }
});
```

#### getMemoryInfo()

Get memory information.

```javascript
import { getMemoryInfo } from 'js-use-core';

const memory = getMemoryInfo();
if (memory) {
  console.log('Memory usage:', memory);
  // { usedJSHeapSize: 10000000, totalJSHeapSize: 20000000, jsHeapSizeLimit: 100000000 }
}
```

#### getGPUInfo()

Get GPU information.

```javascript
import { getGPUInfo } from 'js-use-core';

const gpu = getGPUInfo();
if (gpu) {
  console.log('GPU info:', gpu);
  // { vendor: 'NVIDIA Corporation', renderer: 'GeForce GTX 1080' }
}
```

### Feature Support Detection

#### Image Format Support

```javascript
import { supportsWebP, supportsAVIF } from 'js-use-core';

// Check WebP support
supportsWebP().then(supported => {
  console.log('WebP support:', supported);
});

// Check AVIF support
supportsAVIF().then(supported => {
  console.log('AVIF support:', supported);
});
```

#### Web Technology Support

```javascript
import { 
  supportsServiceWorker,
  supportsWebWorkers,
  supportsWebAssembly,
  supportsWebGL,
  supportsWebGL2
} from 'js-use-core';

console.log('Service Worker:', supportsServiceWorker());
console.log('Web Workers:', supportsWebWorkers());
console.log('WebAssembly:', supportsWebAssembly());
console.log('WebGL:', supportsWebGL());
console.log('WebGL2:', supportsWebGL2());
```

### DeviceDetector Class

Provides object-oriented device detection interface.

```javascript
import { DeviceDetector } from 'js-use-core';

// Create detector instance
const detector = new DeviceDetector({
  featureDetect: true,
  tablet: true
});

// Get device information
const deviceInfo = detector.getDeviceInfo();
console.log(deviceInfo);

// Update options
detector.setOptions({ ua: 'custom user agent' });

// Refresh device information
const updatedInfo = detector.refresh();
```

### getDeviceInfo(options?)

Get complete device information.

```javascript
import { getDeviceInfo } from 'js-use-core';

const deviceInfo = getDeviceInfo();
console.log(deviceInfo);
/*
{
  type: 'mobile',
  os: 'ios',
  browser: 'safari',
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isTouchDevice: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)...',
  screen: {
    width: 375,
    height: 812,
    pixelRatio: 3
  }
}
*/
```

## Usage Examples

### Responsive Design Adaptation

```javascript
import { getDeviceInfo, onOrientationChange } from 'js-use-core';

const deviceInfo = getDeviceInfo();

// Adjust layout based on device type
if (deviceInfo.isMobile) {
  document.body.classList.add('mobile-layout');
} else if (deviceInfo.isTablet) {
  document.body.classList.add('tablet-layout');
} else {
  document.body.classList.add('desktop-layout');
}

// Listen for orientation changes
onOrientationChange((orientation) => {
  document.body.classList.toggle('landscape', orientation === 'landscape');
});
```

### Feature Degradation

```javascript
import { 
  supportsWebP, 
  supportsWebGL, 
  getNetworkSpeed,
  getMemoryInfo 
} from 'js-use-core';

async function initializeApp() {
  // Choose optimal format based on image format support
  const webpSupported = await supportsWebP();
  const imageFormat = webpSupported ? 'webp' : 'jpg';
  
  // Decide whether to enable 3D features based on WebGL support
  const webglSupported = supportsWebGL();
  if (!webglSupported) {
    console.log('WebGL not supported, using 2D rendering');
  }
  
  // Adjust resource loading strategy based on network speed
  const networkSpeed = getNetworkSpeed();
  const isSlowNetwork = networkSpeed.effectiveType === '2g' || networkSpeed.effectiveType === '3g';
  
  if (isSlowNetwork) {
    console.log('Slow network, enabling lightweight mode');
  }
  
  // Adjust caching strategy based on memory
  const memory = getMemoryInfo();
  if (memory && memory.jsHeapSizeLimit < 100 * 1024 * 1024) { // Less than 100MB
    console.log('Limited memory, reducing cache');
  }
}
```

### Device-Specific Features

```javascript
import { 
  isTouchDevice, 
  getBatteryInfo, 
  onNetworkChange,
  isDarkMode 
} from 'js-use-core';

// Touch device specific features
if (isTouchDevice()) {
  // Enable touch gestures
  enableTouchGestures();
}

// Battery status monitoring
getBatteryInfo().then(battery => {
  if (battery && battery.level < 0.2) {
    console.log('Low battery, enabling power save mode');
    enablePowerSaveMode();
  }
});

// Network status monitoring
onNetworkChange((isOnline) => {
  if (!isOnline) {
    showOfflineMessage();
  } else {
    hideOfflineMessage();
  }
});

// Theme adaptation
if (isDarkMode()) {
  document.body.classList.add('dark-theme');
}
```

## Type Definitions

```typescript
interface DeviceInfo {
  type: DeviceType;
  os: OSType;
  browser: BrowserType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  userAgent: string;
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
}

interface MobileDetectOptions {
  ua?: string | { headers: { 'user-agent': string } };
  tablet?: boolean;
  featureDetect?: boolean;
}

enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

enum OSType {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios',
  UNKNOWN = 'unknown'
}

enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  EDGE = 'edge',
  IE = 'ie',
  OPERA = 'opera',
  UNKNOWN = 'unknown'
}
```

## Browser Compatibility

- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+

## Notes

1. Some features (like Battery API) may not be available in some browsers
2. User agent string detection may not be accurate enough, recommend combining with feature detection
3. In Node.js environment, some browser API-dependent features will return default values
4. Network API support varies by browser
5. GPU information retrieval requires WebGL support