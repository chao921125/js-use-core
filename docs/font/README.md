> 🚩 一个零依赖、支持 JS、Vue、React 检测、管理和操作字体的现代 JavaScript/TypeScript 库，基于最新的 Web Font API。

[English](README.en.md) | 简体中文

## 目录
- [特性](#特性)
- [功能](#功能)
- [安装](#安装)
- [使用说明](#使用说明)
  - [JavaScript/TypeScript](#jsts-用法)
  - [Vue/React](#vuereact-用法)
- [API 参考](#api-参考)
- [示例](#示例)
- [贡献指南](#贡献指南)
- [License](#license)

## 特性
- 🚀 轻量级，无外部依赖
- 🔄 支持字体加载状态检测
- 📦 支持动态字体管理（添加、删除、清除）
- 💻 浏览器环境支持
- 📱 TypeScript 完整类型定义
- 🛠️ 丰富的工具函数
- 🔧 多种导入方式（ESM、CommonJS、UMD）

## 功能
- 字体加载检测与管理
- 动态添加/删除/清除字体
- 工具函数辅助开发

## 安装
```bash
npm install js-use-core
# 或 yarn add js-use-core
# 或 pnpm add js-use-core
```

## 使用说明

### JS/TS 用法
```js
import { font, checkFont, isFontLoaded } from 'js-use-core';
const checker = new font();
const result = await checker.check('Arial');
console.log(result.success); // true/false
```

### Vue/React 用法
可直接在组件中引入并调用 font 及工具函数。

## API 参考
详见 [API.md](./API.md)

## 示例
```js
import { addFont, checkFont } from 'js-use-core';
addFont('MyFont', '/fonts/myfont.woff2');
checkFont('MyFont').then(res => console.log(res.loaded));
```
更多用法见 [API.md](./API.md)

## 贡献指南
欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)

## License
MIT
