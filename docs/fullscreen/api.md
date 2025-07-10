# 全屏功能 API 文档

## 概述

全屏功能提供了跨浏览器兼容的全屏 API 封装，支持页面和元素的全屏操作，自动处理不同浏览器的前缀差异。

## 核心 API

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `isEnabled` | `boolean` | 检查浏览器是否支持全屏功能 |
| `isFullscreen` | `boolean` | 检查当前是否处于全屏状态 |
| `element` | `Element \| undefined` | 获取当前全屏的元素 |

### 方法

#### `request(element?, options?)`

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

#### `exit()`

退出全屏模式。

**返回值：** `Promise<void>`

**示例：**
```javascript
await fullscreen.exit();
```

#### `toggle(element?, options?)`

切换全屏状态。

**参数：**
- `element` (可选): `Element` - 要全屏的元素
- `options` (可选): `FullscreenOptions` - 全屏选项

**返回值：** `Promise<void>`

**示例：**
```javascript
await fullscreen.toggle();
```

### 事件管理

#### `on(event, listener)`

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

#### `off(event, listener)`

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

#### `offAll(event?)`

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

#### `destroy()`

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

interface FullscreenAPI {
  readonly isEnabled: boolean;
  readonly isFullscreen: boolean;
  readonly element: Element | undefined;
  
  request(element?: Element, options?: FullscreenOptions): Promise<void>;
  exit(): Promise<void>;
  toggle(element?: Element, options?: FullscreenOptions): Promise<void>;
  
  on(event: FullscreenEventType, listener: FullscreenEventListener): void;
  off(event: FullscreenEventType, listener: FullscreenEventListener): void;
  offAll(event?: FullscreenEventType): void;
  destroy(): void;
}
```

## 错误处理

### 常见错误类型

```typescript
// 浏览器不支持全屏功能
if (!fullscreen.isEnabled) {
  console.warn('浏览器不支持全屏功能');
}

// 全屏操作失败
try {
  await fullscreen.request();
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('浏览器不支持全屏功能');
  } else if (error.message.includes('not enabled')) {
    console.error('全屏功能未启用');
  } else {
    console.error('全屏操作失败:', error);
  }
}
```

### 错误处理最佳实践

```javascript
async function safeFullscreenToggle() {
  try {
    // 检查支持
    if (!fullscreen.isEnabled) {
      throw new Error('浏览器不支持全屏功能');
    }
    
    // 执行全屏操作
    await fullscreen.toggle();
    
    // 成功处理
    console.log('全屏状态切换成功');
    
  } catch (error) {
    // 错误处理
    console.error('全屏操作失败:', error.message);
    
    // 显示用户友好的错误信息
    showErrorMessage('全屏功能不可用，请检查浏览器设置');
  }
}
```

## 浏览器兼容性

### 支持的浏览器

| 浏览器 | 版本 | 支持状态 | 备注 |
|--------|------|----------|------|
| Chrome | 15+ | ✅ 完全支持 | 标准实现 |
| Firefox | 10+ | ✅ 完全支持 | 标准实现 |
| Safari | 5.1+ | ✅ 桌面版支持 | iPhone 不支持 |
| Edge | 12+ | ✅ 完全支持 | 标准实现 |
| IE | 11+ | ✅ 基本支持 | 需要前缀 |

### 前缀处理

库会自动处理不同浏览器的前缀：

```javascript
// 自动检测并应用正确的前缀
const fullscreenElement = utils.getPrefixedProperty('fullscreenElement');
const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');
```

## 性能优化

### 事件监听器管理

```javascript
// 避免内存泄漏
class FullscreenManager {
  constructor() {
    this.handlers = new Map();
  }
  
  addListener(handler) {
    const wrappedHandler = (event) => {
      handler({
        isFullscreen: fullscreen.isFullscreen,
        element: fullscreen.element,
        event
      });
    };
    
    this.handlers.set(handler, wrappedHandler);
    fullscreen.on('change', wrappedHandler);
  }
  
  removeListener(handler) {
    const wrappedHandler = this.handlers.get(handler);
    if (wrappedHandler) {
      fullscreen.off('change', wrappedHandler);
      this.handlers.delete(handler);
    }
  }
  
  destroy() {
    this.handlers.forEach((wrappedHandler) => {
      fullscreen.off('change', wrappedHandler);
    });
    this.handlers.clear();
  }
}
```

### 懒加载

```javascript
// 按需加载全屏功能
let fullscreenModule = null;

async function getFullscreen() {
  if (!fullscreenModule) {
    fullscreenModule = await import('js-use-core/src/fullscreen');
  }
  return fullscreenModule.default;
}
```

## 调试指南

### 调试模式

```javascript
// 启用调试模式
if (process.env.NODE_ENV === 'development') {
  fullscreen.on('change', (event) => {
    console.log('全屏状态变化:', {
      isFullscreen: fullscreen.isFullscreen,
      element: fullscreen.element,
      event
    });
  });
  
  fullscreen.on('error', (event) => {
    console.error('全屏错误:', event);
  });
}
```

### 常见问题排查

1. **全屏功能不工作**
   - 检查浏览器是否支持
   - 确认在用户交互中调用
   - 检查是否有其他元素已全屏

2. **事件监听器不触发**
   - 确认事件名称正确
   - 检查监听器是否正确添加
   - 验证浏览器兼容性

3. **权限被拒绝**
   - 检查浏览器设置
   - 确认在 HTTPS 环境下使用
   - 验证用户交互触发 