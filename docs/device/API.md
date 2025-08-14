# 设备检测 API 文档

## DeviceDetector 类

### 构造函数

```typescript
constructor(options?: DeviceDetectorOptions)
```

**选项**：

```typescript
interface DeviceDetectorOptions extends BaseOptions {
  enableFeatureDetection?: boolean;    // 启用特性检测
  enableHardwareDetection?: boolean;   // 启用硬件检测
  enableNetworkDetection?: boolean;    // 启用网络检测
  cacheDeviceInfo?: boolean;          // 缓存设备信息
  updateInterval?: number;             // 信息更新间隔
}
```

**示例**：

```javascript
const detector = new DeviceDetector({
  enableFeatureDetection: true,
  enableHardwareDetection: true,
  cacheDeviceInfo: true,
  debug: true
});
```

### 方法

#### getDeviceInfo()

获取完整的设备信息。

```typescript
async getDeviceInfo(): Promise<DeviceInfo>
```

**返回值**：

```typescript
interface DeviceInfo {
  // 基本信息
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  
  // 操作系统
  os: {
    name: string;
    version: string;
    platform: string;
  };
  
  // 浏览器
  browser: {
    name: string;
    version: string;
    engine: string;
    userAgent: string;
  };
  
  // 屏幕信息
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    pixelRatio: number;
    orientation: ScreenOrientation;
    colorDepth: number;
  };
  
  // 视口信息
  viewport: {
    width: number;
    height: number;
  };
  
  // 网络信息
  network?: {
    type: NetworkType;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  
  // 硬件信息
  hardware?: {
    memory?: number;
    cores?: number;
    gpu?: GPUInfo;
    battery?: BatteryInfo;
  };
  
  // 功能支持
  features: {
    webgl: boolean;
    webgl2: boolean;
    webassembly: boolean;
    serviceWorker: boolean;
    webWorkers: boolean;
    indexedDB: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    geolocation: boolean;
    camera: boolean;
    microphone: boolean;
    notifications: boolean;
    vibration: boolean;
  };
}
```

**示例**：

```javascript
const detector = new DeviceDetector();
const deviceInfo = await detector.getDeviceInfo();

console.log('设备类型:', deviceInfo.type);
console.log('操作系统:', deviceInfo.os.name, deviceInfo.os.version);
console.log('浏览器:', deviceInfo.browser.name, deviceInfo.browser.version);
console.log('屏幕尺寸:', deviceInfo.screen.width, 'x', deviceInfo.screen.height);
```

#### refresh()

刷新设备信息。

```typescript
async refresh(): Promise<DeviceInfo>
```

**示例**：

```javascript
const detector = new DeviceDetector();
const updatedInfo = await detector.refresh();
```

#### isMobile()

检查是否为移动设备。

```typescript
isMobile(): boolean
```

#### isTablet()

检查是否为平板设备。

```typescript
isTablet(): boolean
```

#### isDesktop()

检查是否为桌面设备。

```typescript
isDesktop(): boolean
```

#### isTouchDevice()

检查是否为触摸设备。

```typescript
isTouchDevice(): boolean
```

#### getScreenInfo()

获取屏幕信息。

```typescript
getScreenInfo(): ScreenInfo
```

#### getNetworkInfo()

获取网络信息。

```typescript
async getNetworkInfo(): Promise<NetworkInfo | null>
```

#### getBatteryInfo()

获取电池信息。

```typescript
async getBatteryInfo(): Promise<BatteryInfo | null>
```

#### getMemoryInfo()

获取内存信息。

```typescript
getMemoryInfo(): MemoryInfo | null
```

#### getGPUInfo()

获取 GPU 信息。

```typescript
getGPUInfo(): GPUInfo | null
```

#### checkFeatureSupport()

检查功能支持情况。

```typescript
checkFeatureSupport(feature: string): boolean
```

**支持的功能**：
- 'webgl'
- 'webgl2'
- 'webassembly'
- 'serviceWorker'
- 'webWorkers'
- 'indexedDB'
- 'localStorage'
- 'sessionStorage'
- 'geolocation'
- 'camera'
- 'microphone'
- 'notifications'
- 'vibration'

