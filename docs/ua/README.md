# User Agent 解析模块

User Agent 解析模块提供了全面的 UA 字符串解析、生成、比对和缓存功能，帮助开发者精确识别浏览器、操作系统、设备等信息。

## 功能特性

- 🔍 **精确解析**: 浏览器名称、版本号、引擎、操作系统、设备信息
- 🏗️ **UA 生成**: 根据规格生成合法的 UA 字符串
- 📊 **版本比较**: 支持 semver 语义化版本比较
- 🚀 **高性能**: 内置缓存机制，同一 UA 只解析一次
- 🔌 **插件化**: 支持自定义解析插件扩展
- 🌐 **跨平台**: 支持 SSR、Node.js、WebWorker 环境

## 快速开始

```javascript
import { UA, parseUserAgent, getCurrentUA } from 'js-use-core';

// 解析当前浏览器 UA
const current = getCurrentUA();
console.log(current.browser.name); // 'Chrome'
console.log(current.browser.version); // '120.0.0.0'

// 解析指定 UA 字符串
const parsed = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...');
console.log(parsed.os.name); // 'iOS'
console.log(parsed.device.type); // 'mobile'

// 版本比较
const isModernChrome = UA.satisfies(current, 'Chrome >= 100');
console.log(isModernChrome); // true/false
```

## API 文档

### UA 类

#### UA.parse(ua?)

解析 UA 字符串，支持缓存。

**参数:**
- `ua` (string, 可选): UA 字符串，默认使用当前环境

**返回值:**
- `Readonly<ParsedUA>`: 只读的解析结果

```javascript
import { UA } from 'js-use-core';

const result = UA.parse('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

console.log(result);
/*
{
  browser: {
    name: 'Chrome',
    version: '120.0.0.0',
    major: 120,
    minor: 0,
    patch: 0,
    channel: 'stable'
  },
  engine: {
    name: 'Blink',
    version: '120.0.0.0'
  },
  os: {
    name: 'Windows',
    version: '10'
  },
  device: {
    type: 'desktop'
  },
  cpu: {
    architecture: 'amd64'
  },
  isBot: false,
  isWebView: false,
  isHeadless: false,
  source: '...'
}
*/
```

#### UA.stringify(spec)

生成 UA 字符串。

**参数:**
- `spec` (UAGenerateSpec): 生成规格

```javascript
import { UA } from 'js-use-core';

const ua = UA.stringify({
  browser: { name: 'Chrome', version: '120.0.0.0' },
  os: { name: 'Windows', version: '11' },
  cpu: { architecture: 'amd64' }
});

console.log(ua);
// 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
```

#### UA.satisfies(ua, range)

检查版本是否满足条件。

**参数:**
- `ua` (ParsedUA | string): UA 对象或字符串
- `range` (string): 版本范围，如 'Chrome >= 100'

```javascript
import { UA } from 'js-use-core';

// 检查是否为 Chrome 100 及以上版本
console.log(UA.satisfies('Chrome/120.0.0.0', 'Chrome >= 100')); // true
console.log(UA.satisfies('Chrome/99.0.0.0', 'Chrome >= 100')); // false

// 支持的操作符：>=, >, <=, <, ===, !==
console.log(UA.satisfies('Firefox/115.0', 'Firefox === 115')); // true
console.log(UA.satisfies('Safari/16.0', 'Safari < 17')); // true
```

#### UA.isModern(ua, options?)

判断是否为现代浏览器。

**参数:**
- `ua` (ParsedUA): UA 解析结果
- `options` (ModernBrowserOptions, 可选): 检查选项

```javascript
import { UA } from 'js-use-core';

const parsed = UA.parse('Chrome/120.0.0.0');

// 基础现代浏览器检查
console.log(UA.isModern(parsed)); // true

// 自定义检查选项
console.log(UA.isModern(parsed, {
  es2020: true,
  webgl2: true,
  webassembly: true,
  serviceWorker: true
})); // true/false
```

#### UA.current

获取当前环境的 UA 解析结果。

```javascript
import { UA } from 'js-use-core';

const current = UA.current;
console.log(current.browser.name);
console.log(current.os.name);
```

### 便捷函数

#### getCurrentUA()

获取当前环境的 UA 解析结果。

```javascript
import { getCurrentUA } from 'js-use-core';

const current = getCurrentUA();
console.log(current.browser.name);
```

#### parseUserAgent(ua)

解析指定的 UA 字符串。

```javascript
import { parseUserAgent } from 'js-use-core';

const result = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...');
console.log(result.os.name); // 'iOS'
```

