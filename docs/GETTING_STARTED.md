# 快速开始指南

欢迎使用 js-use-core！这个指南将帮助你快速上手这个现代化的 JavaScript 综合工具库。

## 🚀 安装

### npm

```bash
npm install js-use-core
```

### yarn

```bash
yarn add js-use-core
```

### pnpm

```bash
pnpm add js-use-core
```

### CDN

```html
<!-- 最新版本 -->
<script src="https://unpkg.com/js-use-core@latest/dist/index.umd.js"></script>

<!-- 指定版本 -->
<script src="https://unpkg.com/js-use-core@1.3.0/dist/index.umd.js"></script>
```

## 📦 导入方式

### ES6 模块

```javascript
// 导入所有功能
import * as jsUseCore from 'js-use-core';

// 导入特定管理器
import { 
  ClipboardManager, 
  FullscreenManager, 
  FontManager,
  DeviceDetector,
  UrlManager,
  UA
} from 'js-use-core';

// 导入便捷函数
import { 
  copyText, 
  readText, 
  isMobile, 
  parseUA 
} from 'js-use-core';
```

### CommonJS

```javascript
// 导入所有功能
const jsUseCore = require('js-use-core');

// 导入特定功能
const { ClipboardManager, FullscreenManager } = require('js-use-core');
```

### 按需导入

```javascript
// 只导入剪贴板功能
import { ClipboardManager } from 'js-use-core/clipboard';

// 只导入设备检测功能
import { DeviceDetector } from 'js-use-core/device';

// 只导入字体功能
import { FontManager } from 'js-use-core/font';
```

## 🎉 第一个示例

让我们从一个简单的剪贴板操作开始：

```javascript
import { ClipboardManager } from 'js-use-core';

// 创建剪贴板管理器（自动初始化）
const clipboard = new ClipboardManager();

// 复制文本到剪贴板
async function copyToClipboard() {
  try {
    await clipboard.copyText('Hello, js-use-core!');
    console.log('复制成功！');
  } catch (error) {
    console.error('复制失败:', error.message);
  }
}

// 从剪贴板读取文本
async function readFromClipboard() {
  try {
    const text = await clipboard.readText();
    console.log('剪贴板内容:', text);
  } catch (error) {
    console.error('读取失败:', error.message);
  }
}

// 使用
copyToClipboard();
readFromClipboard();
```

## 🏗️ 核心概念

### 1. 自动初始化

从 v1.3.0 开始，所有管理器都支持自动初始化，无需手动调用 `initialize()` 方法：

```javascript
// ✅ 推荐：直接使用，自动初始化
const clipboard = new ClipboardManager();
await clipboard.copyText('hello'); // 自动处理初始化

// ❌ 不再需要：手动初始化
const clipboard = new ClipboardManager();
await clipboard.initialize(); // 多余的步骤
await clipboard.copyText('hello');
```

### 2. 统一的错误处理

所有管理器都采用统一的错误处理机制：

```javascript
const clipboard = new ClipboardManager();

try {
  await clipboard.copyText('hello');
} catch (error) {
  // 统一处理初始化错误和功能错误
  console.error('操作失败:', error.message);
  
  // 根据错误类型进行处理
  if (error.message.includes('permission')) {
    console.log('需要剪贴板权限');
  } else if (error.message.includes('not supported')) {
    console.log('浏览器不支持此功能');
  }
}
```

### 3. 事件系统

所有管理器都支持事件监听：

```javascript
const clipboard = new ClipboardManager();

// 监听复制事件
clipboard.on('copy', (data) => {
  console.log('复制了:', data);
});

// 监听错误事件
clipboard.on('error', (error) => {
  console.error('发生错误:', error);
});

// 一次性监听
clipboard.once('initialized', () => {
  console.log('初始化完成');
});
```

## 📚 功能模块快速上手

### 剪贴板功能

```javascript
import { ClipboardManager } from 'js-use-core';

const clipboard = new ClipboardManager({
  enablePermissionCheck: true,
  enableFallback: true
});

// 复制文本
await clipboard.copyText('Hello World!');

// 复制 HTML
await clipboard.copyHTML('<h1>标题</h1><p>内容</p>');

// 读取文本
const text = await clipboard.readText();

// 读取 HTML
const html = await clipboard.readHTML();
```

### 全屏功能

```javascript
import { FullscreenManager } from 'js-use-core';

const fullscreen = new FullscreenManager();

// 进入全屏
await fullscreen.request();

// 指定元素全屏
const videoElement = document.getElementById('video');
await fullscreen.request(videoElement);

// 退出全屏
await fullscreen.exit();

// 切换全屏状态
await fullscreen.toggle();

// 检查全屏状态
console.log('是否全屏:', fullscreen.isFullscreen);
```

