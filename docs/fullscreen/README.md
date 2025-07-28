# 全屏功能 (Fullscreen)

🚩 支持 JS（浏览器）、Vue（兼容 Vue2）、React、Node.js 多端环境

全屏功能提供了基于统一架构的跨浏览器兼容全屏 API 封装，支持页面和元素的全屏操作，具有完善的错误处理、性能监控和事件管理。

[English](./README.en.md) | 简体中文

## ✨ 特性

- 🏗️ **统一架构** - 基于 BaseManager 的统一管理架构
- 🚀 **跨浏览器兼容** - 自动处理不同浏览器的前缀差异
- 📦 **模块化设计** - 支持按需导入，减少打包体积
- 🔧 **TypeScript 支持** - 完整的类型定义和智能提示
- 🎯 **简单易用** - 简洁的 API 设计，快速上手
- 🛡️ **错误处理** - 统一的错误处理和降级方案
- 📊 **性能监控** - 内置性能监控和缓存机制
- 📱 **移动端支持** - 兼容主流移动浏览器
- 🔌 **事件系统** - 完善的事件管理和监听

## 🚀 功能

- 页面和元素全屏切换
- 全屏状态监听和管理
- 浏览器兼容性自动处理
- 性能监控和缓存
- 统一的错误处理
- 事件驱动的状态管理
- 自动前缀检测和处理

## 📦 安装

```bash
npm install js-use-core
```

## 🔧 使用方法

### ES6 模块导入

```javascript
// 导入全屏管理器
import { FullscreenManager } from 'js-use-core';

// 或者导入便捷函数
import { 
  requestFullscreen, 
  exitFullscreen, 
  toggleFullscreen,
  isFullscreenSupported 
} from 'js-use-core';

// 或者导入默认实例
import { fullscreen } from 'js-use-core';
```

### CommonJS 导入

```javascript
// 导入全屏管理器
const { FullscreenManager } = require('js-use-core');

// 或者导入默认实例
const { fullscreen } = require('js-use-core');
```

### 基本用法

```javascript
import { FullscreenManager } from 'js-use-core';

// 创建全屏管理器实例
const fullscreen = new FullscreenManager({
  enablePerformanceMonitoring: true,
  timeout: 5000,
  debug: false
});

// 初始化管理器
await fullscreen.initialize();

// 检查是否支持全屏
if (fullscreen.isSupported && fullscreen.isEnabled) {
  // 页面全屏
  await fullscreen.request();
  
  // 退出全屏
  await fullscreen.exit();
  
  // 切换全屏状态
  await fullscreen.toggle();
}
```

### 使用便捷函数

```javascript
import { 
  requestFullscreen, 
  exitFullscreen, 
  toggleFullscreen,
  isFullscreenSupported,
  isFullscreenEnabled,
  isFullscreen
} from 'js-use-core';

// 检查支持性
if (isFullscreenSupported() && isFullscreenEnabled()) {
  // 请求全屏
  await requestFullscreen();
  
  // 检查当前状态
  if (isFullscreen()) {
    await exitFullscreen();
  }
  
  // 切换状态
  await toggleFullscreen();
}
```

## 📖 API 参考

### FullscreenManager 类

#### 构造函数

```typescript
constructor(options?: FullscreenOptions)
```

#### 配置选项

```typescript
interface FullscreenOptions extends BaseOptions {
  /** 导航UI显示模式 */
  navigationUI?: 'auto' | 'hide' | 'show';
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean;
  /** 全屏请求超时时间（毫秒） */
  requestTimeout?: number;
  /** 是否启用键盘输入（WebKit） */
  allowKeyboardInput?: boolean;
}
```

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `isSupported` | `boolean` | 检查浏览器是否支持全屏 API |
| `isEnabled` | `boolean` | 检查全屏功能是否启用 |
| `isFullscreen` | `boolean` | 检查当前是否处于全屏状态 |
| `element` | `Element \| null` | 获取当前全屏的元素 |
| `state` | `FullscreenState` | 获取完整的全屏状态信息 |
| `performanceData` | `FullscreenPerformanceMetrics` | 获取性能监控数据 |

#### 核心方法

##### `initialize(): Promise<void>`

初始化全屏管理器。

```javascript
const fullscreen = new FullscreenManager();
await fullscreen.initialize();
```

##### `request(element?, options?): Promise<void>`

请求进入全屏模式。

**参数：**
- `element` (可选): `Element` - 要全屏的元素，默认为 `document.documentElement`
- `options` (可选): `{ navigationUI?: 'auto' | 'hide' | 'show' }` - 全屏选项

**示例：**
```javascript
// 页面全屏
await fullscreen.request();

// 元素全屏
const videoElement = document.getElementById('video');
await fullscreen.request(videoElement);

// 带选项的全屏
await fullscreen.request(videoElement, { navigationUI: 'hide' });
```

##### `exit(): Promise<void>`

退出全屏模式。

```javascript
await fullscreen.exit();
```

##### `toggle(element?, options?): Promise<void>`

切换全屏状态。

**参数：**
- `element` (可选): `Element` - 要全屏的元素（仅在进入全屏时使用）
- `options` (可选): 全屏选项（仅在进入全屏时使用）

```javascript
// 切换页面全屏
await fullscreen.toggle();

// 切换元素全屏
await fullscreen.toggle(document.getElementById('video'));
```

##### `destroy(): void`

销毁管理器实例，清理资源。

```javascript
fullscreen.destroy();
```

#### 事件系统

##### `on(event, listener): void`

添加事件监听器。

