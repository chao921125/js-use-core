# 自动初始化功能

## 概述

从 v1.3.0 开始，js-use-core 引入了自动初始化功能，大大简化了库的使用方式。现在所有管理器都会在构造函数中自动开始初始化，用户无需手动调用 `initialize()` 方法。

## 🎉 主要优势

### 1. 开箱即用
```javascript
// 之前：需要手动初始化
const clipboard = new ClipboardManager();
await clipboard.initialize(); // 必须手动调用
await clipboard.copyText('hello');

// 现在：自动初始化
const clipboard = new ClipboardManager();
await clipboard.copyText('hello'); // 直接使用，自动处理初始化
```

### 2. 更简洁的代码
```javascript
// 创建多个管理器
const clipboard = new ClipboardManager();
const fullscreen = new FullscreenManager();
const font = new FontManager();

// 直接使用，无需担心初始化
await clipboard.copyText('text');
await fullscreen.request();
await font.check('Arial');
```

### 3. 更好的错误处理
```javascript
const clipboard = new ClipboardManager();

try {
  await clipboard.copyText('hello');
} catch (error) {
  // 自动处理初始化错误和功能错误
  console.error('操作失败:', error.message);
}
```

## 🔧 工作原理

### 自动初始化流程

1. **构造函数阶段**
   - 创建管理器实例
   - 自动开始初始化过程（异步，不阻塞构造函数）
   - 设置错误处理机制

2. **方法调用阶段**
   - 异步方法自动等待初始化完成
   - 同步方法检查初始化状态
   - 初始化错误在使用时抛出

3. **错误处理**
   - 初始化错误不会导致未处理的 Promise 拒绝
   - 错误在实际使用时抛出，便于调试
   - 提供详细的错误信息和解决方案

### 内部实现

```typescript
export abstract class BaseManager<T extends BaseOptions = BaseOptions> {
  private initPromise?: Promise<void>;
  private initializing: boolean = false;

  constructor(options?: T, moduleName: string = 'BaseManager') {
    // ... 其他初始化代码
    
    // 自动开始初始化
    this.startAutoInitialization();
  }

  private startAutoInitialization(): void {
    this.initPromise = this.initialize().catch((error) => {
      this.logger.error('Auto-initialization failed:', error);
      return Promise.reject(error);
    });
    
    // 防止未处理的 Promise 拒绝
    this.initPromise.catch(() => {});
  }

  protected async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = undefined;
    }
  }
}
```

## 📖 使用指南

### 基本使用

```javascript
import { ClipboardManager, FullscreenManager, FontManager } from 'js-use-core';

// 创建实例，自动开始初始化
const clipboard = new ClipboardManager();
const fullscreen = new FullscreenManager();
const font = new FontManager();

// 直接使用功能
await clipboard.copyText('Hello World');
await fullscreen.request();
await font.check('Arial');
```

### 等待初始化完成

如果需要确保初始化完成，可以使用 `ready()` 方法：

```javascript
const clipboard = new ClipboardManager();

// 等待初始化完成
await clipboard.ready();

// 现在可以安全使用所有功能
await clipboard.copyText('hello');
```

### 批量操作

```javascript
const clipboard = new ClipboardManager();

// 等待初始化后进行批量操作
await clipboard.ready();

// 现在可以进行多个操作，无需每次等待初始化
await clipboard.copyText('text1');
await clipboard.copyText('text2');
await clipboard.copyText('text3');
```

### 错误处理

```javascript
const clipboard = new ClipboardManager();

try {
  // 直接使用，自动处理初始化
  await clipboard.copyText('hello');
} catch (error) {
  if (error.message.includes('initialization')) {
    console.error('初始化失败:', error);
  } else {
    console.error('操作失败:', error);
  }
}
```

### 事件监听

```javascript
const clipboard = new ClipboardManager();

// 立即设置事件监听器
clipboard.on('copy', (data) => {
  console.log('复制了:', data);
});

clipboard.on('error', (error) => {
  console.error('发生错误:', error);
});

// 使用功能（会自动初始化）
await clipboard.copyText('hello');
```

