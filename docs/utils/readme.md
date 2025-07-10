🚩 支持 JS（浏览器）、Vue（兼容 Vue2）、React、Node.js 多端环境

工具函数模块提供了常用的 DOM 操作和浏览器兼容性处理函数，为其他功能模块提供基础支持。

[![npm version](https://img.shields.io/npm/v/js-use-core.svg)](https://www.npmjs.com/package/js-use-core)
[![npm downloads](https://img.shields.io/npm/dm/js-use-core.svg)](https://www.npmjs.com/package/js-use-core)
[![License](https://img.shields.io/npm/l/js-use-core.svg)](https://github.com/your-username/js-use-core/blob/main/LICENSE)

English | 简体中文

# 特性

- 🚀 **跨浏览器兼容** - 自动处理不同浏览器的前缀差异
- 📦 **模块化设计** - 支持按需导入，减少打包体积
- 🔧 **TypeScript 支持** - 完整的类型定义和智能提示
- 🎯 **简单易用** - 简洁的 API 设计，快速上手
- 🛡️ **功能检测** - 完善的浏览器功能检测机制
- 📱 **事件管理** - 统一的事件监听器管理

# 功能

- 浏览器功能检测
- 动态 API 获取
- 事件监听器管理
- 事件发射器
- 前缀处理

# 使用

## 安装

```bash
npm install js-use-core
```

## 使用示例

### ES6 模块导入

```javascript
// 导入工具函数
import { utils } from 'js-use-core';

// 或者单独导入
import utils from 'js-use-core/src/utils';
```

### CommonJS 导入

```javascript
// 导入工具函数
const { utils } = require('js-use-core');

// 或者单独导入
const utils = require('js-use-core/src/utils').default;
```

### 基本用法

```javascript
import { utils } from 'js-use-core';

// 检查浏览器支持
if (utils.isSupported('fullscreen')) {
  // 浏览器支持全屏功能
}

// 获取带前缀的属性名
const fullscreenElement = utils.getPrefixedProperty('fullscreenElement');

// 添加事件监听器
utils.addEventListener(document, 'fullscreenchange', () => {
  console.log('全屏状态变化');
});

// 移除事件监听器
utils.removeEventListener(document, 'fullscreenchange', handler);
```

# API

## 方法

### `isSupported(feature)`

检查浏览器是否支持指定功能。

**参数：**
- `feature`: `string` - 功能名称，如 'fullscreen', 'clipboard'

**返回值：** `boolean`

**示例：**
```javascript
// 检查全屏支持
if (utils.isSupported('fullscreen')) {
  console.log('浏览器支持全屏功能');
}

// 检查剪贴板支持
if (utils.isSupported('clipboard')) {
  console.log('浏览器支持剪贴板功能');
}
```

### `getPrefixedProperty(property)`

获取带浏览器前缀的属性名。

**参数：**
- `property`: `string` - 属性名

**返回值：** `string | undefined`

**示例：**
```javascript
// 获取全屏元素属性名
const fullscreenElement = utils.getPrefixedProperty('fullscreenElement');
// 返回: 'fullscreenElement' 或 'webkitFullscreenElement' 等

// 获取全屏方法名
const requestFullscreen = utils.getPrefixedProperty('requestFullscreen');
// 返回: 'requestFullscreen' 或 'webkitRequestFullscreen' 等
```

### `getPrefixedMethod(element, method)`

获取带浏览器前缀的方法。

**参数：**
- `element`: `Element` - DOM 元素
- `method`: `string` - 方法名

**返回值：** `Function | undefined`

**示例：**
```javascript
const element = document.documentElement;
const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');

if (requestFullscreen) {
  requestFullscreen.call(element);
}
```

### `addEventListener(element, event, handler, options?)`

添加事件监听器，支持带前缀的事件名。

**参数：**
- `element`: `EventTarget` - 事件目标
- `event`: `string` - 事件名
- `handler`: `EventListener` - 事件处理函数
- `options` (可选): `AddEventListenerOptions` - 事件选项

**返回值：** `void`

**示例：**
```javascript
// 监听全屏变化事件
utils.addEventListener(document, 'fullscreenchange', () => {
  console.log('全屏状态变化');
});

// 监听剪贴板变化事件
utils.addEventListener(navigator.clipboard, 'clipboardchange', () => {
  console.log('剪贴板内容变化');
});
```

### `removeEventListener(element, event, handler, options?)`

移除事件监听器，支持带前缀的事件名。

**参数：**
- `element`: `EventTarget` - 事件目标
- `event`: `string` - 事件名
- `handler`: `EventListener` - 事件处理函数
- `options` (可选): `EventListenerOptions` - 事件选项

**返回值：** `void`

**示例：**
```javascript
const handler = () => console.log('全屏变化');
utils.addEventListener(document, 'fullscreenchange', handler);
utils.removeEventListener(document, 'fullscreenchange', handler);
```

### `createEventEmitter()`

创建事件发射器实例。

**返回值：** `EventEmitter`

**示例：**
```javascript
const emitter = utils.createEventEmitter();

// 添加事件监听器
emitter.on('change', (data) => {
  console.log('事件触发:', data);
});

// 触发事件
emitter.emit('change', { status: 'success' });

// 移除事件监听器
emitter.off('change');

// 销毁事件发射器
emitter.destroy();
```

## 类型定义

```typescript
interface EventEmitter {
  on(event: string, listener: Function): void;
  off(event: string, listener?: Function): void;
  emit(event: string, ...args: any[]): void;
  destroy(): void;
}

type SupportedFeature = 'fullscreen' | 'clipboard';
```

# 示例

## 浏览器兼容性检查

```javascript
import { utils } from 'js-use-core';

// 检查各种功能支持
const supportInfo = {
  fullscreen: utils.isSupported('fullscreen'),
  clipboard: utils.isSupported('clipboard')
};

console.log('浏览器支持情况:', supportInfo);

// 根据支持情况初始化功能
if (supportInfo.fullscreen) {
  // 初始化全屏功能
  initFullscreen();
}

if (supportInfo.clipboard) {
  // 初始化剪贴板功能
  initClipboard();
}
```

## 动态获取 API 方法

```javascript
import { utils } from 'js-use-core';

// 获取全屏相关的方法和属性
const fullscreenAPI = {
  requestFullscreen: utils.getPrefixedMethod(document.documentElement, 'requestFullscreen'),
  exitFullscreen: utils.getPrefixedMethod(document, 'exitFullscreen'),
  fullscreenElement: utils.getPrefixedProperty('fullscreenElement'),
  fullscreenEnabled: utils.getPrefixedProperty('fullscreenEnabled')
};

// 使用获取的 API
async function toggleFullscreen() {
  if (fullscreenAPI.requestFullscreen && fullscreenAPI.exitFullscreen) {
    if (document[fullscreenAPI.fullscreenElement]) {
      await fullscreenAPI.exitFullscreen.call(document);
    } else {
      await fullscreenAPI.requestFullscreen.call(document.documentElement);
    }
  }
}
```

## 事件监听器管理

```javascript
import { utils } from 'js-use-core';

class FullscreenManager {
  constructor() {
    this.handlers = new Map();
  }
  
  // 添加全屏变化监听
  addFullscreenListener(handler) {
    const wrappedHandler = (event) => {
      handler({
        isFullscreen: !!document.fullscreenElement,
        element: document.fullscreenElement,
        event
      });
    };
    
    this.handlers.set(handler, wrappedHandler);
    utils.addEventListener(document, 'fullscreenchange', wrappedHandler);
  }
  
  // 移除全屏变化监听
  removeFullscreenListener(handler) {
    const wrappedHandler = this.handlers.get(handler);
    if (wrappedHandler) {
      utils.removeEventListener(document, 'fullscreenchange', wrappedHandler);
      this.handlers.delete(handler);
    }
  }
  
  // 清理所有监听器
  destroy() {
    this.handlers.forEach((wrappedHandler) => {
      utils.removeEventListener(document, 'fullscreenchange', wrappedHandler);
    });
    this.handlers.clear();
  }
}
```

## 自定义事件发射器

```javascript
import { utils } from 'js-use-core';

class ClipboardManager {
  constructor() {
    this.emitter = utils.createEventEmitter();
  }
  
  // 监听剪贴板变化
  onClipboardChange(handler) {
    this.emitter.on('change', handler);
  }
  
  // 移除剪贴板变化监听
  offClipboardChange(handler) {
    this.emitter.off('change', handler);
  }
  
  // 模拟剪贴板变化
  simulateClipboardChange(data) {
    this.emitter.emit('change', data);
  }
  
  // 销毁管理器
  destroy() {
    this.emitter.destroy();
  }
}

// 使用示例
const clipboardManager = new ClipboardManager();

clipboardManager.onClipboardChange((data) => {
  console.log('剪贴板变化:', data);
});

// 模拟变化
clipboardManager.simulateClipboardChange({ text: 'Hello World' });
```

## Vue.js 中使用

```vue
<template>
  <div>
    <button @click="toggleFullscreen">切换全屏</button>
    <div>支持全屏: {{ supportInfo.fullscreen }}</div>
    <div>支持剪贴板: {{ supportInfo.clipboard }}</div>
  </div>
</template>

<script>
import { utils } from 'js-use-core';

export default {
  data() {
    return {
      supportInfo: {
        fullscreen: false,
        clipboard: false
      }
    };
  },
  
  mounted() {
    // 检查浏览器支持
    this.supportInfo = {
      fullscreen: utils.isSupported('fullscreen'),
      clipboard: utils.isSupported('clipboard')
    };
    
    // 添加全屏监听
    if (this.supportInfo.fullscreen) {
      utils.addEventListener(document, 'fullscreenchange', this.handleFullscreenChange);
    }
  },
  
  beforeDestroy() {
    // 清理事件监听器
    if (this.supportInfo.fullscreen) {
      utils.removeEventListener(document, 'fullscreenchange', this.handleFullscreenChange);
    }
  },
  
  methods: {
    async toggleFullscreen() {
      if (!this.supportInfo.fullscreen) return;
      
      const requestFullscreen = utils.getPrefixedMethod(document.documentElement, 'requestFullscreen');
      const exitFullscreen = utils.getPrefixedMethod(document, 'exitFullscreen');
      
      if (document.fullscreenElement) {
        await exitFullscreen.call(document);
      } else {
        await requestFullscreen.call(document.documentElement);
      }
    },
    
    handleFullscreenChange() {
      this.$forceUpdate();
    }
  }
}
</script>
```

## React 中使用

```jsx
import React, { useState, useEffect } from 'react';
import { utils } from 'js-use-core';

function UtilsComponent() {
  const [supportInfo, setSupportInfo] = useState({
    fullscreen: false,
    clipboard: false
  });
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    // 检查浏览器支持
    setSupportInfo({
      fullscreen: utils.isSupported('fullscreen'),
      clipboard: utils.isSupported('clipboard')
    });
    
    // 添加全屏监听
    if (utils.isSupported('fullscreen')) {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      
      utils.addEventListener(document, 'fullscreenchange', handleFullscreenChange);
      
      return () => {
        utils.removeEventListener(document, 'fullscreenchange', handleFullscreenChange);
      };
    }
  }, []);
  
  const toggleFullscreen = async () => {
    if (!supportInfo.fullscreen) return;
    
    const requestFullscreen = utils.getPrefixedMethod(document.documentElement, 'requestFullscreen');
    const exitFullscreen = utils.getPrefixedMethod(document, 'exitFullscreen');
    
    try {
      if (document.fullscreenElement) {
        await exitFullscreen.call(document);
      } else {
        await requestFullscreen.call(document.documentElement);
      }
    } catch (error) {
      console.error('全屏操作失败:', error);
    }
  };
  
  return (
    <div>
      <button onClick={toggleFullscreen} disabled={!supportInfo.fullscreen}>
        {isFullscreen ? '退出全屏' : '进入全屏'}
      </button>
      <div>支持全屏: {supportInfo.fullscreen ? '是' : '否'}</div>
      <div>支持剪贴板: {supportInfo.clipboard ? '是' : '否'}</div>
    </div>
  );
}
```

# 浏览器兼容性

工具函数模块设计为跨浏览器兼容，自动处理不同浏览器的前缀差异：

| 浏览器 | 版本 | 支持 |
|--------|------|------|
| Chrome | 15+ | ✅ |
| Firefox | 10+ | ✅ |
| Safari | 5.1+ | ✅ |
| Edge | 12+ | ✅ |
| IE | 11+ | ✅ |

# 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

# 安全

如果您发现安全漏洞，请发送邮件到 security@example.com。

# 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件 