# font-load-check

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
npm install font-load-check
# 或 yarn add font-load-check
# 或 pnpm add font-load-check
```

## 使用说明

### JS/TS 用法
```js
import FontChecker, { checkFont, isFontLoaded } from 'font-load-check';
const checker = new FontChecker();
const result = await checker.check('Arial');
console.log(result.success); // true/false
```

### Vue/React 用法
可直接在组件中引入并调用 FontChecker 及工具函数。

## API 参考
详见 [API 文档](docs/API.md)

## 示例
```js
import { addFont, checkFont } from 'font-load-check';
addFont('MyFont', '/fonts/myfont.woff2');
checkFont('MyFont').then(res => console.log(res.loaded));
```
更多用法见 [API 文档](docs/API.md)

## 贡献指南
欢迎贡献！请阅读 [贡献指南](docs/CONTRIBUTING.md)

## License
MIT
