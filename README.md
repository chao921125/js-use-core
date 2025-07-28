# js-use-core

🚩 支持 JS（浏览器）、Vue（兼容 Vue2）、React、Node.js 多端环境

[![npm version](https://img.shields.io/npm/v/js-use-core.svg)](https://www.npmjs.com/package/js-use-core)
[![npm downloads](https://img.shields.io/npm/dm/js-use-core.svg)](https://www.npmjs.com/package/js-use-core)
[![License](https://img.shields.io/npm/l/js-use-core.svg)](https://github.com/chao921125/js-use-core/blob/main/LICENSE)

一个现代化的 JavaScript 综合工具库，提供全屏、剪贴板、文件处理、字体管理、URL 操作、设备检测和 User Agent 解析等功能。采用统一的架构设计，支持 TypeScript，具有完善的错误处理和性能监控。

## ✨ 特性

- 🏗️ **统一架构** - 基于 BaseManager 的统一管理架构
- 🔧 **TypeScript 支持** - 完整的类型定义和智能提示
- 🛡️ **错误处理** - 统一的错误处理和降级方案
- 📊 **性能监控** - 内置性能监控和缓存机制
- 🔌 **插件系统** - 可扩展的插件架构
- 📱 **跨平台** - 支持浏览器、Node.js 多端环境
- 🚀 **零依赖** - 轻量级，无外部依赖

## 📦 安装

```bash
npm install js-use-core
```

## 🚀 快速开始

```javascript
import { 
  FullscreenManager, 
  ClipboardManager, 
  FontManager,
  UrlManager,
  DeviceDetector,
  UA
} from 'js-use-core';

// 全屏管理
const fullscreen = new FullscreenManager();
await fullscreen.initialize();
await fullscreen.request();

// 剪贴板操作
const clipboard = new ClipboardManager();
await clipboard.initialize();
await clipboard.copyText('Hello World!');

// 字体管理
const fontManager = new FontManager();
await fontManager.initialize();
const result = await fontManager.check('Arial');

// URL 操作
const urlManager = new UrlManager('https://example.com');
urlManager.addQuery({ page: 1, size: 10 });

// 设备检测
const device = new DeviceDetector();
await device.initialize();
console.log(device.isMobile);

// User Agent 解析
const ua = UA.parse(navigator.userAgent);
console.log(ua.browser.name, ua.browser.version);
```

## 📚 功能模块

### [全屏功能](./docs/fullscreen/README.md)
提供跨浏览器兼容的全屏 API，支持元素全屏、状态监听和错误处理。

```javascript
import { FullscreenManager } from 'js-use-core';

const fullscreen = new FullscreenManager({
  enablePerformanceMonitoring: true,
  timeout: 5000
});

await fullscreen.initialize();
await fullscreen.request(document.getElementById('video'));
```

### [剪贴板功能](./docs/clipboard/README.md)
支持文本、HTML、文件的复制和粘贴，具有权限管理和降级处理。

```javascript
import { ClipboardManager } from 'js-use-core';

const clipboard = new ClipboardManager({
  enablePermissionCheck: true,
  enableFallback: true
});

await clipboard.initialize();
await clipboard.copyText('要复制的文本');
const text = await clipboard.readText();
```

### [字体功能](./docs/font/README.md)
字体加载检测、动态字体管理和跨域处理。

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

### [文件处理](./docs/file/README.md)
文件读取、写入、下载和上传功能。

```javascript
import { FileManager } from 'js-use-core';

const fileManager = new FileManager();
await fileManager.initialize();
const content = await fileManager.readAsText(file);
```

### [URL 功能](./docs/url/README.md)
URL 解析、构建和查询参数处理。

```javascript
import { UrlManager } from 'js-use-core';

const url = new UrlManager('https://example.com/api');
url.addQuery({ page: 1, filter: 'active' });
console.log(url.toString());
```

### [设备检测](./docs/device/README.md)
设备类型检测、操作系统识别和浏览器检测。

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

### [User Agent 解析](./docs/ua/README.md)
User Agent 字符串解析、版本比较和生成。

```javascript
import { UA } from 'js-use-core';

const ua = UA.parse(navigator.userAgent);
const isModern = UA.satisfies(ua, 'Chrome >= 100');
console.log(ua.browser.name, ua.browser.version);
```

### [工具函数](./docs/utils/README.md)
DOM 操作、浏览器兼容性和通用工具函数。

```javascript
import { isElement, debounce, throttle } from 'js-use-core';

if (isElement(element)) {
  // DOM 操作
}

const debouncedFn = debounce(callback, 300);
const throttledFn = throttle(callback, 100);
```

## 🏗️ 架构设计

### 核心架构
- **BaseManager**: 所有管理器的基类，提供统一的生命周期管理
- **ErrorHandler**: 统一的错误处理机制
- **EventEmitter**: 轻量级事件系统
- **Logger**: 统一的日志记录功能
- **Cache**: 智能缓存管理

### 设计原则
- **统一性**: 所有模块采用相同的架构模式
- **可扩展性**: 支持插件和自定义扩展
- **健壮性**: 完善的错误处理和降级方案
- **性能**: 内置缓存和性能监控
- **类型安全**: 完整的 TypeScript 支持

## 📖 API 文档

- [核心架构 API](./docs/core/README.md)
- [全屏 API](./docs/fullscreen/API.md)
- [剪贴板 API](./docs/clipboard/API.md)
- [字体 API](./docs/font/API.md)
- [文件 API](./docs/file/API.md)
- [URL API](./docs/url/API.md)
- [设备检测 API](./docs/device/API.md)
- [User Agent API](./docs/ua/API.md)
- [工具函数 API](./docs/utils/API.md)

## 🌐 浏览器兼容性

| 浏览器 | 版本 | 支持 |
|--------|------|------|
| Chrome | 66+ | ✅ |
| Firefox | 63+ | ✅ |
| Safari | 13.1+ | ✅ |
| Edge | 79+ | ✅ |
| IE | 不支持 | ❌ |

## 🔧 配置选项

所有管理器都支持统一的基础配置：

```javascript
const options = {
  debug: false,           // 调试模式
  timeout: 5000,         // 操作超时时间
  retries: 2,            // 重试次数
  cache: true,           // 启用缓存
  cacheTTL: 30000       // 缓存过期时间
};
```

## 📝 迁移指南

### 从 1.x 版本迁移

1. **导入方式变更**：
```javascript
// 旧版本
import { fullscreen } from 'js-use-core';

// 新版本
import { FullscreenManager } from 'js-use-core';
const fullscreen = new FullscreenManager();
await fullscreen.initialize();
```

2. **API 变更**：
- 所有功能现在都需要先初始化
- 统一的错误处理机制
- 新增性能监控和缓存功能

3. **配置选项**：
- 统一的配置选项格式
- 新增更多自定义选项

详细迁移指南请参考 [MIGRATION.md](./MIGRATION.md)

## 🤝 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

### 开发环境设置

```bash
# 克隆项目
git clone https://github.com/chao921125/js-use-core.git

# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build
```

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🌐 语言

- [中文文档](./README.md)
- [English Documentation](./README.en.md)