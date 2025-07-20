# 设备检测功能模块

设备检测功能模块提供了全面的设备类型检测、操作系统识别、浏览器检测和相关功能，帮助开发者更好地适配不同设备和环境。

## 功能特性

- 📱 **设备类型检测**: 检测移动设备、平板、桌面设备
- 🖥️ **操作系统识别**: 识别 Windows、macOS、Linux、Android、iOS
- 🌐 **浏览器检测**: 检测 Chrome、Firefox、Safari、Edge 等浏览器
- 👆 **触摸设备检测**: 检测是否支持触摸操作
- 📺 **屏幕信息**: 获取屏幕尺寸、分辨率、方向等信息
- 🌐 **网络状态**: 检测网络连接类型和状态
- 🔋 **硬件信息**: 获取电池、内存、GPU 等硬件信息
- 🎨 **功能支持检测**: 检测 WebGL、WebAssembly、Service Worker 等功能支持

## 快速开始

```javascript
import { device, getDeviceInfo, isMobile, isTablet, isDesktop } from 'js-use-core';

// 获取完整设备信息
const deviceInfo = getDeviceInfo();
console.log(deviceInfo);

// 检测设备类型
console.log('是否为移动设备:', isMobile());
console.log('是否为平板设备:', isTablet());
console.log('是否为桌面设备:', isDesktop());
```

## API 文档

### 基础设备检测

#### isMobile(options?)

检测是否为移动设备。

**参数:**
- `options` (MobileDetectOptions, 可选): 检测选项

**返回值:**
- `boolean`: 是否为移动设备

```javascript
import { isMobile } from 'js-use-core';

// 基础检测
console.log(isMobile()); // true/false

// 自定义用户代理
console.log(isMobile({ 
  ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' 
}));

// 启用特性检测
console.log(isMobile({ 
  featureDetect: true,
  tablet: true 
}));
```

#### isTablet(options?)

检测是否为平板设备。

```javascript
import { isTablet } from 'js-use-core';

console.log(isTablet()); // true/false
console.log(isTablet({ ua: 'iPad User Agent' }));
```

#### isDesktop(options?)

检测是否为桌面设备。

```javascript
import { isDesktop } from 'js-use-core';

console.log(isDesktop()); // true/false
```

#### getDeviceType(options?)

获取设备类型。

```javascript
import { getDeviceType, DeviceType } from 'js-use-core';

const type = getDeviceType();
console.log(type); // 'mobile' | 'tablet' | 'desktop'

// 使用枚举
if (type === DeviceType.MOBILE) {
  console.log('这是移动设备');
}
```

### 操作系统和浏览器检测

#### detectOS(ua?)

检测操作系统类型。

```javascript
import { detectOS, OSType } from 'js-use-core';

const os = detectOS();
console.log(os); // 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown'

// 自定义用户代理
const customOS = detectOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
```

#### detectBrowser(ua?)

检测浏览器类型。

```javascript
import { detectBrowser, BrowserType } from 'js-use-core';

const browser = detectBrowser();
console.log(browser); // 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'opera' | 'unknown'
```

### 设备功能检测

#### isTouchDevice()

检测是否为触摸设备。

```javascript
import { isTouchDevice } from 'js-use-core';

if (isTouchDevice()) {
  console.log('支持触摸操作');
}
```

#### isRetinaDisplay()

检测是否为高分辨率屏幕。

```javascript
import { isRetinaDisplay } from 'js-use-core';

if (isRetinaDisplay()) {
  console.log('高分辨率屏幕');
}
```

#### isDarkMode()

检测是否为暗色主题。

```javascript
import { isDarkMode } from 'js-use-core';

if (isDarkMode()) {
  console.log('用户偏好暗色主题');
}
```

### 屏幕和视口信息

#### getScreenSize()

获取屏幕尺寸信息。

```javascript
import { getScreenSize } from 'js-use-core';

const screen = getScreenSize();
console.log(screen);
// { width: 1920, height: 1080, pixelRatio: 2 }
```

#### getViewportSize()

获取视口尺寸。

```javascript
import { getViewportSize } from 'js-use-core';

const viewport = getViewportSize();
console.log(viewport);
// { width: 1200, height: 800 }
```

#### getScreenOrientation()

获取屏幕方向。

```javascript
import { getScreenOrientation, ScreenOrientation } from 'js-use-core';

const orientation = getScreenOrientation();
console.log(orientation); // 'portrait' | 'landscape'
```

#### onOrientationChange(callback)

监听屏幕方向变化。

```javascript
import { onOrientationChange } from 'js-use-core';

const unsubscribe = onOrientationChange((orientation) => {
  console.log('屏幕方向变化:', orientation);
});

// 取消监听
unsubscribe();
```

### 网络状态检测

#### getNetworkType()

获取网络连接类型。

```javascript
import { getNetworkType, NetworkType } from 'js-use-core';

const networkType = getNetworkType();
console.log(networkType); // 'wifi' | 'cellular' | 'ethernet' | 'unknown'
```

#### getNetworkSpeed()

获取网络连接速度。

```javascript
import { getNetworkSpeed } from 'js-use-core';

const speed = getNetworkSpeed();
console.log(speed);
// { downlink: 10, rtt: 50, effectiveType: '4g' }
```

#### isOnline()

