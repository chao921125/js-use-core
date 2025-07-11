# 工具函数 API 文档

[English](./api.en.md) | 简体中文

## 概述

工具函数模块提供了常用的 DOM 操作和浏览器兼容性处理函数，为其他功能模块提供基础支持。

## 核心 API

### 方法

#### `isSupported(feature)`

检查浏览器是否支持指定功能。

**参数：**
- `feature`: `string` - 功能名称，如 'fullscreen', 'clipboard'

**返回值：** `boolean`

**示例：**
```javascript
// 检查全屏支持
if (utils.isSupported('fullscreen')) {
  console.log('浏览器支持全屏功能');
}

// 检查剪贴板支持
if (utils.isSupported('clipboard')) {
  console.log('浏览器支持剪贴板功能');
}
```

#### `getPrefixedProperty(property)`

获取带浏览器前缀的属性名。

**参数：**
- `property`: `string` - 属性名

**返回值：** `string | undefined`

**示例：**
```javascript
// 获取全屏元素属性名
const fullscreenElement = utils.getPrefixedProperty('fullscreenElement');
// 返回: 'fullscreenElement' 或 'webkitFullscreenElement' 等

// 获取全屏方法名
const requestFullscreen = utils.getPrefixedProperty('requestFullscreen');
// 返回: 'requestFullscreen' 或 'webkitRequestFullscreen' 等
```

#### `getPrefixedMethod(element, method)`

获取带浏览器前缀的方法。

**参数：**
- `element`: `Element` - DOM 元素
- `method`: `string` - 方法名

**返回值：** `Function | undefined`

**示例：**
```javascript
const element = document.documentElement;
const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');

if (requestFullscreen) {
  requestFullscreen.call(element);
}
```

#### `addEventListener(element, event, handler, options?)`

添加事件监听器，支持带前缀的事件名。

**参数：**
- `element`: `EventTarget` - 事件目标
- `event`: `string` - 事件名
- `handler`: `EventListener` - 事件处理函数
- `options` (可选): `AddEventListenerOptions` - 事件选项

**返回值：** `void`

**示例：**
```javascript
// 监听全屏变化事件
utils.addEventListener(document, 'fullscreenchange', () => {
  console.log('全屏状态变化');
});

// 监听剪贴板变化事件
utils.addEventListener(navigator.clipboard, 'clipboardchange', () => {
  console.log('剪贴板内容变化');
});
```

#### `removeEventListener(element, event, handler, options?)`

移除事件监听器，支持带前缀的事件名。

**参数：**
- `element`: `EventTarget` - 事件目标
- `event`: `string` - 事件名
- `handler`: `EventListener` - 事件处理函数
- `options` (可选): `EventListenerOptions` - 事件选项

**返回值：** `void`

**示例：**
```javascript
const handler = () => console.log('全屏变化');
utils.addEventListener(document, 'fullscreenchange', handler);
utils.removeEventListener(document, 'fullscreenchange', handler);
```

#### `createEventEmitter()`

创建事件发射器实例。

**返回值：** `EventEmitter`

**示例：**
```javascript
const emitter = utils.createEventEmitter();

// 添加事件监听器
emitter.on('change', (data) => {
  console.log('事件触发:', data);
});

// 触发事件
emitter.emit('change', { status: 'success' });

// 移除事件监听器
emitter.off('change');

// 销毁事件发射器
emitter.destroy();
```

## 类型定义

```typescript
interface EventEmitter {
  on(event: string, listener: Function): void;
  off(event: string, listener?: Function): void;
  emit(event: string, ...args: any[]): void;
  destroy(): void;
}

type SupportedFeature = 'fullscreen' | 'clipboard';

interface UtilsAPI {
  isSupported(feature: SupportedFeature): boolean;
  getPrefixedProperty(property: string): string | undefined;
  getPrefixedMethod(element: Element, method: string): Function | undefined;
  addEventListener(element: EventTarget, event: string, handler: EventListener, options?: AddEventListenerOptions): void;
  removeEventListener(element: EventTarget, event: string, handler: EventListener, options?: EventListenerOptions): void;
  createEventEmitter(): EventEmitter;
}
```

## 浏览器兼容性处理

### 前缀检测

```javascript
// 自动检测浏览器前缀
const prefixes = ['', 'webkit', 'moz', 'ms', 'o'];

function getPrefixedProperty(property) {
  for (const prefix of prefixes) {
    const prefixedProperty = prefix ? `${prefix}${property.charAt(0).toUpperCase()}${property.slice(1)}` : property;
    if (prefixedProperty in document) {
      return prefixedProperty;
    }
  }
  return undefined;
}
```

### 功能检测