### 字体管理

```javascript
import { FontManager } from 'js-use-core';

const fontManager = new FontManager();

// 检查字体是否可用
const result = await fontManager.check(['Arial', 'Helvetica', 'sans-serif']);
console.log('可用字体:', result.availableFonts);

// 动态加载字体
await fontManager.addFont('CustomFont', '/fonts/custom.woff2');

// 检查单个字体
const isAvailable = await fontManager.check('CustomFont');
```

### 设备检测

```javascript
import { DeviceDetector } from 'js-use-core';

const device = new DeviceDetector();
const deviceInfo = await device.getDeviceInfo();

console.log('设备类型:', deviceInfo.type);
console.log('是否移动设备:', deviceInfo.isMobile);
console.log('操作系统:', deviceInfo.os.name);
console.log('浏览器:', deviceInfo.browser.name);

// 使用便捷函数
import { isMobile, isTablet, isDesktop } from 'js-use-core';

if (isMobile()) {
  console.log('移动设备');
} else if (isTablet()) {
  console.log('平板设备');
} else if (isDesktop()) {
  console.log('桌面设备');
}
```

### URL 管理

```javascript
import { UrlManager } from 'js-use-core';

const url = new UrlManager('https://example.com/api');

// 添加路径
url.appendPath('users').appendPath('123');

// 添加查询参数
url.addQuery({ 
  page: 1, 
  limit: 10,
  tags: ['javascript', 'web']
});

// 设置哈希
url.setHash('profile');

console.log(url.toString()); 
// 'https://example.com/api/users/123?page=1&limit=10&tags=javascript&tags=web#profile'
```

### User Agent 解析

```javascript
import { UA } from 'js-use-core';

// 解析当前浏览器的 UA
const ua = UA.parse();
console.log(`${ua.browser.name} ${ua.browser.version}`);
console.log(`${ua.os.name} ${ua.os.version}`);

// 版本比较
if (UA.satisfies(ua, 'Chrome >= 90')) {
  console.log('现代 Chrome 浏览器');
}

// 检查是否为现代浏览器
if (UA.isModern(ua)) {
  console.log('现代浏览器，可以使用新特性');
}
```

## 🔧 配置选项

所有管理器都支持统一的基础配置：

```javascript
const options = {
  debug: false,           // 调试模式
  timeout: 5000,         // 操作超时时间（毫秒）
  retries: 2,            // 重试次数
  cache: true,           // 启用缓存
  cacheTTL: 30000       // 缓存过期时间（毫秒）
};

const clipboard = new ClipboardManager(options);
```

### 环境相关配置

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

const clipboard = new ClipboardManager({
  debug: isDevelopment,
  timeout: isDevelopment ? 5000 : 10000,
  retries: isDevelopment ? 1 : 3,
  cache: !isDevelopment
});
```

## 🌐 在不同框架中使用

### React

```jsx
import React, { useState, useEffect } from 'react';
import { ClipboardManager } from 'js-use-core';

