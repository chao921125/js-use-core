# 自动初始化迁移指南

## 概述

我们已经实现了自动初始化功能，大大简化了库的使用方式。现在所有管理器都会在构造函数中自动开始初始化，用户无需手动调用 `initialize()` 方法。

## 主要变化

### 之前的使用方式
```javascript
// 旧方式：需要手动初始化
const clipboard = new ClipboardManager();
await clipboard.initialize(); // 必须手动调用
await clipboard.copyText('hello');
```

### 现在的使用方式
```javascript
// 新方式：自动初始化
const clipboard = new ClipboardManager();
await clipboard.copyText('hello'); // 直接使用，自动处理初始化
```

## 详细变化

### 1. 构造函数变化
- 所有管理器在构造函数中自动开始初始化
- 初始化过程不会阻塞构造函数的执行
- 初始化错误会在实际使用时抛出，而不是在构造时

### 2. 方法调用变化
- 所有异步方法会自动等待初始化完成
- 同步方法会检查初始化状态，未初始化时抛出错误
- 不再需要手动调用 `initialize()`

### 3. 新增的便捷方法

#### `ready()` 方法
等待初始化完成的便捷方法：
```javascript
const manager = new ClipboardManager();
await manager.ready(); // 等待初始化完成
// 现在可以安全使用所有功能
```

#### 更新的状态信息
`getStatus()` 方法现在包含更多信息：
```javascript
const status = manager.getStatus();
console.log(status);
// {
//   initialized: true,
//   destroyed: false,
//   eventListeners: 2,
//   cacheSize: 5,
//   initializing: false  // 新增
// }
```

## 迁移步骤

### 1. 移除手动初始化调用
```javascript
// 删除这些代码
await manager.initialize();
```

### 2. 直接使用功能
```javascript
// 直接调用方法，无需担心初始化
const result = await manager.someMethod();
```

### 3. 可选：使用 ready() 确保初始化
如果需要确保初始化完成（比如在错误处理中），可以使用 `ready()` 方法：
```javascript
try {
  await manager.ready();
  // 初始化完成，可以安全使用
} catch (error) {
  // 处理初始化错误
}
```

## 向后兼容性

### `initialize()` 方法仍然可用
为了向后兼容，`initialize()` 方法仍然存在，但现在它的行为是：
- 如果已经初始化，立即返回
- 如果正在初始化，等待初始化完成
- 如果未初始化，执行初始化

### 现有代码无需修改
现有的代码仍然可以正常工作：
```javascript
// 这样的代码仍然有效
const manager = new ClipboardManager();
await manager.initialize(); // 仍然可以调用，但不是必需的
await manager.copyText('hello');
```

## 最佳实践

### 1. 简单使用场景
```javascript
// 推荐：直接使用
const clipboard = new ClipboardManager();
await clipboard.copyText('hello');
```

### 2. 需要错误处理的场景
```javascript
// 推荐：使用 ready() 进行错误处理
const clipboard = new ClipboardManager();
try {
  await clipboard.ready();
  await clipboard.copyText('hello');
} catch (error) {
  console.error('初始化或操作失败:', error);
}
```

### 3. 批量操作场景
```javascript
// 推荐：等待初始化后进行批量操作
const clipboard = new ClipboardManager();
await clipboard.ready();

// 现在可以进行多个操作，无需每次等待初始化
await clipboard.copyText('text1');
await clipboard.copyText('text2');
await clipboard.copyText('text3');
```

### 4. 事件监听场景
```javascript
// 推荐：立即设置事件监听器
const clipboard = new ClipboardManager();
clipboard.on('copy', (data) => {
  console.log('复制了:', data);
});

// 然后使用功能（会自动初始化）
await clipboard.copyText('hello');
```

## 性能优化

### 1. 延迟创建
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

### 2. 预初始化
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
```

## 常见问题

### Q: 为什么要改为自动初始化？
A: 为了简化用户体验。大多数用户只想使用功能，不想关心初始化细节。

### Q: 自动初始化会影响性能吗？
A: 不会。初始化只在第一次使用时进行，且是异步的，不会阻塞其他操作。

### Q: 如何处理初始化错误？
A: 初始化错误会在实际使用功能时抛出，可以通过 try-catch 捕获，或者使用 `ready()` 方法提前检查。

### Q: 可以禁用自动初始化吗？
A: 目前不支持禁用。如果有特殊需求，可以继承管理器类并重写初始化逻辑。

### Q: 多个实例会重复初始化吗？
A: 每个实例都有自己的初始化状态，但初始化是幂等的，多次调用不会有副作用。

## 示例代码

查看 `examples/auto-initialization-demo.html` 获取完整的使用示例。

## 测试

运行自动初始化测试：
```bash
npm test -- auto-initialization.test.ts
```