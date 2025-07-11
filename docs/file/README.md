🚩 支持 JS（浏览器）、Vue（兼容 Vue3）、React、Node.js 多端环境

file 提供文件和图片操作的工具方法，支持多种格式转换（Base64、Blob、File、DataURL）、图片压缩与格式转换，适用于多端环境。

[English](./readme.en.md) | 简体中文

# 特性

- 🚀 轻量级，无外部依赖
- 🔄 多种格式转换：Base64、Blob、File、DataURL
- 📦 图片压缩和格式转换
- 💻 浏览器、Node.js、Vue、React 多端支持
- 📱 TypeScript 完整类型定义

# 功能

## 文件操作
- urlToBase64：URL转Base64
- fileToBase64：文件转Base64
- base64ToFile：Base64转文件
- fileToBlob：文件转Blob
- blobToFile：Blob转文件
- base64ToBlob：Base64转Blob
- blobToBase64：Blob转Base64

## 图片操作
- blobToDataURL：Blob转DataURL
- imageToDataURL：图片转DataURL
- dataURLToImage：DataURL转图片
- dataURLtoBlob：DataURL转Blob
- dataURLtoImgBlob：DataURL转图片Blob
- dataURLtoFile：DataURL转文件
- imgConvert：图片格式转换
- imgCompress：图片压缩

# 安装

```bash
npm install js-use-core
```

# 使用示例

## 浏览器 JS
```html
<script src="https://unpkg.com/js-use-core/dist/index.umd.js"></script>
<script>
  // 全局变量 jsUseCore
  document.getElementById('file').onchange = async (e) => {
    const file = e.target.files[0];
    const base64 = await jsUseCore.fileToBase64(file);
    console.log(base64);
  };
</script>
```

## Vue (支持 Vue3)
```vue
<script setup>
import { fileToBase64, imgCompress } from 'js-use-core';
import { ref } from 'vue';
const base64Result = ref('');
const handleFile = async (e) => {
  const file = e.target.files[0];
  base64Result.value = await fileToBase64(file);
};
</script>
<template>
  <input type="file" @change="handleFile" />
  <div v-if="base64Result">{{ base64Result.substring(0, 50) }}...</div>
</template>
```

## React
```jsx
import React, { useState } from 'react';
import { fileToBase64 } from 'js-use-core';

export default function Demo() {
  const [base64, setBase64] = useState('');
  const handleChange = async (e) => {
    const file = e.target.files[0];
    setBase64(await fileToBase64(file));
  };
  return <>
    <input type="file" onChange={handleChange} />
    {base64 && <div>{base64.substring(0, 50)}...</div>}
  </>;
}
```

## Node.js
```js
const { fileToBase64, base64ToFile } = require('js-use-core');
const fs = require('fs');
const path = require('path');
// Node.js 环境需自行 polyfill Blob/File
const fileContent = fs.readFileSync('test.jpg');
const file = new File([fileContent], 'test.jpg', { type: 'image/jpeg' });
fileToBase64(file).then(console.log);
```

# API 文档

详细 API 见 [API.md](./API.md)

# 贡献指南

请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)

# 许可证

MIT License 