🚩 支持 JS（浏览器）、Vue（兼容 Vue2）、React、Node.js 多端环境

全屏功能提供了跨浏览器兼容的全屏 API 封装，支持页面和元素的全屏操作，自动处理不同浏览器的前缀差异。

[English](./readme.en.md) | 简体中文

# 特性

- 🚀 **跨浏览器兼容** - 自动处理不同浏览器的前缀差异
- 📦 **模块化设计** - 支持按需导入，减少打包体积
- 🔧 **TypeScript 支持** - 完整的类型定义和智能提示
- 🎯 **简单易用** - 简洁的 API 设计，快速上手
- 🛡️ **错误处理** - 完善的错误处理和降级方案
- 📱 **移动端支持** - 兼容主流移动浏览器

# 功能

- 页面和元素全屏切换
- 全屏状态监听
- 浏览器兼容性处理
- 事件管理
- 自动前缀处理

# 使用

## 安装

```bash
npm install js-use-core
```

## 使用示例

### ES6 模块导入

```javascript
// 导入全屏功能
import { fullscreen } from 'js-use-core';

// 或者单独导入
import fullscreen from 'js-use-core/src/fullscreen';
```

### CommonJS 导入

```javascript
// 导入全屏功能
const { fullscreen } = require('js-use-core');

// 或者单独导入
const fullscreen = require('js-use-core/src/fullscreen').default;
```

### 基本用法

```javascript
import { fullscreen } from 'js-use-core';

// 检查是否支持全屏
if (fullscreen.isEnabled) {
  // 页面全屏
  await fullscreen.request();
  
  // 退出全屏
  await fullscreen.exit();
  
  // 切换全屏状态
  await fullscreen.toggle();
}
```

# API

## 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `isEnabled` | `boolean` | 检查浏览器是否支持全屏功能 |
| `isFullscreen` | `boolean` | 检查当前是否处于全屏状态 |
| `element` | `Element \| undefined` | 获取当前全屏的元素 |

## 方法

### `request(element?, options?)`

进入全屏模式。

**参数：**
- `element` (可选): `Element` - 要全屏的元素，默认为 `<html>` 元素
- `options` (可选): `FullscreenOptions` - 全屏选项

**返回值：** `Promise<void>`

**示例：**
```javascript
// 页面全屏
await fullscreen.request();

// 元素全屏
const element = document.getElementById('myElement');
await fullscreen.request(element);

// 带选项的全屏
await fullscreen.request(element, { navigationUI: 'hide' });
```

### `exit()`

退出全屏模式。

**返回值：** `Promise<void>`

**示例：**
```javascript
await fullscreen.exit();
```

### `toggle(element?, options?)`

切换全屏状态。

**参数：**
- `element` (可选): `Element` - 要全屏的元素
- `options` (可选): `FullscreenOptions` - 全屏选项

**返回值：** `Promise<void>`

**示例：**
```javascript
await fullscreen.toggle();
```

### `on(event, listener)`

添加事件监听器。

**参数：**
- `event`: `'change' \| 'error'` - 事件类型
- `listener`: `(event?: Event) => void` - 事件处理函数

**示例：**
```javascript
// 监听全屏状态变化
fullscreen.on('change', (event) => {
  console.log('全屏状态变化:', fullscreen.isFullscreen);
});

// 监听全屏错误
fullscreen.on('error', (event) => {
  console.error('全屏操作失败:', event);
});
```

### `off(event, listener)`

移除事件监听器。

**参数：**
- `event`: `'change' \| 'error'` - 事件类型
- `listener`: `(event?: Event) => void` - 事件处理函数

**示例：**
```javascript
const listener = (event) => console.log('全屏变化');
fullscreen.on('change', listener);
fullscreen.off('change', listener);
```

### `offAll(event?)`

移除所有事件监听器。

**参数：**
- `event` (可选): `'change' \| 'error'` - 事件类型，不指定则移除所有

**示例：**
```javascript
// 移除所有 change 事件监听器
fullscreen.offAll('change');

// 移除所有事件监听器
fullscreen.offAll();
```

### `destroy()`

销毁实例，清理事件监听器。

**示例：**
```javascript
fullscreen.destroy();
```

## 类型定义

```typescript
interface FullscreenOptions {
  navigationUI?: 'auto' | 'hide' | 'show';
}

type FullscreenEventType = 'change' | 'error';
type FullscreenEventListener = (event?: Event) => void;
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