**示例**：

```javascript
const detector = new DeviceDetector();

if (detector.checkFeatureSupport('webgl')) {
  console.log('支持 WebGL');
}

if (detector.checkFeatureSupport('serviceWorker')) {
  console.log('支持 Service Worker');
}
```

### 静态方法

#### detect()

快速检测设备信息（静态方法）。

```typescript
static async detect(options?: DeviceDetectorOptions): Promise<DeviceInfo>
```

**示例**：

```javascript
const deviceInfo = await DeviceDetector.detect({
  enableHardwareDetection: true
});
```

#### isMobileDevice()

静态方法检查是否为移动设备。

```typescript
static isMobileDevice(userAgent?: string): boolean
```

#### isTabletDevice()

静态方法检查是否为平板设备。

```typescript
static isTabletDevice(userAgent?: string): boolean
```

#### parseUserAgent()

解析 User Agent 字符串。

```typescript
static parseUserAgent(userAgent?: string): UAInfo
```

### 事件

#### devicechange

设备信息变化时触发。

```javascript
detector.on('devicechange', (newInfo, oldInfo) => {
  console.log('设备信息已更新');
});
```

#### orientationchange

屏幕方向变化时触发。

```javascript
detector.on('orientationchange', (orientation) => {
  console.log('屏幕方向:', orientation);
});
```

#### networkchange

网络状态变化时触发。

```javascript
detector.on('networkchange', (networkInfo) => {
  console.log('网络状态:', networkInfo);
});
```

#### batterychange

电池状态变化时触发。

```javascript
detector.on('batterychange', (batteryInfo) => {
  console.log('电池状态:', batteryInfo);
});
```

## 便捷函数

### getDeviceInfo()

获取设备信息的便捷函数。

```typescript
function getDeviceInfo(options?: DeviceDetectorOptions): Promise<DeviceInfo>
```

### isMobile()

检查是否为移动设备。

```typescript
function isMobile(userAgent?: string): boolean
```

### isTablet()

检查是否为平板设备。

```typescript
function isTablet(userAgent?: string): boolean
```

### isDesktop()

检查是否为桌面设备。

```typescript
function isDesktop(userAgent?: string): boolean
```

### isTouchDevice()

检查是否为触摸设备。

```typescript
function isTouchDevice(): boolean
```

### getScreenSize()

获取屏幕尺寸。

```typescript
function getScreenSize(): { width: number; height: number; pixelRatio: number }
```

### getViewportSize()

获取视口尺寸。

```typescript
function getViewportSize(): { width: number; height: number }
```

### getScreenOrientation()

获取屏幕方向。

```typescript
function getScreenOrientation(): ScreenOrientation
```

### onOrientationChange()

监听屏幕方向变化。

```typescript
function onOrientationChange(callback: (orientation: ScreenOrientation) => void): () => void
```

### getNetworkType()

获取网络类型。

```typescript
function getNetworkType(): NetworkType
```

### getNetworkSpeed()

获取网络速度信息。

```typescript
function getNetworkSpeed(): NetworkSpeed | null
```

### isOnline()

检查是否在线。

```typescript
function isOnline(): boolean
```

### onNetworkChange()

监听网络状态变化。

```typescript
function onNetworkChange(callback: (isOnline: boolean) => void): () => void
```

### getBatteryInfo()

获取电池信息。

```typescript
function getBatteryInfo(): Promise<BatteryInfo | null>
```

### getMemoryInfo()

获取内存信息。

```typescript
function getMemoryInfo(): MemoryInfo | null
```

### getGPUInfo()

获取 GPU 信息。

```typescript
function getGPUInfo(): GPUInfo | null
```

### 功能支持检测

#### supportsWebGL()

检查 WebGL 支持。

```typescript
function supportsWebGL(): boolean
```

#### supportsWebGL2()

检查 WebGL2 支持。

```typescript
function supportsWebGL2(): boolean
```

#### supportsWebAssembly()

检查 WebAssembly 支持。