检测是否在线。

```javascript
import { isOnline } from 'js-use-core';

if (isOnline()) {
  console.log('网络连接正常');
}
```

#### onNetworkChange(callback)

监听网络状态变化。

```javascript
import { onNetworkChange } from 'js-use-core';

const unsubscribe = onNetworkChange((isOnline) => {
  console.log('网络状态:', isOnline ? '在线' : '离线');
});
```

### 硬件信息

#### getBatteryInfo()

获取电池信息。

```javascript
import { getBatteryInfo } from 'js-use-core';

getBatteryInfo().then(battery => {
  if (battery) {
    console.log('电池信息:', battery);
    // { charging: false, level: 0.8, chargingTime: Infinity, dischargingTime: 3600 }
  }
});
```

#### getMemoryInfo()

获取内存信息。

```javascript
import { getMemoryInfo } from 'js-use-core';

const memory = getMemoryInfo();
if (memory) {
  console.log('内存使用:', memory);
  // { usedJSHeapSize: 10000000, totalJSHeapSize: 20000000, jsHeapSizeLimit: 100000000 }
}
```

#### getGPUInfo()

获取 GPU 信息。

```javascript
import { getGPUInfo } from 'js-use-core';

const gpu = getGPUInfo();
if (gpu) {
  console.log('GPU 信息:', gpu);
  // { vendor: 'NVIDIA Corporation', renderer: 'GeForce GTX 1080' }
}
```

### 功能支持检测

#### 图片格式支持

```javascript
import { supportsWebP, supportsAVIF } from 'js-use-core';

// 检测 WebP 支持
supportsWebP().then(supported => {
  console.log('WebP 支持:', supported);
});

// 检测 AVIF 支持
supportsAVIF().then(supported => {
  console.log('AVIF 支持:', supported);
});
```

#### Web 技术支持

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

### DeviceDetector 类

提供面向对象的设备检测接口。

```javascript
import { DeviceDetector } from 'js-use-core';

// 创建检测器实例
const detector = new DeviceDetector({
  featureDetect: true,
  tablet: true
});

// 获取设备信息
const deviceInfo = detector.getDeviceInfo();
console.log(deviceInfo);

// 更新选项
detector.setOptions({ ua: 'custom user agent' });

// 刷新设备信息
const updatedInfo = detector.refresh();
```

### getDeviceInfo(options?)

获取完整的设备信息。

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

## 使用示例

### 响应式设计适配

```javascript
import { getDeviceInfo, onOrientationChange } from 'js-use-core';

const deviceInfo = getDeviceInfo();

// 根据设备类型调整布局
if (deviceInfo.isMobile) {
  document.body.classList.add('mobile-layout');
} else if (deviceInfo.isTablet) {
  document.body.classList.add('tablet-layout');
} else {
  document.body.classList.add('desktop-layout');
}

// 监听方向变化
onOrientationChange((orientation) => {
  document.body.classList.toggle('landscape', orientation === 'landscape');
});
```

### 功能降级处理

```javascript
import { 
  supportsWebP, 
  supportsWebGL, 
  getNetworkSpeed,
  getMemoryInfo 
} from 'js-use-core';

async function initializeApp() {
  // 根据图片格式支持选择最佳格式
  const webpSupported = await supportsWebP();
  const imageFormat = webpSupported ? 'webp' : 'jpg';
  
  // 根据 WebGL 支持决定是否启用 3D 功能
  const webglSupported = supportsWebGL();
  if (!webglSupported) {
    console.log('WebGL 不支持，使用 2D 渲染');
  }
  
  // 根据网络速度调整资源加载策略
  const networkSpeed = getNetworkSpeed();
  const isSlowNetwork = networkSpeed.effectiveType === '2g' || networkSpeed.effectiveType === '3g';
  
  if (isSlowNetwork) {
    console.log('网络较慢，启用轻量模式');
  }
  
  // 根据内存情况调整缓存策略
  const memory = getMemoryInfo();
  if (memory && memory.jsHeapSizeLimit < 100 * 1024 * 1024) { // 小于 100MB
    console.log('内存有限，减少缓存');
  }
}
```

### 设备特定功能

```javascript
import { 
  isTouchDevice, 
  getBatteryInfo, 
  onNetworkChange,
  isDarkMode 
} from 'js-use-core';

// 触摸设备特定功能
if (isTouchDevice()) {
  // 启用触摸手势
  enableTouchGestures();
}

// 电池状态监控
getBatteryInfo().then(battery => {
  if (battery && battery.level < 0.2) {
    console.log('电量低，启用省电模式');
    enablePowerSaveMode();
  }
});

// 网络状态监控
onNetworkChange((isOnline) => {
  if (!isOnline) {
    showOfflineMessage();
  } else {
    hideOfflineMessage();
  }
});

// 主题适配
if (isDarkMode()) {
  document.body.classList.add('dark-theme');
}
```

## 类型定义

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

## 浏览器兼容性

- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+

## 注意事项

1. 某些功能（如电池 API）可能在部分浏览器中不可用
2. 用户代理字符串检测可能不够准确，建议结合特性检测使用
3. 在 Node.js 环境中，部分依赖浏览器 API 的功能将返回默认值
4. 网络 API 支持情况因浏览器而异
5. GPU 信息获取需要 WebGL 支持