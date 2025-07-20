# User Agent Parser Module

The User Agent parser module provides comprehensive UA string parsing, generation, comparison, and caching functionality to help developers accurately identify browsers, operating systems, devices, and more.

## Features

- 🔍 **Precise Parsing**: Browser name, version, engine, OS, device information
- 🏗️ **UA Generation**: Generate valid UA strings from specifications
- 📊 **Version Comparison**: Support semver semantic version comparison
- 🚀 **High Performance**: Built-in caching mechanism, parse each UA only once
- 🔌 **Plugin System**: Support custom parser plugins for extension
- 🌐 **Cross-Platform**: Support SSR, Node.js, WebWorker environments

## Quick Start

```javascript
import { UA, parseUserAgent, getCurrentUA } from 'js-use-core';

// Parse current browser UA
const current = getCurrentUA();
console.log(current.browser.name); // 'Chrome'
console.log(current.browser.version); // '120.0.0.0'

// Parse specific UA string
const parsed = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...');
console.log(parsed.os.name); // 'iOS'
console.log(parsed.device.type); // 'mobile'

// Version comparison
const isModernChrome = UA.satisfies(current, 'Chrome >= 100');
console.log(isModernChrome); // true/false
```

## API Documentation

### UA Class

#### UA.parse(ua?)

Parse UA string with caching support.

**Parameters:**
- `ua` (string, optional): UA string, defaults to current environment

**Returns:**
- `Readonly<ParsedUA>`: Read-only parsing result

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

Generate UA string.

**Parameters:**
- `spec` (UAGenerateSpec): Generation specification

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

Check if version satisfies condition.

**Parameters:**
- `ua` (ParsedUA | string): UA object or string
- `range` (string): Version range like 'Chrome >= 100'

```javascript
import { UA } from 'js-use-core';

// Check if Chrome 100 or above
console.log(UA.satisfies('Chrome/120.0.0.0', 'Chrome >= 100')); // true
console.log(UA.satisfies('Chrome/99.0.0.0', 'Chrome >= 100')); // false

// Supported operators: >=, >, <=, <, ===, !==
console.log(UA.satisfies('Firefox/115.0', 'Firefox === 115')); // true
console.log(UA.satisfies('Safari/16.0', 'Safari < 17')); // true
```

#### UA.isModern(ua, options?)

Check if it's a modern browser.

**Parameters:**
- `ua` (ParsedUA): UA parsing result
- `options` (ModernBrowserOptions, optional): Check options

```javascript
import { UA } from 'js-use-core';

const parsed = UA.parse('Chrome/120.0.0.0');

// Basic modern browser check
console.log(UA.isModern(parsed)); // true

// Custom check options
console.log(UA.isModern(parsed, {
  es2020: true,
  webgl2: true,
  webassembly: true,
  serviceWorker: true
})); // true/false
```

## Detailed Parsing Capabilities

### Browser Identification

Precisely identify mainstream browsers and their version information:

```javascript
// Chrome series
parseUserAgent('Chrome/120.0.0.0'); // Chrome 120
parseUserAgent('Chrome/121.0.0.0 beta'); // Chrome 121 Beta

// Edge series
parseUserAgent('Edg/120.0.0.0'); // Edge 120
parseUserAgent('EdgA/120.0.0.0'); // Edge Beta

// Firefox series
parseUserAgent('Firefox/120.0'); // Firefox 120
parseUserAgent('Firefox/121.0 nightly'); // Firefox 121 Nightly

// Safari series
parseUserAgent('Version/17.0 Safari/605.1.15'); // Safari 17.0

// Mobile browsers
parseUserAgent('SamsungBrowser/23.0'); // Samsung Internet 23
```

### Operating System Identification

Precisely identify operating systems and versions:

```javascript
// Windows series
parseUserAgent('Windows NT 10.0'); // Windows 10
parseUserAgent('Windows NT 10.0; Win64; x64; 22000'); // Windows 11

// macOS series
parseUserAgent('Mac OS X 10_15_7'); // macOS 10.15.7
parseUserAgent('Mac OS X 14_0'); // macOS 14.0

// Mobile systems
parseUserAgent('iPhone OS 17_0'); // iOS 17.0
parseUserAgent('Android 14'); // Android 14
parseUserAgent('HarmonyOS 4.0'); // HarmonyOS 4.0
```

### Device Type Identification

```javascript
// Desktop devices
parseUserAgent('Windows NT 10.0').device.type; // 'desktop'

// Mobile devices
parseUserAgent('iPhone').device; 
// { type: 'mobile', vendor: 'Apple', model: 'iPhone' }

// Tablet devices
parseUserAgent('iPad').device;
// { type: 'tablet', vendor: 'Apple', model: 'iPad' }

// Smart TV
parseUserAgent('SmartTV').device.type; // 'tv'

// Wearable devices
parseUserAgent('Watch').device.type; // 'wearable'
```

### Special Environment Detection

#### Bot Detection

```javascript
parseUserAgent('Googlebot/2.1').isBot; // true
parseUserAgent('Bingbot/2.0').isBot; // true
parseUserAgent('baiduspider').isBot; // true
```

#### WebView Detection

```javascript
// WeChat built-in browser
parseUserAgent('MicroMessenger/8.0.42').isWebView; // true

// QQ built-in browser
parseUserAgent('QQ/8.9.0').isWebView; // true

// DingTalk built-in browser
parseUserAgent('DingTalk/7.0.15').isWebView; // true

// Electron app
parseUserAgent('Electron/28.1.0').isWebView; // true
```

#### Headless Browser Detection

```javascript
parseUserAgent('HeadlessChrome/120.0.0.0').isHeadless; // true
parseUserAgent('PhantomJS/2.1.1').isHeadless; // true
parseUserAgent('Puppeteer').isHeadless; // true
```

## Plugin System

Support custom parser plugins for extension:

```javascript
import { UA } from 'js-use-core';

// Custom DingTalk parser plugin
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

// Register plugin
UA.use(dingTalkPlugin);

// Parse with plugin
const result = UA.parse('DingTalk/7.0.15');
console.log(result.browser.name); // 'DingTalk'
```

## Caching Mechanism

Built-in efficient caching mechanism for performance:

```javascript
import { UA } from 'js-use-core';

// First parse
const result1 = UA.parse('Chrome/120.0.0.0'); // Execute parsing

// Parse same UA again, return cached result
const result2 = UA.parse('Chrome/120.0.0.0'); // Return from cache

console.log(result1 === result2); // true (same object reference)

// Check cache size
console.log(UA.getCacheSize()); // 1

// Clear cache
UA.clearCache();
console.log(UA.getCacheSize()); // 0
```

## Type Definitions

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

## Browser Compatibility

- Supports all modern browsers and Node.js environments
- No DOM dependencies, can be used in WebWorkers
- Supports SSR and isomorphic applications