# 迁移指南 (Migration Guide)

本文档帮助您从旧版本的 js-use-core 迁移到新的重构版本。

## 概述

新版本采用了统一的架构设计，所有功能模块都基于 `BaseManager` 基类，提供了更好的错误处理、性能监控和扩展性。

## 主要变更

### 1. 架构变更

**旧版本：**
```javascript
import { fullscreen, clipboard, font } from 'js-use-core';

// 直接使用
await fullscreen.request();
await clipboard.writeText('text');
const result = await font.check('Arial');
```

**新版本：**
```javascript
import { FullscreenManager, ClipboardManager, FontManager } from 'js-use-core';

// 需要创建实例并初始化
const fullscreen = new FullscreenManager();
await fullscreen.initialize();
await fullscreen.request();

const clipboard = new ClipboardManager();
await clipboard.initialize();
await clipboard.copyText('text');

const fontManager = new FontManager();
await fontManager.initialize();
const result = await fontManager.check('Arial');
```

### 2. 导入方式变更

#### 全屏功能

**旧版本：**
```javascript
import { fullscreen } from 'js-use-core';
```

**新版本：**
```javascript
// 方式1：使用管理器类
import { FullscreenManager } from 'js-use-core';
const fullscreen = new FullscreenManager();

// 方式2：使用便捷函数
import { requestFullscreen, exitFullscreen } from 'js-use-core';

// 方式3：使用默认实例
import { fullscreen } from 'js-use-core';
```

#### 剪贴板功能

**旧版本：**
```javascript
import { clipboard } from 'js-use-core';
await clipboard.writeText('text');
```

**新版本：**
```javascript
// 方式1：使用管理器类
import { ClipboardManager } from 'js-use-core';
const clipboard = new ClipboardManager();
await clipboard.initialize();
await clipboard.copyText('text');

// 方式2：使用便捷函数
import { copyText, readText } from 'js-use-core';
await copyText('text');
```

#### 字体功能

**旧版本：**
```javascript
import { font } from 'js-use-core';
const result = await font.check('Arial');
```

**新版本：**
```javascript
// 方式1：使用管理器类
import { FontManager } from 'js-use-core';
const fontManager = new FontManager();
await fontManager.initialize();
const result = await fontManager.check('Arial');

// 方式2：使用便捷函数
import { checkFont } from 'js-use-core';
const result = await checkFont('Arial');
```

### 3. API 变更

#### 全屏 API

**旧版本：**
```javascript
// 属性
fullscreen.isEnabled
fullscreen.isFullscreen
fullscreen.element

// 方法
await fullscreen.request(element);
await fullscreen.exit();
await fullscreen.toggle();

// 事件
fullscreen.on('change', handler);
fullscreen.on('error', handler);
```

**新版本：**
```javascript
// 属性（需要先初始化）
fullscreen.isSupported  // 新增：检查浏览器支持
fullscreen.isEnabled
fullscreen.isFullscreen
fullscreen.element
fullscreen.state        // 新增：完整状态信息
fullscreen.performanceData  // 新增：性能数据

// 方法
await fullscreen.initialize();  // 新增：必须初始化
await fullscreen.request(element, options);
await fullscreen.exit();
await fullscreen.toggle(element, options);
fullscreen.destroy();   // 新增：销毁实例

// 事件（更多事件类型）
fullscreen.on('change', handler);
fullscreen.on('error', handler);
fullscreen.on('request', handler);    // 新增
fullscreen.on('exit', handler);       // 新增
fullscreen.on('initialized', handler); // 新增
```

#### 剪贴板 API

**旧版本：**
```javascript
await clipboard.writeText(text);
const text = await clipboard.readText();
```

**新版本：**
```javascript
// 初始化
await clipboard.initialize();

// 文本操作
await clipboard.copyText(text, options);
const text = await clipboard.readText(options);

// HTML 操作（新增）
await clipboard.copyHTML(html, options);
const html = await clipboard.readHTML(options);

// 文件操作（新增）
await clipboard.copyFiles(files, options);
const files = await clipboard.readFiles(options);

// 元素复制（新增）
await clipboard.copyElement(element, options);

// 通用读取（新增）
const data = await clipboard.read(options);
```

#### 字体 API

**旧版本：**
```javascript
const result = await font.check('Arial');
font.addFont(name, url);
font.deleteFont(name);
```

