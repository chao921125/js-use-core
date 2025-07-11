# 剪贴板功能 API 文档

[English](./api.en.md) | 简体中文

## 概述

剪贴板功能提供了跨浏览器兼容的剪贴板 API 封装，支持文本的复制和读取操作，自动处理不同浏览器的兼容性问题。

## 核心 API

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `isEnabled` | `boolean` | 检查浏览器是否支持剪贴板功能 |

### 方法

#### `writeText(text)`

将文本复制到剪贴板。

**参数：**
- `text`: `string` - 要复制的文本

**返回值：** `Promise<void>`

**示例：**
```javascript
try {
  await clipboard.writeText('Hello World!');
  console.log('文本已复制到剪贴板');
} catch (error) {
  console.error('复制失败:', error);
}
```

#### `readText()`

从剪贴板读取文本。

**返回值：** `Promise<string>`

**示例：**
```javascript
try {
  const text = await clipboard.readText();
  console.log('剪贴板内容:', text);
} catch (error) {
  console.error('读取失败:', error);
}
```

#### `hasPermission()`

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

#### `requestPermission()`

请求剪贴板权限。

**返回值：** `Promise<boolean>`

**示例：**
```javascript
const granted = await clipboard.requestPermission();
if (granted) {
  console.log('剪贴板权限已授予');
} else {
  console.log('剪贴板权限被拒绝');
}
```

### 事件管理

#### `on(event, listener)`

添加事件监听器。

**参数：**
- `event`: `'change'` - 事件类型
- `listener`: `(event?: ClipboardEvent) => void` - 事件处理函数

**示例：**
```javascript
// 监听剪贴板变化
clipboard.on('change', (event) => {
  console.log('剪贴板内容已变化');
});
```

#### `off(event, listener)`

移除事件监听器。

**参数：**
- `event`: `'change'` - 事件类型
- `listener`: `(event?: ClipboardEvent) => void` - 事件处理函数

**示例：**
```javascript
const listener = (event) => console.log('剪贴板变化');
clipboard.on('change', listener);
clipboard.off('change', listener);
```

#### `offAll(event?)`

移除所有事件监听器。

**参数：**
- `event` (可选): `'change'` - 事件类型，不指定则移除所有

**示例：**
```javascript
// 移除所有 change 事件监听器
clipboard.offAll('change');

// 移除所有事件监听器
clipboard.offAll();
```

#### `destroy()`

销毁实例，清理事件监听器。

**示例：**
```javascript
clipboard.destroy();
```

## 类型定义

```typescript
type ClipboardEventType = 'change';
type ClipboardEventListener = (event?: ClipboardEvent) => void;

interface ClipboardAPI {
  readonly isEnabled: boolean;
  
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  
  on(event: ClipboardEventType, listener: ClipboardEventListener): void;
  off(event: ClipboardEventType, listener: ClipboardEventListener): void;
  offAll(event?: ClipboardEventType): void;
  destroy(): void;
}
```

## 错误处理

### 常见错误类型

```typescript
// 浏览器不支持剪贴板功能
if (!clipboard.isEnabled) {
  console.warn('浏览器不支持剪贴板功能');
}

// 剪贴板操作失败
try {
  await clipboard.writeText('Hello World!');
} catch (error) {
  if (error.name === 'NotAllowedError') {
    console.error('剪贴板权限被拒绝');
  } else if (error.name === 'NotSupportedError') {
    console.error('浏览器不支持剪贴板功能');
  } else {
    console.error('剪贴板操作失败:', error);
  }
}
```

### 错误处理最佳实践

```javascript
async function safeClipboardWrite(text) {
  try {
    // 检查支持
    if (!clipboard.isEnabled) {
      throw new Error('浏览器不支持剪贴板功能');
    }
    
    // 检查权限
    const hasPermission = await clipboard.hasPermission();
    if (!hasPermission) {
      const granted = await clipboard.requestPermission();
      if (!granted) {
        throw new Error('剪贴板权限被拒绝');
      }
    }
    
    // 执行复制操作
    await clipboard.writeText(text);
    
    // 成功处理
    console.log('文本复制成功');
    
  } catch (error) {
    // 错误处理
    console.error('剪贴板操作失败:', error.message);
    
    // 显示用户友好的错误信息
    showErrorMessage('复制失败，请检查浏览器设置');
  }
}
```

