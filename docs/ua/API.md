# User Agent API 文档

## UA 类

User Agent 解析和处理的核心类，提供静态方法和实例方法来解析、比较和生成 User Agent 字符串。

### 静态方法

#### parse()

解析 User Agent 字符串。

```typescript
static parse(userAgent?: string): ParsedUA
```

**参数**：
- `userAgent` (可选): User Agent 字符串，默认使用 `navigator.userAgent`

**返回值**：

```typescript
interface ParsedUA {
  browser: {
    name: string;
    version: string;
    major: string;
  };
  engine: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type?: string;
    model?: string;
    vendor?: string;
  };
  cpu: {
    architecture?: string;
  };
}
```

**示例**：

```javascript
import { UA } from 'js-use-core';

// 解析当前浏览器的 UA
const ua = UA.parse();
console.log(ua.browser.name);    // 'Chrome'
console.log(ua.browser.version); // '91.0.4472.124'
console.log(ua.os.name);         // 'Windows'

// 解析自定义 UA
const customUA = UA.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
console.log(customUA.device.type); // 'mobile'
console.log(customUA.os.name);      // 'iOS'
```

#### compareVersions()

比较两个版本号。

```typescript
static compareVersions(version1: string, version2: string): number
```

**返回值**：
- `1`: version1 > version2
- `0`: version1 = version2
- `-1`: version1 < version2

**示例**：

```javascript
import { UA } from 'js-use-core';

console.log(UA.compareVersions('91.0.0', '90.0.0')); // 1
console.log(UA.compareVersions('91.0.0', '91.0.0')); // 0
console.log(UA.compareVersions('90.0.0', '91.0.0')); // -1
```

#### satisfies()

检查版本是否满足指定条件。

```typescript
static satisfies(ua: ParsedUA | string, range: string): boolean
```

**参数**：
- `ua`: 解析后的 UA 对象或 UA 字符串
- `range`: 版本范围表达式

**支持的范围表达式**：
- `>= 90`: 大于等于版本 90
- `> 90`: 大于版本 90
- `<= 90`: 小于等于版本 90
- `< 90`: 小于版本 90
- `= 90` 或 `90`: 等于版本 90
- `90 - 95`: 版本范围 90 到 95
- `Chrome >= 90`: 指定浏览器的版本条件

**示例**：

```javascript
import { UA } from 'js-use-core';

const ua = UA.parse();

// 检查浏览器版本
if (UA.satisfies(ua, 'Chrome >= 90')) {
  console.log('Chrome 版本 >= 90');
}

// 检查多个条件
if (UA.satisfies(ua, 'Chrome >= 90 || Firefox >= 88')) {
  console.log('现代浏览器');
}
```

#### isModern()

检查是否为现代浏览器。

```typescript
static isModern(ua: ParsedUA, options?: ModernBrowserOptions): boolean
```

**选项**：

```typescript
interface ModernBrowserOptions {
  chrome?: string;    // Chrome 最低版本，默认 '60'
  firefox?: string;   // Firefox 最低版本，默认 '60'
  safari?: string;    // Safari 最低版本，默认 '12'
  edge?: string;      // Edge 最低版本，默认 '79'
  opera?: string;     // Opera 最低版本，默认 '47'
}
```

**示例**：

```javascript
import { UA } from 'js-use-core';

const ua = UA.parse();

// 使用默认标准
if (UA.isModern(ua)) {
  console.log('现代浏览器');
}

// 自定义标准
if (UA.isModern(ua, { chrome: '80', firefox: '75' })) {
  console.log('满足自定义现代浏览器标准');
}
```

#### stringify()

生成 User Agent 字符串。

```typescript
static stringify(spec: UAGenerateSpec): string
```

**参数**：

```typescript
interface UAGenerateSpec {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device?: {
    type: string;
    model?: string;
  };
}
```

**示例**：

```javascript
import { UA } from 'js-use-core';

const customUA = UA.stringify({
  browser: {
    name: 'Chrome',
    version: '91.0.4472.124'
  },
  os: {
    name: 'Windows',
    version: '10'
  }
});

console.log(customUA);
// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
```

#### getBrowserInfo()

获取浏览器详细信息。

```typescript
static getBrowserInfo(ua?: string): BrowserInfo
```

**返回值**：

```typescript
interface BrowserInfo {
  name: string;
  version: string;
  major: string;
  engine: string;
  engineVersion: string;
  isWebView: boolean;
  isMobile: boolean;
  isBot: boolean;
}
```

#### getOSInfo()

获取操作系统详细信息。

```typescript
static getOSInfo(ua?: string): OSInfo
```

**返回值**：

```typescript
interface OSInfo {
  name: string;
  version: string;
  platform: string;
  architecture?: string;
}
```

