# 字体功能 (Font)

🚩 一个基于统一架构、支持 JS、Vue、React 的现代字体检测、管理和操作库，基于最新的 Web Font API。

[English](README.en.md) | 简体中文

## 目录
- [特性](#特性)
- [功能](#功能)
- [安装](#安装)
- [使用方法](#使用方法)
- [API 参考](#api-参考)
- [示例](#示例)
- [最佳实践](#最佳实践)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## ✨ 特性

- 🏗️ **统一架构** - 基于 BaseManager 的统一管理架构
- 🚀 **轻量级** - 零外部依赖，高性能实现
- 🔄 **智能检测** - 支持字体加载状态检测和精确验证
- 📦 **动态管理** - 支持动态添加、删除、清除字体
- 💻 **跨平台** - 浏览器环境完美支持
- 📱 **TypeScript** - 完整的类型定义和智能提示
- 🛠️ **丰富功能** - 批量处理、并发控制、缓存机制
- 🔧 **多种导入** - 支持 ESM、CommonJS、UMD 多种导入方式
- 🛡️ **错误处理** - 统一的错误处理和降级方案
- 📊 **性能监控** - 内置性能监控和缓存机制
- 🌐 **跨域支持** - 完善的跨域字体加载处理

## 🚀 功能

- 字体加载检测与状态管理
- 动态添加/删除/清除字体
- 批量字体检测和并发控制
- 字体加载性能监控
- 跨域字体处理和错误提示
- 系统字体识别和优化
- 字体检测结果缓存
- 重试机制和错误恢复
- 事件驱动的状态通知

## 📦 安装

```bash
npm install js-use-core
# 或 yarn add js-use-core
# 或 pnpm add js-use-core
```

## 🔧 使用方法

### ES6 模块导入

```javascript
// 导入字体管理器
import { FontManager } from 'js-use-core';

// 或者导入便捷函数
import { 
  checkFont, 
  addFont, 
  deleteFont,
  clearFonts 
} from 'js-use-core';

// 或者导入默认实例
import { font } from 'js-use-core';
```

### CommonJS 导入

```javascript
// 导入字体管理器
const { FontManager } = require('js-use-core');

// 或者导入默认实例
const { font } = require('js-use-core');
```

### 基本用法

```javascript
import { FontManager } from 'js-use-core';

// 创建字体管理器实例
const fontManager = new FontManager({
  timeout: 3000,
  retries: 2,
  cache: true,
  concurrency: 5,
  debug: false
});

// 初始化管理器
await fontManager.initialize();

// 检查单个字体
const result = await fontManager.check('Arial');
console.log(result.success, result.allFonts);

// 检查多个字体
const results = await fontManager.check(['Arial', 'Helvetica', 'CustomFont']);

// 动态添加字体
fontManager.addFont('CustomFont', '/fonts/custom.woff2');

// 批量添加字体
await fontManager.addFonts([
  { name: 'Font1', url: '/fonts/font1.woff2' },
  { name: 'Font2', url: '/fonts/font2.woff2' }
]);
```

### 使用便捷函数

```javascript
import { 
  checkFont, 
  addFont, 
  deleteFont,
  clearFonts,
  isFontLoaded 
} from 'js-use-core';

// 检查字体
const result = await checkFont('Arial');
console.log(result.loaded);

// 添加字体
const success = addFont('CustomFont', '/fonts/custom.woff2');

// 删除字体
const deleted = deleteFont('CustomFont');

// 清除所有动态字体
const cleared = clearFonts();

// 检查字体是否已加载
const loaded = await isFontLoaded('Arial');
```

### Vue.js 中使用

```vue
<template>
  <div>
    <button @click="checkFonts">检查字体</button>
    <button @click="addCustomFont">添加自定义字体</button>
    <div v-for="font in fontResults" :key="font.name">
      {{ font.name }}: {{ font.loaded ? '已加载' : '未加载' }}
    </div>
  </div>
</template>

<script>
import { FontManager } from 'js-use-core';

export default {
  data() {
    return {
      fontManager: null,
      fontResults: []
    };
  },
  
  async mounted() {
    this.fontManager = new FontManager({
      timeout: 3000,
      cache: true
    });
    
    await this.fontManager.initialize();
    
    // 监听字体加载事件
    this.fontManager.on('fontLoaded', (data) => {
      this.$message.success(`字体 ${data.fontName} 加载成功`);
    });
    
    this.fontManager.on('fontLoadError', (data) => {
      this.$message.error(`字体 ${data.fontName} 加载失败: ${data.error.message}`);
    });
  },
  
  beforeDestroy() {
    if (this.fontManager) {
      this.fontManager.destroy();
    }
  },
  
  methods: {
    async checkFonts() {
      try {
        const result = await this.fontManager.check(['Arial', 'Helvetica', 'CustomFont']);
        this.fontResults = result.allFonts;
      } catch (error) {
        this.$message.error('字体检查失败: ' + error.message);
      }
    },
    
    addCustomFont() {
      const success = this.fontManager.addFont('CustomFont', '/fonts/custom.woff2');
      if (success) {
        this.$message.success('字体添加成功');
      } else {
        this.$message.error('字体添加失败');
      }
    }
  }
}
</script>
```

### React 中使用

```jsx
import React, { useState, useEffect } from 'react';
import { FontManager } from 'js-use-core';

function FontComponent() {
  const [fontManager, setFontManager] = useState(null);
  const [fontResults, setFontResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const initFontManager = async () => {
      const manager = new FontManager({
        timeout: 3000,
        cache: true,
        debug: true
      });
      
      await manager.initialize();
      
      // 监听字体事件
      manager.on('fontLoaded', (data) => {
        console.log(`字体 ${data.fontName} 加载成功`);
      });
      
      manager.on('fontLoadError', (data) => {
        console.error(`字体 ${data.fontName} 加载失败:`, data.error);
      });
      
      setFontManager(manager);
    };
    
    initFontManager();
    
    return () => {
      if (fontManager) {
        fontManager.destroy();
      }
    };
  }, []);
  
  const checkFonts = async () => {
    if (!fontManager) return;
    
    setLoading(true);
    try {
      const result = await fontManager.check(['Arial', 'Helvetica', 'Roboto']);
      setFontResults(result.allFonts);
    } catch (error) {
      console.error('字体检查失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addCustomFont = () => {
    if (!fontManager) return;
    
    const success = fontManager.addFont('Roboto', 'https://fonts.googleapis.com/css2?family=Roboto&display=swap');
    if (success) {
      console.log('字体添加成功');
    }
  };
  
  return (
    <div>
      <button onClick={checkFonts} disabled={loading}>
        {loading ? '检查中...' : '检查字体'}
      </button>
      <button onClick={addCustomFont}>添加 Roboto 字体</button>
      
      <div>
        {fontResults.map(font => (
          <div key={font.name}>
            {font.name}: {font.loaded ? '已加载' : '未加载'}
            {font.loadTime && ` (${font.loadTime}ms)`}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FontComponent;
```