## 浏览器兼容性

### 支持的浏览器

| 浏览器 | 版本 | 支持状态 | 备注 |
|--------|------|----------|------|
| Chrome | 66+ | ✅ 完全支持 | 标准实现 |
| Firefox | 63+ | ✅ 完全支持 | 标准实现 |
| Safari | 13.1+ | ✅ 完全支持 | 需要用户交互 |
| Edge | 79+ | ✅ 完全支持 | 标准实现 |
| IE | 不支持 | ❌ | 不支持 Clipboard API |

### 权限要求

剪贴板 API 需要以下条件：

1. **HTTPS 环境** - 必须在 HTTPS 或 localhost 环境下使用
2. **用户交互** - 必须在用户交互事件中调用
3. **权限授予** - 用户需要授予剪贴板访问权限

## 性能优化

### 权限缓存

```javascript
// 缓存权限状态，避免重复检查
class ClipboardManager {
  constructor() {
    this.permissionCache = null;
  }
  
  async checkPermission() {
    if (this.permissionCache === null) {
      this.permissionCache = await clipboard.hasPermission();
    }
    return this.permissionCache;
  }
  
  async requestPermission() {
    const granted = await clipboard.requestPermission();
    this.permissionCache = granted;
    return granted;
  }
}
```

### 事件监听器管理

```javascript
// 避免内存泄漏
class ClipboardEventHandler {
  constructor() {
    this.handlers = new Map();
  }
  
  addChangeListener(handler) {
    const wrappedHandler = (event) => {
      handler({
        event,
        timestamp: Date.now()
      });
    };
    
    this.handlers.set(handler, wrappedHandler);
    clipboard.on('change', wrappedHandler);
  }
  
  removeChangeListener(handler) {
    const wrappedHandler = this.handlers.get(handler);
    if (wrappedHandler) {
      clipboard.off('change', wrappedHandler);
      this.handlers.delete(handler);
    }
  }
  
  destroy() {
    this.handlers.forEach((wrappedHandler) => {
      clipboard.off('change', wrappedHandler);
    });
    this.handlers.clear();
  }
}
```

## 调试指南

### 调试模式

```javascript
// 启用调试模式
if (process.env.NODE_ENV === 'development') {
  clipboard.on('change', (event) => {
    console.log('剪贴板变化:', {
      event,
      timestamp: Date.now()
    });
  });
}
```

### 常见问题排查

1. **剪贴板功能不工作**
   - 检查是否在 HTTPS 环境下
   - 确认在用户交互中调用
   - 验证浏览器是否支持

2. **权限被拒绝**
   - 检查浏览器设置
   - 确认在用户交互中请求权限
   - 验证 HTTPS 环境

3. **事件监听器不触发**
   - 确认事件名称正确
   - 检查监听器是否正确添加
   - 验证浏览器兼容性

## 安全考虑

### 权限管理

```javascript
// 安全的权限检查
async function secureClipboardAccess() {
  try {
    // 检查支持
    if (!clipboard.isEnabled) {
      throw new Error('浏览器不支持剪贴板功能');
    }
    
    // 检查权限
    const hasPermission = await clipboard.hasPermission();
    if (!hasPermission) {
      // 请求权限
      const granted = await clipboard.requestPermission();
      if (!granted) {
        throw new Error('用户拒绝剪贴板权限');
      }
    }
    
    return true;
  } catch (error) {
    console.error('剪贴板访问失败:', error);
    return false;
  }
}
```

### 内容验证

```javascript
// 验证剪贴板内容
async function validateClipboardContent() {
  try {
    const text = await clipboard.readText();
    
    // 检查内容长度
    if (text.length > 10000) {
      throw new Error('剪贴板内容过长');
    }
    
    // 检查内容类型
    if (typeof text !== 'string') {
      throw new Error('剪贴板内容类型错误');
    }
    
    return text;
  } catch (error) {
    console.error('剪贴板内容验证失败:', error);
    return '';
  }
}
``` 