#### getDeviceInfo()

获取设备详细信息。

```typescript
static getDeviceInfo(ua?: string): DeviceInfo
```

**返回值**：

```typescript
interface DeviceInfo {
  type?: string;
  model?: string;
  vendor?: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
}
```

## UAManager 类

提供实例化的 User Agent 管理功能。

### 构造函数

```typescript
constructor(options?: UAManagerOptions)
```

**选项**：

```typescript
interface UAManagerOptions extends BaseOptions {
  userAgent?: string;           // 自定义 User Agent
  enableCaching?: boolean;      // 启用缓存
  enableBotDetection?: boolean; // 启用机器人检测
  enableWebViewDetection?: boolean; // 启用 WebView 检测
}
```

### 方法

#### parse()

解析 User Agent（异步方法）。

```typescript
async parse(ua?: string): Promise<Readonly<ParsedUA>>
```

#### parseSync()

同步解析 User Agent。

```typescript
parseSync(ua?: string): Readonly<ParsedUA>
```

#### stringify()

生成 User Agent 字符串。

```typescript
stringify(spec: UAGenerateSpec): string
```

#### satisfies()

检查版本是否满足条件。

```typescript
satisfies(ua: ParsedUA | string, range: string): boolean
```

#### isModern()

检查是否为现代浏览器。

```typescript
isModern(ua: ParsedUA, opts?: ModernBrowserOptions): boolean
```

#### isBot()

检查是否为机器人。

```typescript
isBot(ua?: string): boolean
```

#### isWebView()

检查是否为 WebView。

```typescript
isWebView(ua?: string): boolean
```

#### isMobile()

检查是否为移动设备。

```typescript
isMobile(ua?: string): boolean
```

#### isTablet()

检查是否为平板设备。

```typescript
isTablet(ua?: string): boolean
```

#### isDesktop()

检查是否为桌面设备。

```typescript
isDesktop(ua?: string): boolean
```

#### getBrowserName()

获取浏览器名称。

```typescript
getBrowserName(ua?: string): string
```

#### getBrowserVersion()

获取浏览器版本。

```typescript
getBrowserVersion(ua?: string): string
```

#### getOSName()

获取操作系统名称。

```typescript
getOSName(ua?: string): string
```

#### getOSVersion()

获取操作系统版本。

```typescript
getOSVersion(ua?: string): string
```

#### getDeviceType()

获取设备类型。

```typescript
getDeviceType(ua?: string): string
```

## 便捷函数

### parseUA()

解析 User Agent 的便捷函数。

```typescript
function parseUA(userAgent?: string): ParsedUA
```

### isModernBrowser()

检查是否为现代浏览器。

```typescript
function isModernBrowser(ua?: string | ParsedUA, options?: ModernBrowserOptions): boolean
```

### compareUA()

比较两个 User Agent 的版本。

```typescript
function compareUA(ua1: string | ParsedUA, ua2: string | ParsedUA): number
```

### isBotUA()

检查是否为机器人 User Agent。

```typescript
function isBotUA(userAgent?: string): boolean
```

### isWebViewUA()

检查是否为 WebView User Agent。

```typescript
function isWebViewUA(userAgent?: string): boolean
```

### isMobileUA()

检查是否为移动设备 User Agent。

```typescript
function isMobileUA(userAgent?: string): boolean
```

### getBrowserFromUA()

从 User Agent 获取浏览器信息。

```typescript
function getBrowserFromUA(userAgent?: string): BrowserInfo
```

### getOSFromUA()

从 User Agent 获取操作系统信息。

```typescript
function getOSFromUA(userAgent?: string): OSInfo
```

## 常量和枚举

### BrowserName

```typescript
enum BrowserName {
  CHROME = 'Chrome',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  EDGE = 'Edge',
  IE = 'IE',
  OPERA = 'Opera',
  SAMSUNG = 'Samsung Browser',
  UC = 'UC Browser',
  UNKNOWN = 'Unknown'
}
```

### OSName

```typescript
enum OSName {
  WINDOWS = 'Windows',
  MACOS = 'Mac OS',
  LINUX = 'Linux',
  ANDROID = 'Android',
  IOS = 'iOS',
  UNKNOWN = 'Unknown'
}
```

### DeviceType

```typescript
enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  WEARABLE = 'wearable',
  TV = 'smarttv',
  CONSOLE = 'console',
  EMBEDDED = 'embedded'
}
```

## 使用示例

### 基础解析

```javascript
import { UA } from 'js-use-core';

// 解析当前浏览器
const ua = UA.parse();
console.log(`浏览器: ${ua.browser.name} ${ua.browser.version}`);
console.log(`操作系统: ${ua.os.name} ${ua.os.version}`);
console.log(`设备类型: ${ua.device.type || 'desktop'}`);
```