## 🔄 向后兼容性

### 现有代码无需修改

```javascript
// 这样的代码仍然有效
const manager = new ClipboardManager();
await manager.initialize(); // 仍然可以调用，但不是必需的
await manager.copyText('hello');
```

### initialize() 方法的新行为

- 如果已经初始化，立即返回
- 如果正在初始化，等待初始化完成
- 如果未初始化，执行初始化

```javascript
const manager = new ClipboardManager();

// 这些调用都是安全的
await manager.initialize(); // 等待自动初始化完成
await manager.initialize(); // 立即返回，因为已经初始化
await manager.ready();      // 等价于上面的调用
```

## 🚀 性能优化

### 延迟创建

如果不确定是否会使用某个管理器，可以延迟创建：

```javascript
let clipboardManager = null;

async function copyText(text) {
  if (!clipboardManager) {
    clipboardManager = new ClipboardManager();
  }
  return clipboardManager.copyText(text);
}
```

### 预初始化

如果确定会使用某个管理器，可以预先等待初始化：

```javascript
const clipboard = new ClipboardManager();
const font = new FontManager();

// 预初始化
Promise.all([
  clipboard.ready(),
  font.ready()
]).then(() => {
  console.log('所有管理器已准备就绪');
});

// 后续使用时会更快
setTimeout(async () => {
  await clipboard.copyText('hello'); // 快速执行，因为已经初始化
}, 1000);
```

### 状态检查

```javascript
const manager = new ClipboardManager();

// 检查状态
const status = manager.getStatus();
console.log({
  initialized: status.initialized,    // 是否已初始化
  initializing: status.initializing,  // 是否正在初始化
  destroyed: status.destroyed         // 是否已销毁
});
```

## 🐛 常见问题

### Q: 自动初始化会影响性能吗？
A: 不会。初始化是异步的，不会阻塞构造函数或其他操作。只有在实际使用功能时才会等待初始化完成。

### Q: 如何处理初始化错误？
A: 初始化错误会在实际使用功能时抛出，可以通过 try-catch 捕获：

```javascript
const manager = new ClipboardManager();

try {
  await manager.copyText('hello');
} catch (error) {
  console.error('操作失败:', error);
}
```

### Q: 可以禁用自动初始化吗？
A: 目前不支持禁用。如果有特殊需求，可以继承管理器类并重写初始化逻辑。

### Q: 多个实例会重复初始化吗？
A: 每个实例都有自己的初始化状态，但初始化是幂等的，多次调用不会有副作用。

### Q: 如何知道初始化是否完成？
A: 可以使用 `ready()` 方法或检查 `getStatus().initialized`：

```javascript
const manager = new ClipboardManager();

// 方法1：等待初始化
await manager.ready();

// 方法2：检查状态
if (manager.getStatus().initialized) {
  // 已初始化
}
```

## 📊 性能对比

### 代码量减少

```javascript
// 之前：需要 2 行代码
const manager = new ClipboardManager();
await manager.initialize();

// 现在：只需要 1 行代码
const manager = new ClipboardManager();
```

### 错误处理简化

```javascript
// 之前：需要分别处理初始化错误和功能错误
try {
  const manager = new ClipboardManager();
  await manager.initialize();
  await manager.copyText('hello');
} catch (error) {
  // 需要判断是初始化错误还是功能错误
}

// 现在：统一的错误处理
try {
  const manager = new ClipboardManager();
  await manager.copyText('hello');
} catch (error) {
  // 统一处理所有错误
}
```

## 🔮 未来计划

- 支持初始化优先级配置
- 支持初始化依赖管理
- 支持初始化进度回调
- 支持初始化缓存共享

## 📚 相关文档

- [迁移指南](../MIGRATION_GUIDE.md)
- [API 文档](./API.md)
- [最佳实践](./BEST_PRACTICES.md)
- [故障排除](./TROUBLESHOOTING.md)