**事件类型：**
- `'change'` - 全屏状态变化
- `'error'` - 全屏操作错误
- `'request'` - 全屏请求开始
- `'exit'` - 全屏退出开始
- `'initialized'` - 管理器初始化完成

```javascript
// 监听全屏状态变化
fullscreen.on('change', (data) => {
  console.log('全屏状态:', data.isFullscreen);
  console.log('全屏元素:', data.element);
});

// 监听全屏错误
fullscreen.on('error', (data) => {
  console.error('全屏错误:', data.error);
});

// 监听性能事件
fullscreen.on('request', (data) => {
  console.log('开始请求全屏:', data.element);
});
```

##### `off(event, listener): void`

移除事件监听器。

```javascript
const changeListener = (data) => console.log('状态变化');
fullscreen.on('change', changeListener);
fullscreen.off('change', changeListener);
```

##### `emit(event, data): void`

触发事件（通常用于内部或插件开发）。

### 便捷函数

#### 全屏操作函数

```javascript
// 请求全屏
await requestFullscreen(element?, options?);

// 退出全屏
await exitFullscreen();

// 切换全屏
await toggleFullscreen(element?, options?);
```

#### 状态检查函数

```javascript
// 检查是否支持全屏
const supported = isFullscreenSupported();

// 检查是否启用全屏
const enabled = isFullscreenEnabled();

// 检查是否处于全屏状态
const inFullscreen = isFullscreen();

// 获取当前全屏元素
const element = getFullscreenElement();

// 获取全屏状态信息
const state = getFullscreenState();
```

#### 事件监听函数

```javascript
// 监听全屏状态变化
const unsubscribe = onFullscreenChange((data) => {
  console.log('全屏状态变化:', data);
});

// 监听全屏错误
const unsubscribeError = onFullscreenError((data) => {
  console.error('全屏错误:', data);
});

// 取消监听
unsubscribe();
unsubscribeError();
```

### 类型定义

```typescript
// 全屏状态信息
interface FullscreenState {
  isFullscreen: boolean;
  element: Element | null;
  startTime?: number;
  duration?: number;
}

// 性能监控数据
interface FullscreenPerformanceMetrics {
  enterTime: number;
  exitTime: number;
  duration: number;
  errorCount: number;
  successCount: number;
}

// 事件类型
type FullscreenEventType = 'change' | 'error' | 'request' | 'exit' | 'initialized';
```

# 示例

## Vue.js 中使用

```vue
<template>
  <div>
    <button @click="toggleFullscreen">切换全屏</button>
    <div ref="fullscreenElement">可全屏的内容</div>
  </div>
</template>

<script>
import { fullscreen } from 'js-use-core';

export default {
  mounted() {
    // 监听全屏状态变化
    fullscreen.on('change', () => {
      this.$forceUpdate();
    });
  },
  
  beforeDestroy() {
    // 清理事件监听器
    fullscreen.offAll();
  },
  
  methods: {
    async toggleFullscreen() {
      try {
        await fullscreen.toggle();
      } catch (error) {
        console.error('全屏操作失败:', error);
      }
    },
    
    async toggleElementFullscreen() {
      try {
        await fullscreen.toggle(this.$refs.fullscreenElement);
      } catch (error) {
        console.error('元素全屏失败:', error);
      }
    }
  }
}
</script>
```

## React 中使用

```jsx
import React, { useEffect, useCallback } from 'react';
import { fullscreen } from 'js-use-core';

function FullscreenComponent() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  useEffect(() => {
    // 监听全屏状态变化
    const handleChange = () => {
      setIsFullscreen(fullscreen.isFullscreen);
    };
    
    fullscreen.on('change', handleChange);
    
    return () => {
      fullscreen.off('change', handleChange);
    };
  }, []);
  
  const handleToggle = useCallback(async () => {
    try {
      await fullscreen.toggle();
    } catch (error) {
      console.error('全屏操作失败:', error);
    }
  }, []);
  
  return (
    <div>
      <button onClick={handleToggle}>
        {isFullscreen ? '退出全屏' : '进入全屏'}
      </button>
    </div>
  );
}
```

## 原生 JavaScript 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>全屏功能示例</title>
</head>
<body>
  <button id="fullscreenBtn">切换全屏</button>
  <div id="content">页面内容</div>
  
  <script type="module">
    import { fullscreen } from './dist/index.esm.js';
    
    // 检查支持
    if (!fullscreen.isEnabled) {
      console.warn('浏览器不支持全屏功能');
      document.getElementById('fullscreenBtn').disabled = true;
    }
    
    // 监听全屏状态变化
    fullscreen.on('change', () => {
      const btn = document.getElementById('fullscreenBtn');
      btn.textContent = fullscreen.isFullscreen ? '退出全屏' : '进入全屏';
    });
    
    // 监听错误
    fullscreen.on('error', (event) => {
      console.error('全屏操作失败:', event);
    });
    
    // 绑定按钮事件
    document.getElementById('fullscreenBtn').addEventListener('click', async () => {
      try {
        await fullscreen.toggle();
      } catch (error) {
        console.error('全屏失败:', error);
      }
    });
  </script>
</body>
</html>
```

# 浏览器兼容性

| 浏览器 | 版本 | 支持 |
|--------|------|------|
| Chrome | 15+ | ✅ |
| Firefox | 10+ | ✅ |
| Safari | 5.1+ | ✅ (桌面版) |
| Edge | 12+ | ✅ |
| IE | 11+ | ✅ |

**注意：** Safari 在 iPhone 上不支持全屏功能。

# 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

# 安全

如果您发现安全漏洞，请发送邮件到 security@example.com。

# 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件 
