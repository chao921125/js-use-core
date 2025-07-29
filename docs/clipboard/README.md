# 剪贴板功能 (Clipboard)

🚩 支持 JS（浏览器）、Vue（兼容 Vue2）、React、Node.js 多端环境

剪贴板功能提供了基于统一架构的跨浏览器兼容剪贴板 API 封装，支持文本、HTML、文件的复制和读取操作，具有完善的权限管理、数据验证和降级处理。

[English](./README.en.md) | 简体中文

## ✨ 特性

- 🏗️ **统一架构** - 基于 BaseManager 的统一管理架构
- 🚀 **跨浏览器兼容** - 自动处理不同浏览器的兼容性问题
- 📦 **模块化设计** - 支持按需导入，减少打包体积
- 🔧 **TypeScript 支持** - 完整的类型定义和智能提示
- 🎯 **简单易用** - 简洁的 API 设计，快速上手
- 🛡️ **权限管理** - 智能权限检查和请求机制
- 📊 **数据支持** - 支持文本、HTML、文件等多种数据类型
- 🔄 **降级处理** - 完善的降级方案和错误处理
- 📱 **移动端支持** - 兼容主流移动浏览器
- 🔍 **数据验证** - 内置数据验证和清理机制

## 🚀 功能

- 文本、HTML、文件复制到剪贴板
- 从剪贴板读取各种格式数据
- 智能权限管理和检查
- 剪贴板变化监听
- 数据格式转换和验证
- HTML 内容清理和安全处理
- 多种降级策略
- 性能监控和缓存

## 📦 安装

```bash
npm install js-use-core
```

## 🔧 使用方法

### ES6 模块导入

```javascript
// 导入剪贴板管理器
import { ClipboardManager } from "js-use-core";

// 或者导入便捷函数
import { copyText, readText, copyHTML, readHTML } from "js-use-core";

// 或者导入默认实例
import { clipboard } from "js-use-core";
```

### CommonJS 导入

```javascript
// 导入剪贴板管理器
const { ClipboardManager } = require("js-use-core");

// 或者导入默认实例
const { clipboard } = require("js-use-core");
```

### 基本用法

```javascript
import { ClipboardManager } from "js-use-core";

// 创建剪贴板管理器实例
const clipboard = new ClipboardManager({
  enablePermissionCheck: true,
  enableFallback: true,
  enableDataValidation: true,
  debug: false,
});

// 初始化管理器
await clipboard.initialize();

// 检查是否支持剪贴板
if (clipboard.isSupported) {
  // 复制文本到剪贴板
  await clipboard.copyText("要复制的文本");

  // 从剪贴板读取文本
  const text = await clipboard.readText();

  // 复制 HTML 内容
  await clipboard.copyHTML("<p>HTML 内容</p>");

  // 读取 HTML 内容
  const html = await clipboard.readHTML();
}
```

### 使用便捷函数

```javascript
import {
  copyText,
  readText,
  copyHTML,
  readHTML,
  copyFiles,
  readFiles,
} from "js-use-core";

// 复制文本
await copyText("Hello World!");

// 读取文本
const text = await readText();

// 复制 HTML
await copyHTML("<h1>标题</h1>");

// 读取 HTML
const html = await readHTML();

// 复制文件
await copyFiles([file1, file2]);

// 读取文件
const files = await readFiles();
```

# API

## 属性

| 属性        | 类型      | 描述                         |
| ----------- | --------- | ---------------------------- |
| `isEnabled` | `boolean` | 检查浏览器是否支持剪贴板功能 |

## 方法

### `writeText(text)`

将文本复制到剪贴板。

**参数：**

- `text`: `string` - 要复制的文本

**返回值：** `Promise<void>`

**示例：**

```javascript
try {
  await clipboard.writeText("Hello World!");
  console.log("文本已复制到剪贴板");
} catch (error) {
  console.error("复制失败:", error);
}
```

### `readText()`

从剪贴板读取文本。

**返回值：** `Promise<string>`

**示例：**

```javascript
try {
  const text = await clipboard.readText();
  console.log("剪贴板内容:", text);
} catch (error) {
  console.error("读取失败:", error);
}
```

### `hasPermission()`

检查剪贴板权限。

**返回值：** `Promise<boolean>`

**示例：**

```javascript
const hasPermission = await clipboard.hasPermission();
if (hasPermission) {
  // 可以访问剪贴板
} else {
  // 需要请求权限
}
```

### `requestPermission()`

请求剪贴板权限。

**返回值：** `Promise<boolean>`

**示例：**

```javascript
const granted = await clipboard.requestPermission();
if (granted) {
  console.log("剪贴板权限已授予");
} else {
  console.log("剪贴板权限被拒绝");
}
```

### `on(event, listener)`

添加事件监听器。

**参数：**

- `event`: `'change'` - 事件类型
- `listener`: `(event?: ClipboardEvent) => void` - 事件处理函数

**示例：**

```javascript
// 监听剪贴板变化
clipboard.on("change", (event) => {
  console.log("剪贴板内容已变化");
});
```

### `off(event, listener)`

移除事件监听器。

**参数：**

- `event`: `'change'` - 事件类型
- `listener`: `(event?: ClipboardEvent) => void` - 事件处理函数

**示例：**

```javascript
const listener = (event) => console.log("剪贴板变化");
clipboard.on("change", listener);
clipboard.off("change", listener);
```

### `offAll(event?)`

