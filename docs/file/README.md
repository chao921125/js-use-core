# file

> 🚩 文件和图片操作工具方法，支持多种格式转换（Base64、Blob、File、DataURL）、图片压缩与格式转换，适用于多端环境。

[English](README.en.md) | 简体中文

## 目录
- [特性](#特性)
- [功能](#功能)
- [安装](#安装)
- [使用说明](#使用说明)
- [API 参考](#api-参考)
- [贡献指南](#贡献指南)
- [License](#license)

## 特性
- 🚀 轻量级，无外部依赖
- 🔄 多种格式转换：Base64、Blob、File、DataURL
- 📦 图片压缩和格式转换
- 💻 浏览器、Node.js、Vue、React 多端支持
- 📱 TypeScript 完整类型定义

## 功能
- urlToBase64：URL转Base64
- fileToBase64：文件转Base64
- base64ToFile：Base64转文件
- fileToBlob：文件转Blob
- blobToFile：Blob转文件
- base64ToBlob：Base64转Blob
- blobToBase64：Blob转Base64
- blobToDataURL：Blob转DataURL
- imageToDataURL：图片转DataURL
- dataURLToImage：DataURL转图片
- dataURLtoBlob：DataURL转Blob
- dataURLtoImgBlob：DataURL转图片Blob
- dataURLtoFile：DataURL转文件
- imgConvert：图片格式转换
- imgCompress：图片压缩

## 安装
```bash
npm install js-use-core
```

## 使用说明
```js
import { fileToBase64, imgCompress } from 'js-use-core';

const base64 = await fileToBase64(file);
const compressed = await imgCompress(file, { quality: 0.8 });
```

## API 参考
详见 [API.md](./API.md)

## 贡献指南
请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)

## License
MIT 