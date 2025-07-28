# js-use-core

[中文](./README.md) | English

A modern JavaScript comprehensive utility library providing fullscreen, clipboard, file processing, font management, URL operations, device detection, and User Agent parsing capabilities. Built with unified architecture design, TypeScript support, comprehensive error handling, and performance monitoring.

## ✨ Features

- 🏗️ **Unified Architecture** - Based on BaseManager unified management architecture
- 🔧 **TypeScript Support** - Complete type definitions and intelligent hints
- 🛡️ **Error Handling** - Unified error handling and fallback solutions
- 📊 **Performance Monitoring** - Built-in performance monitoring and caching mechanisms
- 🔌 **Plugin System** - Extensible plugin architecture
- 📱 **Cross-platform** - Support for browser and Node.js environments
- 🚀 **Zero Dependencies** - Lightweight with no external dependencies

## 📦 Installation

```bash
npm install js-use-core
```

## 🚀 Quick Start

```javascript
import { 
  FullscreenManager, 
  ClipboardManager, 
  FontManager,
  UrlManager,
  DeviceDetector,
  UA
} from 'js-use-core';

// Fullscreen management
const fullscreen = new FullscreenManager();
await fullscreen.initialize();
await fullscreen.request();

// Clipboard operations
const clipboard = new ClipboardManager();
await clipboard.initialize();
await clipboard.copyText('Hello World!');

// Font management
const fontManager = new FontManager();
await fontManager.initialize();
const result = await fontManager.check('Arial');

// URL operations
const urlManager = new UrlManager('https://example.com');
urlManager.addQuery({ page: 1, size: 10 });

// Device detection
const device = new DeviceDetector();
await device.initialize();
console.log(device.isMobile);

// User Agent parsing
const ua = UA.parse(navigator.userAgent);
console.log(ua.browser.name, ua.browser.version);
```

## 📚 Modules

### [Fullscreen](./docs/fullscreen/README.en.md)
Cross-browser compatible fullscreen API with element fullscreen, state monitoring, and error handling.

```javascript
import { FullscreenManager } from 'js-use-core';

const fullscreen = new FullscreenManager({
  enablePerformanceMonitoring: true,
  timeout: 5000
});

await fullscreen.initialize();
await fullscreen.request(document.getElementById('video'));
```

### [Clipboard](./docs/clipboard/README.en.md)
Support for text, HTML, and file copy/paste with permission management and fallback handling.

```javascript
import { ClipboardManager } from 'js-use-core';

const clipboard = new ClipboardManager({
  enablePermissionCheck: true,
  enableFallback: true
});

await clipboard.initialize();
await clipboard.copyText('Text to copy');
const text = await clipboard.readText();
```

### [Font](./docs/font/README.en.md)
Font loading detection, dynamic font management, and cross-origin handling.

```javascript
import { FontManager } from 'js-use-core';

const fontManager = new FontManager({
  timeout: 3000,
  enableCache: true
});

await fontManager.initialize();
fontManager.addFont('CustomFont', '/fonts/custom.woff2');
const result = await fontManager.check(['Arial', 'CustomFont']);
```

### [File](./docs/file/README.en.md)
File read, write, download, and upload functionality.

```javascript
import { FileManager } from 'js-use-core';

const fileManager = new FileManager();
await fileManager.initialize();
const content = await fileManager.readAsText(file);
```

### [URL](./docs/url/README.en.md)
URL parsing, building, and query parameter handling.

```javascript
import { UrlManager } from 'js-use-core';

const url = new UrlManager('https://example.com/api');
url.addQuery({ page: 1, filter: 'active' });
console.log(url.toString());
```

### [Device](./docs/device/README.en.md)
Device type detection, operating system identification, and browser detection.

```javascript
import { DeviceDetector } from 'js-use-core';

const device = new DeviceDetector();
await device.initialize();
console.log({
  isMobile: device.isMobile,
  isTablet: device.isTablet,
  os: device.os,
  browser: device.browser
});
```

### [User Agent](./docs/ua/README.en.md)
User Agent string parsing, version comparison, and generation.

```javascript
import { UA } from 'js-use-core';

const ua = UA.parse(navigator.userAgent);
const isModern = UA.satisfies(ua, 'Chrome >= 100');
console.log(ua.browser.name, ua.browser.version);
```

### [Utils](./docs/utils/README.en.md)
DOM operations, browser compatibility, and common utility functions.

```javascript
import { isElement, debounce, throttle } from 'js-use-core';

if (isElement(element)) {
  // DOM operations
}

const debouncedFn = debounce(callback, 300);
const throttledFn = throttle(callback, 100);
```

## 🏗️ Architecture Design

### Core Architecture
- **BaseManager**: Base class for all managers, providing unified lifecycle management
- **ErrorHandler**: Unified error handling mechanism
- **EventEmitter**: Lightweight event system
- **Logger**: Unified logging functionality
- **Cache**: Intelligent cache management

### Design Principles
- **Consistency**: All modules adopt the same architectural pattern
- **Extensibility**: Support for plugins and custom extensions
- **Robustness**: Comprehensive error handling and fallback solutions
- **Performance**: Built-in caching and performance monitoring
- **Type Safety**: Complete TypeScript support

## 📖 API Documentation

- [Core Architecture API](./docs/core/README.en.md)
- [Fullscreen API](./docs/fullscreen/API.en.md)
- [Clipboard API](./docs/clipboard/API.en.md)
- [Font API](./docs/font/API.en.md)
- [File API](./docs/file/API.en.md)
- [URL API](./docs/url/API.en.md)
- [Device Detection API](./docs/device/API.en.md)
- [User Agent API](./docs/ua/API.en.md)
- [Utils API](./docs/utils/API.en.md)

## 🌐 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 66+ | ✅ |
| Firefox | 63+ | ✅ |
| Safari | 13.1+ | ✅ |
| Edge | 79+ | ✅ |
| IE | Not supported | ❌ |

## 🔧 Configuration Options

All managers support unified basic configuration:

```javascript
const options = {
  debug: false,           // Debug mode
  timeout: 5000,         // Operation timeout
  retries: 2,            // Retry count
  cache: true,           // Enable caching
  cacheTTL: 30000       // Cache expiration time
};
```

## 📝 Migration Guide

### Migrating from 1.x

1. **Import Changes**:
```javascript
// Old version
import { fullscreen } from 'js-use-core';

// New version
import { FullscreenManager } from 'js-use-core';
const fullscreen = new FullscreenManager();
await fullscreen.initialize();
```

2. **API Changes**:
- All features now require initialization
- Unified error handling mechanism
- New performance monitoring and caching features

3. **Configuration Options**:
- Unified configuration option format
- More customization options added

For detailed migration guide, see [MIGRATION.en.md](./MIGRATION.en.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.en.md) for details.

### Development Setup

```bash
# Clone the project
git clone https://github.com/chao921125/js-use-core.git

# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details 