#### isCompatible(range, ua?)

检查版本兼容性。

```javascript
import { isCompatible } from 'js-use-core';

// 检查当前浏览器是否兼容
console.log(isCompatible('Chrome >= 100')); // true/false

// 检查指定 UA 是否兼容
console.log(isCompatible('Safari >= 15', 'Safari/16.0')); // true
```

## 详细解析能力

### 浏览器识别

支持精确识别主流浏览器及其版本信息：

```javascript
// Chrome 系列
parseUserAgent('Chrome/120.0.0.0'); // Chrome 120
parseUserAgent('Chrome/121.0.0.0 beta'); // Chrome 121 Beta

// Edge 系列
parseUserAgent('Edg/120.0.0.0'); // Edge 120
parseUserAgent('EdgA/120.0.0.0'); // Edge Beta

// Firefox 系列
parseUserAgent('Firefox/120.0'); // Firefox 120
parseUserAgent('Firefox/121.0 nightly'); // Firefox 121 Nightly

// Safari 系列
parseUserAgent('Version/17.0 Safari/605.1.15'); // Safari 17.0

// 移动浏览器
parseUserAgent('SamsungBrowser/23.0'); // Samsung Internet 23
```

### 操作系统识别

精确识别操作系统及版本：

```javascript
// Windows 系列
parseUserAgent('Windows NT 10.0'); // Windows 10
parseUserAgent('Windows NT 10.0; Win64; x64; 22000'); // Windows 11

// macOS 系列
parseUserAgent('Mac OS X 10_15_7'); // macOS 10.15.7
parseUserAgent('Mac OS X 14_0'); // macOS 14.0

// 移动系统
parseUserAgent('iPhone OS 17_0'); // iOS 17.0
parseUserAgent('Android 14'); // Android 14
parseUserAgent('HarmonyOS 4.0'); // HarmonyOS 4.0
```

### 设备类型识别

```javascript
// 桌面设备
parseUserAgent('Windows NT 10.0').device.type; // 'desktop'

// 移动设备
parseUserAgent('iPhone').device; 
// { type: 'mobile', vendor: 'Apple', model: 'iPhone' }

// 平板设备
parseUserAgent('iPad').device;
// { type: 'tablet', vendor: 'Apple', model: 'iPad' }

// 智能电视
parseUserAgent('SmartTV').device.type; // 'tv'

// 可穿戴设备
parseUserAgent('Watch').device.type; // 'wearable'
```

### CPU 架构识别

```javascript
parseUserAgent('Win64; x64').cpu.architecture; // 'amd64'
parseUserAgent('arm64').cpu.architecture; // 'arm64'
parseUserAgent('loongarch64').cpu.architecture; // 'loongarch64'
parseUserAgent('riscv64').cpu.architecture; // 'riscv64'
```

### 特殊环境检测

#### 爬虫检测

```javascript
parseUserAgent('Googlebot/2.1').isBot; // true
parseUserAgent('Bingbot/2.0').isBot; // true
parseUserAgent('baiduspider').isBot; // true
```

#### WebView 检测

```javascript
// 微信内置浏览器
parseUserAgent('MicroMessenger/8.0.42').isWebView; // true

// QQ 内置浏览器
parseUserAgent('QQ/8.9.0').isWebView; // true

// 钉钉内置浏览器
parseUserAgent('DingTalk/7.0.15').isWebView; // true

// Electron 应用
parseUserAgent('Electron/28.1.0').isWebView; // true
```

#### Headless 浏览器检测

```javascript
parseUserAgent('HeadlessChrome/120.0.0.0').isHeadless; // true
parseUserAgent('PhantomJS/2.1.1').isHeadless; // true
parseUserAgent('Puppeteer').isHeadless; // true
```

## 插件系统

支持自定义解析插件扩展功能：

```javascript
import { UA } from 'js-use-core';

// 自定义钉钉解析插件
const dingTalkPlugin = {
  test: (ua) => /DingTalk/i.test(ua),
  parse: (ua) => {
    const match = ua.match(/DingTalk\/([\d.]+)/);
    return {
      browser: {
        name: 'DingTalk',
        version: match?.[1] || '',
        major: parseInt(match?.[1]) || NaN,
        minor: 0,
        patch: 0
      },
      isWebView: true
    };
  }
};

// 注册插件
UA.use(dingTalkPlugin);

// 使用插件解析
const result = UA.parse('DingTalk/7.0.15');
console.log(result.browser.name); // 'DingTalk'
```

## 缓存机制