function ClipboardComponent() {
  const [clipboard] = useState(() => new ClipboardManager());
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 组件卸载时清理
    return () => clipboard.destroy();
  }, [clipboard]);

  const handleCopy = async () => {
    try {
      await clipboard.copyText(text);
      setMessage('复制成功！');
    } catch (error) {
      setMessage('复制失败: ' + error.message);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await clipboard.readText();
      setText(clipboardText);
      setMessage('粘贴成功！');
    } catch (error) {
      setMessage('粘贴失败: ' + error.message);
    }
  };

  return (
    <div>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="输入要复制的文本"
      />
      <button onClick={handleCopy}>复制</button>
      <button onClick={handlePaste}>粘贴</button>
      {message && <p>{message}</p>}
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <div>
    <input 
      v-model="text" 
      placeholder="输入要复制的文本"
    />
    <button @click="handleCopy">复制</button>
    <button @click="handlePaste">粘贴</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { ClipboardManager } from 'js-use-core';

const clipboard = new ClipboardManager();
const text = ref('');
const message = ref('');

const handleCopy = async () => {
  try {
    await clipboard.copyText(text.value);
    message.value = '复制成功！';
  } catch (error) {
    message.value = '复制失败: ' + error.message;
  }
};

const handlePaste = async () => {
  try {
    const clipboardText = await clipboard.readText();
    text.value = clipboardText;
    message.value = '粘贴成功！';
  } catch (error) {
    message.value = '粘贴失败: ' + error.message;
  }
};

onUnmounted(() => {
  clipboard.destroy();
});
</script>
```

### Vue 2

```vue
<template>
  <div>
    <input 
      v-model="text" 
      placeholder="输入要复制的文本"
    />
    <button @click="handleCopy">复制</button>
    <button @click="handlePaste">粘贴</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { ClipboardManager } from 'js-use-core';

export default {
  data() {
    return {
      clipboard: null,
      text: '',
      message: ''
    };
  },

  created() {
    this.clipboard = new ClipboardManager();
  },

  beforeDestroy() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  },

  methods: {
    async handleCopy() {
      try {
        await this.clipboard.copyText(this.text);
        this.message = '复制成功！';
      } catch (error) {
        this.message = '复制失败: ' + error.message;
      }
    },

    async handlePaste() {
      try {
        const clipboardText = await this.clipboard.readText();
        this.text = clipboardText;
        this.message = '粘贴成功！';
      } catch (error) {
        this.message = '粘贴失败: ' + error.message;
      }
    }
  }
};
</script>
```

### 原生 JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>js-use-core 示例</title>
</head>
<body>
  <input id="textInput" placeholder="输入要复制的文本">
  <button id="copyBtn">复制</button>
  <button id="pasteBtn">粘贴</button>
  <p id="message"></p>

  <script type="module">
    import { ClipboardManager } from './node_modules/js-use-core/dist/index.js';

    const clipboard = new ClipboardManager();
    const textInput = document.getElementById('textInput');
    const copyBtn = document.getElementById('copyBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const message = document.getElementById('message');

    copyBtn.addEventListener('click', async () => {
      try {
        await clipboard.copyText(textInput.value);
        message.textContent = '复制成功！';
      } catch (error) {
        message.textContent = '复制失败: ' + error.message;
      }
    });

    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await clipboard.readText();
        textInput.value = text;
        message.textContent = '粘贴成功！';
      } catch (error) {
        message.textContent = '粘贴失败: ' + error.message;
      }
    });
  </script>
</body>
</html>
```

## 🔍 调试和开发

### 启用调试模式

```javascript
const clipboard = new ClipboardManager({
  debug: true // 启用详细日志
});

// 监听所有事件进行调试
clipboard.on('*', (event, data) => {
  console.log(`[Clipboard] ${event}:`, data);
});
```

### 检查管理器状态

```javascript
const clipboard = new ClipboardManager();

// 检查状态
const status = clipboard.getStatus();
console.log({
  initialized: status.initialized,    // 是否已初始化
  initializing: status.initializing,  // 是否正在初始化
  destroyed: status.destroyed,        // 是否已销毁
  eventListeners: status.eventListeners, // 事件监听器数量
  cacheSize: status.cacheSize         // 缓存大小
});

// 等待初始化完成
await clipboard.ready();
console.log('初始化完成');
```

## ⚠️ 常见问题

### 1. 权限问题

```javascript
const clipboard = new ClipboardManager({
  enablePermissionCheck: true
});

try {
  await clipboard.copyText('hello');
} catch (error) {
  if (error.message.includes('permission')) {
    console.log('需要用户授权剪贴板权限');
    // 可以显示提示信息引导用户授权
  }
}
```

### 2. 浏览器兼容性

```javascript
const clipboard = new ClipboardManager({
  enableFallback: true // 启用降级方案
});

// 检查是否支持
if (!clipboard.isSupported) {
  console.warn('浏览器不支持剪贴板功能');
  // 使用其他方案或显示提示
}
```

### 3. HTTPS 要求

```javascript
// 检查安全上下文
if (!window.isSecureContext) {
  console.warn('剪贴板 API 需要 HTTPS 环境');
  // 在开发环境中使用 localhost 或启用 HTTPS
}
```

## 🚀 下一步

现在你已经掌握了 js-use-core 的基础用法，可以：

1. 查看 [API 文档](./API_REFERENCE.md) 了解详细的 API 说明
2. 阅读 [最佳实践](./BEST_PRACTICES.md) 学习高级用法
3. 参考 [示例项目](../examples/) 查看完整的使用示例
4. 查看 [故障排除](./TROUBLESHOOTING.md) 解决常见问题

## 📞 获取帮助

如果遇到问题，可以：

- 查看 [GitHub Issues](https://github.com/chao921125/js-use-core/issues)
- 参与 [GitHub Discussions](https://github.com/chao921125/js-use-core/discussions)
- 阅读 [故障排除指南](./TROUBLESHOOTING.md)

欢迎使用 js-use-core！🎉