```javascript
// 功能检测实现
function isSupported(feature) {
  switch (feature) {
    case 'fullscreen':
      return !!(document.fullscreenEnabled || 
                document.webkitFullscreenEnabled || 
                document.mozFullScreenEnabled || 
                document.msFullscreenEnabled);
    
    case 'clipboard':
      return !!(navigator.clipboard && 
                navigator.clipboard.writeText && 
                navigator.clipboard.readText);
    
    default:
      return false;
  }
}
```

## 事件管理

### 事件发射器实现

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
  }
  
  off(event, listener) {
    if (!this.events.has(event)) return;
    
    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  
  emit(event, ...args) {
    if (!this.events.has(event)) return;
    
    const listeners = this.events.get(event);
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }
  
  destroy() {
    this.events.clear();
  }
}
```

### 事件监听器管理

```javascript
// 安全的事件监听器管理
class EventManager {
  constructor() {
    this.handlers = new Map();
  }
  
  addListener(element, event, handler, options) {
    const key = `${element}-${event}`;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    
    this.handlers.get(key).add(handler);
    utils.addEventListener(element, event, handler, options);
  }
  
  removeListener(element, event, handler) {
    const key = `${element}-${event}`;
    if (this.handlers.has(key)) {
      this.handlers.get(key).delete(handler);
      utils.removeEventListener(element, event, handler);
    }
  }
  
  removeAllListeners(element, event) {
    const key = `${element}-${event}`;
    if (this.handlers.has(key)) {
      const handlers = this.handlers.get(key);
      handlers.forEach(handler => {
        utils.removeEventListener(element, event, handler);
      });
      handlers.clear();
    }
  }
  
  destroy() {
    this.handlers.forEach((handlers, key) => {
      const [element, event] = key.split('-');
      handlers.forEach(handler => {
        utils.removeEventListener(element, event, handler);
      });
    });
    this.handlers.clear();
  }
}
```

## 性能优化

### 缓存机制

```javascript
// 缓存前缀检测结果
const prefixCache = new Map();

function getCachedPrefixedProperty(property) {
  if (prefixCache.has(property)) {
    return prefixCache.get(property);
  }
  
  const result = getPrefixedProperty(property);
  prefixCache.set(property, result);
  return result;
}
```

### 懒加载

```javascript
// 按需加载工具函数
let utilsModule = null;

async function getUtils() {
  if (!utilsModule) {
    utilsModule = await import('js-use-core/src/utils');
  }
  return utilsModule.default;
}
```

## 错误处理

### 安全的方法调用

```javascript
// 安全的方法调用
function safeMethodCall(element, method, ...args) {
  const prefixedMethod = utils.getPrefixedMethod(element, method);
  if (prefixedMethod) {
    try {
      return prefixedMethod.call(element, ...args);
    } catch (error) {
      console.error(`Method call failed: ${method}`, error);
      throw error;
    }
  } else {
    throw new Error(`Method not supported: ${method}`);
  }
}
```

### 错误边界

```javascript
// 错误边界处理
function withErrorBoundary(fn, fallback) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.error('Function execution failed:', error);
      if (fallback) {
        return fallback.apply(this, args);
      }
      throw error;
    }
  };
}
```

## 调试指南

### 调试模式

```javascript
// 启用调试模式
if (process.env.NODE_ENV === 'development') {
  // 添加调试信息
  const originalAddEventListener = utils.addEventListener;
  utils.addEventListener = function(element, event, handler, options) {
    console.log(`Adding event listener: ${event} on`, element);
    return originalAddEventListener.call(this, element, event, handler, options);
  };
}
```

### 性能监控

```javascript
// 性能监控
function withPerformanceMonitoring(fn, name) {
  return function(...args) {
    const start = performance.now();
    try {
      const result = fn.apply(this, args);
      const end = performance.now();
      console.log(`${name} execution time: ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${name} failed after ${end - start}ms:`, error);
      throw error;
    }
  };
}
```

## 最佳实践

### 功能检测

```javascript
// 在使用功能前先检查支持
if (utils.isSupported('fullscreen')) {
  // 安全使用全屏功能
} else {
  // 提供降级方案
  console.warn('浏览器不支持全屏功能');
}
```

### 动态 API 获取

```javascript
// 动态获取 API 方法，避免直接使用可能不存在的属性
const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');
if (requestFullscreen) {
  requestFullscreen.call(element);
}
```

### 事件监听器管理

```javascript
// 使用工具函数添加和移除事件监听器
const handler = () => console.log('事件触发');
utils.addEventListener(element, 'eventname', handler);

// 在组件销毁时清理
utils.removeEventListener(element, 'eventname', handler);
```

### 事件发射器使用

```javascript
// 创建事件发射器进行事件管理
const emitter = utils.createEventEmitter();

// 添加监听器
emitter.on('custom-event', (data) => {
  console.log('自定义事件:', data);
});

// 触发事件
emitter.emit('custom-event', { message: 'Hello' });

// 清理资源
emitter.destroy();
``` 