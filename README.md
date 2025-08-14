# js-use-core

🚩 支持 JS（浏览器）、Vue（兼容 Vue2）、React、Node.js 多端环境

[![npm version](https://img.shields.io/npm/v/js-use-core.svg)](https://www.npmjs.com/package/js-use-core)
[![npm downloads](https://img.shields.io/npm/dm/js-use-core.svg)](https://www.npmjs.com/package/js-use-core)
[![License](https://img.shields.io/npm/l/js-use-core.svg)](https://github.com/chao921125/js-use-core/blob/main/LICENSE)

一个现代化的 JavaScript 综合工具库，提供全屏、剪贴板、文件处理、字体管理、URL 操作、设备检测和 User Agent 解析等功能。采用统一的架构设计，支持 TypeScript，具有完善的错误处理和性能监控。

## ✨ 特性

- 🎉 **自动初始化** - 开箱即用，无需手动调用 `initialize()`
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

### 🎉 自动初始化 - 开箱即用！

从 v1.3.0 开始，所有管理器都支持自动初始化，无需手动调用 `initialize()` 方法：

```javascript
import { 
  FullscreenManager, 
  ClipboardManager, 
  FontManager,
  UrlManager,
  DeviceDetector,
  UA
} from 'js-use-core';

// 全屏管理 - 直接使用，自动初始化
const fullscreen = new FullscreenManager();
await fullscreen.request(); // 自动处理初始化

// 剪贴板操作 - 直接使用，自动初始化
const clipboard = new ClipboardManager();
await clipboard.copyText('Hello World!'); // 自动处理初始化

// 字体管理 - 直接使用，自动初始化
const fontManager = new FontManager();
const result = await fontManager.check('Arial'); // 自动处理初始化

// URL 操作 - 同步操作，立即可用
const urlManager = new UrlManager('https://example.com');
urlManager.addQuery({ page: 1, size: 10 });

// 设备检测 - 直接使用，自动初始化
const device = new DeviceDetector();
const info = await device.getDeviceInfo(); // 自动处理初始化

// User Agent 解析 - 静态方法，无需初始化
const ua = UA.parse(navigator.userAgent);
console.log(ua.browser.name, ua.browser.version);
```

### 等待初始化完成（可选）

如果需要确保初始化完成，可以使用 `ready()` 方法：

```javascript
const clipboard = new ClipboardManager();
await clipboard.ready(); // 等待初始化完成
// 现在可以安全使用所有功能
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

// 直接使用，自动初始化
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

// 直接使用，自动初始化
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

// 直接使用，自动初始化
await fontManager.addFont('CustomFont', '/fonts/custom.woff2');
const result = await fontManager.check(['Arial', 'CustomFont']);
```

### [文件处理](./docs/file/README.md)
文件读取、写入、下载和上传功能。

```javascript
import { FileManager } from 'js-use-core';

const fileManager = new FileManager();
// 直接使用，自动初始化
const content = await fileManager.readFile(file);
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
// 直接使用，自动初始化
const info = await device.getDeviceInfo();
console.log({
  isMobile: info.isMobile,
  isTablet: info.isTablet,
  os: info.os,
  browser: info.browser
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

## 📖 文档

### 📚 指南
- [快速开始](./docs/GETTING_STARTED.md) - 快速上手指南
- [架构设计](./docs/ARCHITECTURE.md) - 详细的架构说明
- [自动初始化](./docs/AUTO_INITIALIZATION.md) - 自动初始化功能详解
- [最佳实践](./docs/BEST_PRACTICES.md) - 使用最佳实践
- [故障排除](./docs/TROUBLESHOOTING.md) - 常见问题解决方案
- [迁移指南](./MIGRATION_GUIDE.md) - 版本迁移指南

### 📋 API 参考
- [完整 API 文档](./docs/API_REFERENCE.md) - 所有 API 的详细说明
- [剪贴板 API](./docs/clipboard/API.md) - 剪贴板功能 API
- [全屏 API](./docs/fullscreen/API.md) - 全屏功能 API
- [字体 API](./docs/font/API.md) - 字体管理 API
- [文件 API](./docs/file/API.md) - 文件处理 API
- [设备检测 API](./docs/device/API.md) - 设备检测 API
- [URL API](./docs/url/API.md) - URL 管理 API
- [User Agent API](./docs/ua/API.md) - UA 解析 API
- [工具函数 API](./docs/utils/API.md) - 工具函数 API

### 🎯 示例
- [综合使用示例](./examples/comprehensive-usage.html) - 完整功能演示
- [React 示例](./examples/react-example.jsx) - React 集成示例
- [Vue 示例](./examples/vue-example.vue) - Vue 集成示例
- [自动初始化演示](./examples/auto-initialization-demo.html) - 自动初始化功能演示

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

### 🎉 v1.3.0 自动初始化更新

**好消息！** 从 v1.3.0 开始，所有管理器都支持自动初始化，使用更加简单：

```javascript
// v1.3.0+ 推荐方式 - 自动初始化
const clipboard = new ClipboardManager();
await clipboard.copyText('hello'); // 直接使用，自动处理初始化

// 旧方式仍然支持（向后兼容）
const clipboard = new ClipboardManager();
await clipboard.initialize(); // 可选，但不是必需的
await clipboard.copyText('hello');
```

### 从 1.x 版本迁移

1. **导入方式变更**：
```javascript
// 旧版本
import { fullscreen } from 'js-use-core';

// 新版本 - 自动初始化
import { FullscreenManager } from 'js-use-core';
const fullscreen = new FullscreenManager();
await fullscreen.request(); // 直接使用
```

2. **API 变更**：
- ✅ **自动初始化** - 无需手动调用 `initialize()`
- ✅ **向后兼容** - 现有代码无需修改
- ✅ **统一错误处理** - 更好的错误处理机制
- ✅ **性能优化** - 内置性能监控和缓存

3. **新增功能**：
- `ready()` 方法 - 等待初始化完成
- 更详细的状态信息
- 更好的错误提示

详细迁移指南请参考 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

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