移除所有事件监听器。

**参数：**

- `event` (可选): `'change'` - 事件类型，不指定则移除所有

**示例：**

```javascript
// 移除所有 change 事件监听器
clipboard.offAll("change");

// 移除所有事件监听器
clipboard.offAll();
```

### `destroy()`

销毁实例，清理事件监听器。

**示例：**

```javascript
clipboard.destroy();
```

## 类型定义

```typescript
type ClipboardEventType = "change";
type ClipboardEventListener = (event?: ClipboardEvent) => void;
```

# 示例

## Vue.js 中使用

```vue
<template>
  <div>
    <input v-model="inputText" placeholder="输入要复制的文本" />
    <button @click="copyText">复制文本</button>
    <button @click="pasteText">粘贴文本</button>
    <div>剪贴板内容: {{ clipboardText }}</div>
  </div>
</template>

<script>
import { clipboard } from "js-use-core";

export default {
  data() {
    return {
      inputText: "",
      clipboardText: "",
    };
  },

  mounted() {
    // 监听剪贴板变化
    clipboard.on("change", () => {
      this.updateClipboardText();
    });
  },

  beforeDestroy() {
    // 清理事件监听器
    clipboard.offAll();
  },

  methods: {
    async copyText() {
      try {
        await clipboard.writeText(this.inputText);
        this.$message.success("文本已复制到剪贴板");
      } catch (error) {
        this.$message.error("复制失败: " + error.message);
      }
    },

    async pasteText() {
      try {
        const text = await clipboard.readText();
        this.clipboardText = text;
      } catch (error) {
        this.$message.error("粘贴失败: " + error.message);
      }
    },

    async updateClipboardText() {
      try {
        this.clipboardText = await clipboard.readText();
      } catch (error) {
        console.error("读取剪贴板失败:", error);
      }
    },
  },
};
</script>
```

## React 中使用

```jsx
import React, { useState, useEffect } from "react";
import { clipboard } from "js-use-core";

function ClipboardComponent() {
  const [inputText, setInputText] = useState("");
  const [clipboardText, setClipboardText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 监听剪贴板变化
    const handleChange = () => {
      updateClipboardText();
    };

    clipboard.on("change", handleChange);

    return () => {
      clipboard.off("change", handleChange);
    };
  }, []);

  const copyText = async () => {
    try {
      await clipboard.writeText(inputText);
      setMessage("文本已复制到剪贴板");
    } catch (error) {
      setMessage("复制失败: " + error.message);
    }
  };

  const pasteText = async () => {
    try {
      const text = await clipboard.readText();
      setClipboardText(text);
    } catch (error) {
      setMessage("粘贴失败: " + error.message);
    }
  };

  const updateClipboardText = async () => {
    try {
      const text = await clipboard.readText();
      setClipboardText(text);
    } catch (error) {
      console.error("读取剪贴板失败:", error);
    }
  };

  return (
    <div>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="输入要复制的文本"
      />
      <button onClick={copyText}>复制文本</button>
      <button onClick={pasteText}>粘贴文本</button>
      <div>剪贴板内容: {clipboardText}</div>
      {message && <div>{message}</div>}
    </div>
  );
}
```

## 原生 JavaScript 中使用

```html
<!DOCTYPE html>
<html>
  <head>
    <title>剪贴板功能示例</title>
  </head>
  <body>
    <input id="inputText" placeholder="输入要复制的文本" />
    <button id="copyBtn">复制文本</button>
    <button id="pasteBtn">粘贴文本</button>
    <div id="clipboardContent">剪贴板内容:</div>

    <script type="module">
      import { clipboard } from "./dist/index.esm.js";

      // 检查支持
      if (!clipboard.isEnabled) {
        console.warn("浏览器不支持剪贴板功能");
        document.getElementById("copyBtn").disabled = true;
        document.getElementById("pasteBtn").disabled = true;
      }

      // 监听剪贴板变化
      clipboard.on("change", () => {
        updateClipboardContent();
      });

      // 复制文本
      document.getElementById("copyBtn").addEventListener("click", async () => {
        const text = document.getElementById("inputText").value;
        try {
          await clipboard.writeText(text);
          alert("文本已复制到剪贴板");
        } catch (error) {
          alert("复制失败: " + error.message);
        }
      });

      // 粘贴文本
      document
        .getElementById("pasteBtn")
        .addEventListener("click", async () => {
          try {
            const text = await clipboard.readText();
            document.getElementById("clipboardContent").textContent =
              "剪贴板内容: " + text;
          } catch (error) {
            alert("粘贴失败: " + error.message);
          }
        });

      // 更新剪贴板内容显示
      async function updateClipboardContent() {
        try {
          const text = await clipboard.readText();
          document.getElementById("clipboardContent").textContent =
            "剪贴板内容: " + text;
        } catch (error) {
          console.error("读取剪贴板失败:", error);
        }
      }
    </script>
  </body>
</html>
```

# 浏览器兼容性

| 浏览器  | 版本   | 支持 |
| ------- | ------ | ---- |
| Chrome  | 66+    | ✅   |
| Firefox | 63+    | ✅   |
| Safari  | 13.1+  | ✅   |
| Edge    | 79+    | ✅   |
| IE      | 不支持 | ❌   |

**注意：** 剪贴板 API 需要 HTTPS 环境或 localhost。

# 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

# 安全

如果您发现安全漏洞，请发送邮件到 security@example.com。

# 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件