```typescript
function supportsWebAssembly(): boolean
```

#### supportsServiceWorker()

检查 Service Worker 支持。

```typescript
function supportsServiceWorker(): boolean
```

#### supportsWebWorkers()

检查 Web Workers 支持。

```typescript
function supportsWebWorkers(): boolean
```

#### supportsWebP()

检查 WebP 图片格式支持。

```typescript
function supportsWebP(): Promise<boolean>
```

#### supportsAVIF()

检查 AVIF 图片格式支持。

```typescript
function supportsAVIF(): Promise<boolean>
```

## 类型定义

### DeviceType

```typescript
enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  UNKNOWN = 'unknown'
}
```

### OSType

```typescript
enum OSType {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios',
  UNKNOWN = 'unknown'
}
```

### BrowserType

```typescript
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

### ScreenOrientation

```typescript
enum ScreenOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
  PORTRAIT_PRIMARY = 'portrait-primary',
  PORTRAIT_SECONDARY = 'portrait-secondary',
  LANDSCAPE_PRIMARY = 'landscape-primary',
  LANDSCAPE_SECONDARY = 'landscape-secondary'
}
```

### NetworkType

```typescript
enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  BLUETOOTH = 'bluetooth',
  UNKNOWN = 'unknown'
}
```

### BatteryInfo

```typescript
interface BatteryInfo {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}
```

### MemoryInfo

```typescript
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
```

### GPUInfo

```typescript
interface GPUInfo {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
}
```

### NetworkSpeed

```typescript
interface NetworkSpeed {
  downlink: number;
  rtt: number;
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  saveData: boolean;
}
```

## 使用示例

### 基础使用

```javascript
import { DeviceDetector } from 'js-use-core';

const detector = new DeviceDetector();
const deviceInfo = await detector.getDeviceInfo();

console.log('设备信息:', deviceInfo);
```

### 响应式设计

```javascript
import { getDeviceInfo, onOrientationChange } from 'js-use-core';

const deviceInfo = await getDeviceInfo();

// 根据设备类型调整样式
if (deviceInfo.isMobile) {
  document.body.classList.add('mobile');
} else if (deviceInfo.isTablet) {
  document.body.classList.add('tablet');
} else {
  document.body.classList.add('desktop');
}

// 监听方向变化
onOrientationChange((orientation) => {
  document.body.classList.toggle('landscape', 
    orientation === 'landscape'
  );
});
```

### 功能降级

```javascript
import { 
  supportsWebGL, 
  supportsWebAssembly, 
  getNetworkSpeed 
} from 'js-use-core';

// 根据功能支持情况选择实现
if (supportsWebGL()) {
  initWebGLRenderer();
} else {
  initCanvasRenderer();
}

// 根据网络速度调整资源加载
const networkSpeed = getNetworkSpeed();
if (networkSpeed && networkSpeed.effectiveType === '2g') {
  loadLowQualityAssets();
} else {
  loadHighQualityAssets();
}
```

### 电池状态监控

```javascript
import { getBatteryInfo } from 'js-use-core';

const battery = await getBatteryInfo();
if (battery) {
  console.log(`电池电量: ${Math.round(battery.level * 100)}%`);
  console.log(`充电状态: ${battery.charging ? '充电中' : '未充电'}`);
  
  if (battery.level < 0.2) {
    enablePowerSaveMode();
  }
}
```

## 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 基础检测 | 51+ | 54+ | 10+ | 15+ |
| 网络信息 | 61+ | ❌ | ❌ | 79+ |
| 电池 API | 38+ | ❌ | ❌ | ❌ |
| 内存信息 | 7+ | ❌ | ❌ | 79+ |
| GPU 信息 | 9+ | 4+ | 5.1+ | 12+ |

## 注意事项

1. 某些 API（如电池 API）在部分浏览器中已被弃用或限制
2. 网络信息 API 支持有限，主要在 Chrome 中可用
3. 用户代理检测可能不够准确，建议结合特性检测
4. 在隐私模式下，某些信息可能无法获取
5. 移动设备的硬件信息获取可能受到限制