### 版本比较和兼容性检查

```javascript
import { UA } from 'js-use-core';

const ua = UA.parse();

// 检查浏览器兼容性
const isCompatible = UA.satisfies(ua, 'Chrome >= 60 || Firefox >= 55 || Safari >= 12');

if (isCompatible) {
  // 使用现代 JavaScript 特性
  loadModernFeatures();
} else {
  // 加载 polyfills
  loadPolyfills();
}

// 检查是否为现代浏览器
if (UA.isModern(ua)) {
  enableAdvancedFeatures();
}
```

### 设备适配

```javascript
import { UAManager } from 'js-use-core';

const uaManager = new UAManager();

// 根据设备类型调整界面
if (uaManager.isMobile()) {
  document.body.classList.add('mobile-ui');
} else if (uaManager.isTablet()) {
  document.body.classList.add('tablet-ui');
} else {
  document.body.classList.add('desktop-ui');
}

// 检查是否为 WebView
if (uaManager.isWebView()) {
  // WebView 特殊处理
  adjustForWebView();
}
```

### 机器人检测

```javascript
import { UA } from 'js-use-core';

const ua = UA.parse();

if (UA.isBot(navigator.userAgent)) {
  // 机器人访问，返回简化内容
  renderSimplePage();
} else {
  // 正常用户，加载完整功能
  renderFullPage();
}
```

### 自定义 User Agent 生成

```javascript
import { UA } from 'js-use-core';

// 生成自定义 User Agent
const customUA = UA.stringify({
  browser: {
    name: 'MyBrowser',
    version: '1.0.0'
  },
  os: {
    name: 'MyOS',
    version: '2.0'
  },
  device: {
    type: 'mobile',
    model: 'MyPhone'
  }
});

console.log(customUA);
```

### 浏览器特性检测

```javascript
import { UA, parseUA } from 'js-use-core';

const ua = parseUA();

// 根据浏览器启用不同功能
switch (ua.browser.name) {
  case 'Chrome':
    if (UA.compareVersions(ua.browser.version, '80') >= 0) {
      enableChromeFeatures();
    }
    break;
    
  case 'Firefox':
    if (UA.compareVersions(ua.browser.version, '75') >= 0) {
      enableFirefoxFeatures();
    }
    break;
    
  case 'Safari':
    if (UA.compareVersions(ua.browser.version, '13') >= 0) {
      enableSafariFeatures();
    }
    break;
}
```

## 正则表达式模式

库内置了常用的 User Agent 检测正则表达式：

```javascript
import { UA_PATTERNS } from 'js-use-core';

// 浏览器检测模式
console.log(UA_PATTERNS.CHROME);   // Chrome 检测正则
console.log(UA_PATTERNS.FIREFOX);  // Firefox 检测正则
console.log(UA_PATTERNS.SAFARI);   // Safari 检测正则

// 操作系统检测模式
console.log(UA_PATTERNS.WINDOWS);  // Windows 检测正则
console.log(UA_PATTERNS.MACOS);    // macOS 检测正则
console.log(UA_PATTERNS.ANDROID);  // Android 检测正则

// 设备检测模式
console.log(UA_PATTERNS.MOBILE);   // 移动设备检测正则
console.log(UA_PATTERNS.TABLET);   // 平板设备检测正则
console.log(UA_PATTERNS.BOT);      // 机器人检测正则
```

## 错误处理

```javascript
import { UA } from 'js-use-core';

try {
  const ua = UA.parse('invalid user agent');
  console.log(ua);
} catch (error) {
  console.error('UA 解析失败:', error.message);
  // 使用默认值或降级处理
}

// 安全的版本比较
const result = UA.compareVersions('invalid', '1.0.0');
console.log(result); // 返回 0（相等）而不是抛出错误
```

## 性能优化

```javascript
import { UAManager } from 'js-use-core';

// 启用缓存以提高性能
const uaManager = new UAManager({
  enableCaching: true,
  cache: true,
  cacheTTL: 60000 // 1分钟缓存
});

// 批量解析
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

const results = userAgents.map(ua => uaManager.parseSync(ua));
console.log(results);
```

## 浏览器兼容性

User Agent 解析功能在所有现代浏览器中都可用，包括：

- Chrome 1+
- Firefox 1+
- Safari 1+
- Edge 12+
- IE 6+

## 注意事项

1. User Agent 字符串可能被用户或浏览器修改，不应作为唯一的检测依据
2. 建议结合特性检测使用，提高检测准确性
3. 机器人检测基于常见模式，可能无法检测所有类型的机器人
4. WebView 检测在某些情况下可能不准确
5. 版本比较支持语义化版本号，但对于非标准版本号可能不准确