**新版本：**
```javascript
// 初始化
await fontManager.initialize();

// 检查字体（返回格式变更）
const result = await fontManager.check('Arial');
// result: { success: boolean, allFonts: FontCheckResult[], failedFonts?: FontCheckResult[] }

// 添加字体（返回值变更）
const success = fontManager.addFont(name, url, options);

// 批量添加（新增）
const results = await fontManager.addFonts([
  { name: 'Font1', url: '/fonts/font1.woff2' },
  { name: 'Font2', url: '/fonts/font2.woff2' }
]);

// 删除字体
const deleted = fontManager.deleteFont(name);

// 获取加载状态（新增）
const state = fontManager.getFontLoadState(name);
const allStates = fontManager.getAllFontLoadStates();
```

### 4. 配置选项变更

所有管理器现在都支持统一的基础配置：

```javascript
const options = {
  debug: false,           // 调试模式
  timeout: 5000,         // 操作超时时间
  retries: 2,            // 重试次数
  cache: true,           // 启用缓存
  cacheTTL: 30000       // 缓存过期时间
};

// 每个管理器还有特定的配置选项
const fullscreenOptions = {
  ...options,
  enablePerformanceMonitoring: true,
  navigationUI: 'auto',
  allowKeyboardInput: true
};

const clipboardOptions = {
  ...options,
  enablePermissionCheck: true,
  enableFallback: true,
  enableDataValidation: true,
  maxDataSize: 10 * 1024 * 1024
};

const fontOptions = {
  ...options,
  concurrency: 5,
  detectionThreshold: 2
};
```

### 5. 错误处理变更

**旧版本：**
```javascript
try {
  await fullscreen.request();
} catch (error) {
  console.error(error.message);
}
```

**新版本：**
```javascript
try {
  await fullscreen.request();
} catch (error) {
  // 统一的错误格式
  console.error('错误类型:', error.type);
  console.error('错误消息:', error.message);
  console.error('错误上下文:', error.context);
  console.error('是否可恢复:', error.recoverable);
  console.error('解决方案:', error.solution);
}
```

### 6. 事件系统增强

**新版本新增了更多事件：**

```javascript
// 全屏管理器
fullscreen.on('initialized', () => console.log('已初始化'));
fullscreen.on('request', (data) => console.log('开始请求全屏'));
fullscreen.on('exit', (data) => console.log('开始退出全屏'));

// 剪贴板管理器
clipboard.on('copy', (data) => console.log('复制完成'));
clipboard.on('read', (data) => console.log('读取完成'));

// 字体管理器
fontManager.on('fontAdded', (data) => console.log('字体已添加'));
fontManager.on('fontLoaded', (data) => console.log('字体加载完成'));
fontManager.on('fontLoadError', (data) => console.log('字体加载失败'));
```

## 迁移步骤

### 步骤 1：更新导入语句

将所有的导入语句更新为新的管理器类或便捷函数。

### 步骤 2：添加初始化代码

为所有管理器实例添加初始化调用。

### 步骤 3：更新 API 调用

根据新的 API 格式更新所有方法调用。

### 步骤 4：更新错误处理

使用新的统一错误格式更新错误处理代码。

### 步骤 5：添加资源清理

在组件销毁时调用 `destroy()` 方法清理资源。

## 兼容性说明

### 向后兼容

为了帮助迁移，我们提供了一些向后兼容的便捷函数：

```javascript
// 这些函数提供了类似旧版本的使用体验
import { 
  requestFullscreen,  // 类似旧版 fullscreen.request()
  copyText,          // 类似旧版 clipboard.writeText()
  checkFont          // 类似旧版 font.check()
} from 'js-use-core';
```

### 渐进式迁移

您可以逐步迁移，新旧 API 可以在同一个项目中共存：

```javascript
// 继续使用便捷函数（类似旧版本）
import { requestFullscreen, copyText } from 'js-use-core';

// 同时使用新的管理器类获得更多功能
import { FontManager } from 'js-use-core';
const fontManager = new FontManager({ debug: true });
```

## 常见问题

### Q: 为什么需要初始化？

A: 新架构支持更复杂的配置和状态管理，初始化过程确保所有依赖和配置都正确设置。

### Q: 旧版本的代码还能工作吗？

A: 大部分便捷函数提供了向后兼容，但建议迁移到新架构以获得更好的功能和性能。

### Q: 如何处理多个实例？

A: 新架构支持创建多个独立的管理器实例，每个实例都有自己的配置和状态。

### Q: 性能有影响吗？

A: 新架构通过缓存、性能监控和优化算法提供了更好的性能。

## 获取帮助

如果在迁移过程中遇到问题，请：

1. 查看详细的 API 文档
2. 查看示例代码
3. 在 GitHub 上提交 Issue
4. 参考测试用例

## 总结

新版本提供了：

- 更统一的架构设计
- 更好的错误处理
- 更丰富的功能
- 更好的性能
- 更强的扩展性

虽然需要一些迁移工作，但新架构将为您的项目带来更好的开发体验和更稳定的运行表现。