内置高效缓存机制，提升性能：

```javascript
import { UA } from 'js-use-core';

// 首次解析
const result1 = UA.parse('Chrome/120.0.0.0'); // 执行解析

// 再次解析相同 UA，直接返回缓存结果
const result2 = UA.parse('Chrome/120.0.0.0'); // 从缓存返回

console.log(result1 === result2); // true (同一个对象引用)

// 查看缓存大小
console.log(UA.getCacheSize()); // 1

// 清除缓存
UA.clearCache();
console.log(UA.getCacheSize()); // 0
```

## 版本比较示例

```javascript
import { UA } from 'js-use-core';

// 检查浏览器版本兼容性
const checkCompatibility = (ua) => {
  const checks = [
    UA.satisfies(ua, 'Chrome >= 100'),
    UA.satisfies(ua, 'Firefox >= 100'),
    UA.satisfies(ua, 'Safari >= 15'),
    UA.satisfies(ua, 'Edge >= 100')
  ];
  
  return checks.some(Boolean);
};

console.log(checkCompatibility('Chrome/120.0.0.0')); // true
console.log(checkCompatibility('IE/11.0')); // false
```

## 现代浏览器检测

```javascript
import { UA } from 'js-use-core';

const checkModernFeatures = (ua) => {
  const parsed = UA.parse(ua);
  
  return {
    basic: UA.isModern(parsed),
    es2020: UA.isModern(parsed, { es2020: true }),
    webgl2: UA.isModern(parsed, { webgl2: true }),
    fullFeatures: UA.isModern(parsed, {
      es2020: true,
      webgl2: true,
      webassembly: true,
      serviceWorker: true
    })
  };
};

const features = checkModernFeatures('Chrome/120.0.0.0');
console.log(features);
/*
{
  basic: true,
  es2020: true,
  webgl2: true,
  fullFeatures: true
}
*/
```

## 类型定义

```typescript
interface ParsedUA {
  readonly browser: BrowserInfo;
  readonly engine: EngineInfo;
  readonly os: OSInfo;
  readonly device: DeviceInfo;
  readonly cpu: CPUInfo;
  readonly isBot: boolean;
  readonly isWebView: boolean;
  readonly isHeadless: boolean;
  readonly source: string;
}

interface BrowserInfo {
  readonly name: string;
  readonly version: string;
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly channel?: 'stable' | 'beta' | 'dev' | 'canary' | 'nightly';
}

interface UAParserPlugin {
  test: (ua: string) => boolean;
  parse: (ua: string) => Partial<ParsedUA>;
}
```

## 使用场景

### 功能降级

```javascript
import { UA, getCurrentUA } from 'js-use-core';

const current = getCurrentUA();

// 根据浏览器版本决定功能支持
if (UA.satisfies(current, 'Chrome >= 100')) {
  // 使用现代 API
  enableModernFeatures();
} else {
  // 使用兼容性方案
  enableLegacyFeatures();
}
```

### 统计分析

```javascript
import { parseUserAgent } from 'js-use-core';

const analyzeUserAgent = (ua) => {
  const parsed = parseUserAgent(ua);
  
  return {
    browser: `${parsed.browser.name} ${parsed.browser.major}`,
    os: `${parsed.os.name} ${parsed.os.version}`,
    device: parsed.device.type,
    isBot: parsed.isBot,
    isWebView: parsed.isWebView
  };
};

// 用于数据统计
const stats = analyzeUserAgent(navigator.userAgent);
```

### 条件加载

```javascript
import { UA, getCurrentUA } from 'js-use-core';

const current = getCurrentUA();

// 根据设备类型加载不同资源
if (current.device.type === 'mobile') {
  loadMobileAssets();
} else if (current.device.type === 'tablet') {
  loadTabletAssets();
} else {
  loadDesktopAssets();
}

// 根据浏览器能力加载 polyfill
if (!UA.isModern(current, { es2020: true })) {
  loadES2020Polyfill();
}
```

## 注意事项

1. **隐私模式**: 某些浏览器在隐私模式下可能返回通用 UA
2. **UA 冻结**: 部分浏览器实验性地冻结 UA 字符串
3. **服务端渲染**: Node.js 环境需要手动传入 UA 字符串
4. **缓存管理**: 长期运行的应用建议定期清理缓存
5. **插件顺序**: 插件按注册顺序执行，先匹配的优先

## 浏览器兼容性

- 支持所有现代浏览器和 Node.js 环境
- 无 DOM 依赖，可在 WebWorker 中使用
- 支持 SSR 和同构应用