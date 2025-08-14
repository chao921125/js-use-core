# 故障排除指南

本文档帮助你解决使用 js-use-core 时可能遇到的常见问题。

## 🚨 自动初始化相关问题

### 问题：管理器创建后立即使用功能失败

**症状**：
```javascript
const clipboard = new ClipboardManager();
await clipboard.copyText('hello'); // 抛出错误
```

**可能原因**：
1. 浏览器环境不支持相关 API
2. 权限被拒绝
3. 初始化过程中发生错误

**解决方案**：

1. **检查浏览器兼容性**：
```javascript
const clipboard = new ClipboardManager();

try {
  await clipboard.copyText('hello');
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('浏览器不支持剪贴板 API');
    // 使用降级方案
  }
}
```

2. **使用 ready() 方法进行错误诊断**：
```javascript
const clipboard = new ClipboardManager();

try {
  await clipboard.ready(); // 等待初始化完成
  await clipboard.copyText('hello');
} catch (error) {
  console.error('初始化或操作失败:', error);
}
```

3. **启用调试模式**：
```javascript
const clipboard = new ClipboardManager({
  debug: true // 启用详细日志
});
```

### 问题：初始化错误没有被正确处理

**症状**：
- 控制台出现未处理的 Promise 拒绝警告
- 应用程序崩溃

**解决方案**：

1. **全局错误处理**：
```javascript
const clipboard = new ClipboardManager();

clipboard.on('error', (error) => {
  console.error('剪贴板错误:', error);
  // 处理错误，如显示用户友好的消息
});

// 或者使用 try-catch
try {
  await clipboard.copyText('hello');
} catch (error) {
  console.error('操作失败:', error);
}
```

2. **检查初始化状态**：
```javascript
const clipboard = new ClipboardManager();

// 检查状态
const status = clipboard.getStatus();
if (status.initializing) {
  console.log('正在初始化...');
  await clipboard.ready();
}
```

## 🔐 权限相关问题

### 问题：剪贴板权限被拒绝

**症状**：
```
Error: Permission denied for clipboard access
```

**解决方案**：

1. **检查和请求权限**：
```javascript
const clipboard = new ClipboardManager({
  enablePermissionCheck: true
});

async function safeCopy(text) {
  try {
    const permissions = await clipboard.checkPermissions();
    
    if (permissions.write !== 'granted') {
      const granted = await clipboard.requestPermissions();
      if (!granted) {
        alert('需要剪贴板权限才能使用此功能');
        return;
      }
    }
    
    await clipboard.copyText(text);
  } catch (error) {
    console.error('复制失败:', error);
  }
}
```

2. **使用降级方案**：
```javascript
const clipboard = new ClipboardManager({
  enableFallback: true // 启用降级方案
});

// 会自动尝试使用 execCommand 等降级方案
await clipboard.copyText('hello');
```

### 问题：HTTPS 环境要求

**症状**：
```
Error: Clipboard API requires secure context (HTTPS)
```

**解决方案**：

1. **使用 HTTPS**：
   - 在生产环境中使用 HTTPS
   - 在开发环境中使用 `localhost`（被视为安全上下文）

2. **检查安全上下文**：
```javascript
if (!window.isSecureContext) {
  console.warn('剪贴板 API 需要安全上下文 (HTTPS)');
  // 使用降级方案
}
```

## 🌐 浏览器兼容性问题

### 问题：旧浏览器不支持某些 API

**症状**：
```
Error: navigator.clipboard is undefined
```

**解决方案**：

1. **功能检测**：
```javascript
const clipboard = new ClipboardManager();

// 检查功能支持
if (!navigator.clipboard) {
  console.warn('浏览器不支持现代剪贴板 API，将使用降级方案');
}
```

2. **使用 Polyfill**：
```javascript
// 在应用入口添加 polyfill
if (!navigator.clipboard) {
  // 加载 clipboard polyfill
  await import('clipboard-polyfill');
}
```

3. **条件加载**：
```javascript
// 根据浏览器能力选择不同的实现
const ClipboardClass = navigator.clipboard 
  ? ClipboardManager 
  : LegacyClipboardManager;

const clipboard = new ClipboardClass();
```

## 🚀 性能相关问题

### 问题：初始化耗时过长

**症状**：
- 页面加载缓慢
- 功能响应延迟

**解决方案**：

1. **懒加载**：
```javascript
// 延迟创建管理器
let clipboardManager = null;

async function getClipboard() {
  if (!clipboardManager) {
    clipboardManager = new ClipboardManager();
    await clipboardManager.ready();
  }
  return clipboardManager;
}

// 使用时才创建
const clipboard = await getClipboard();
await clipboard.copyText('hello');
```

2. **预加载关键功能**：
```javascript
// 应用启动时预加载
const criticalManagers = {
  clipboard: new ClipboardManager(),
  fullscreen: new FullscreenManager()
};

// 预初始化
Promise.all([
  criticalManagers.clipboard.ready(),
  criticalManagers.fullscreen.ready()
]).then(() => {
  console.log('关键功能已准备就绪');
});
```

3. **使用缓存**：
```javascript
const fontManager = new FontManager({
  cache: true,
  cacheTTL: 5 * 60 * 1000 // 5分钟缓存
});
```

### 问题：内存泄漏

**症状**：
- 页面内存使用持续增长
- 浏览器变慢

**解决方案**：

1. **及时清理资源**：
```javascript
class MyComponent {
  constructor() {
    this.clipboard = new ClipboardManager();
  }
  
  destroy() {
    // 清理资源
    this.clipboard.destroy();
  }
}
```

2. **移除事件监听器**：
```javascript
const clipboard = new ClipboardManager();

const handler = (data) => console.log(data);
clipboard.on('copy', handler);

// 不需要时移除
clipboard.off('copy', handler);
```

## 🔧 配置相关问题

### 问题：配置不生效

**症状**：
- 调试信息没有显示
- 超时设置无效

**解决方案**：

1. **检查配置格式**：
```javascript
// ✅ 正确的配置
const clipboard = new ClipboardManager({
  debug: true,
  timeout: 5000,
  retries: 3
});

// ❌ 错误的配置
const clipboard = new ClipboardManager({
  Debug: true, // 大小写错误
  timeOut: 5000 // 属性名错误
});
```

2. **验证配置值**：
```javascript
const options = {
  debug: process.env.NODE_ENV === 'development',
  timeout: parseInt(process.env.TIMEOUT) || 5000
};

console.log('使用的配置:', options);
const clipboard = new ClipboardManager(options);
```

## 📱 移动端问题

### 问题：移动端功能异常

**症状**：
- 触摸事件不响应
- 全屏功能无效

**解决方案**：

1. **移动端适配**：
```javascript
const device = new DeviceDetector();
await device.ready();

if (device.isMobile) {
  // 移动端特殊处理
  const fullscreen = new FullscreenManager({
    navigationUI: 'hide' // 隐藏导航栏
  });
} else {
  // 桌面端处理
  const fullscreen = new FullscreenManager();
}
```

2. **触摸事件处理**：
```javascript
// 确保在用户交互后调用
document.addEventListener('touchstart', async () => {
  try {
    await clipboard.copyText('hello');
  } catch (error) {
    console.error('移动端复制失败:', error);
  }
}, { once: true });
```

## 🧪 测试环境问题

### 问题：测试环境中功能失败

**症状**：
- Jest 测试失败
- 模拟环境不支持 API

**解决方案**：

1. **模拟浏览器 API**：
```javascript
// 在测试设置中
global.navigator = {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('test')
  }
};

global.document = {
  fullscreenElement: null,
  exitFullscreen: jest.fn()
};
```

2. **使用测试专用配置**：
```javascript
const clipboard = new ClipboardManager({
  debug: false, // 测试时关闭调试
  timeout: 100, // 缩短超时时间
  retries: 0    // 测试时不重试
});
```

## 🔍 调试技巧

### 启用详细日志

```javascript
const clipboard = new ClipboardManager({
  debug: true
});

// 监听所有事件
clipboard.on('*', (event, data) => {
  console.log(`[Clipboard] ${event}:`, data);
});
```

### 检查管理器状态

```javascript
const status = clipboard.getStatus();
console.log('管理器状态:', {
  initialized: status.initialized,
  initializing: status.initializing,
  destroyed: status.destroyed,
  eventListeners: status.eventListeners,
  cacheSize: status.cacheSize
});
```

### 性能监控

```javascript
const clipboard = new ClipboardManager({
  enablePerformanceMonitoring: true
});

clipboard.on('performance', (metrics) => {
  if (metrics.duration > 1000) {
    console.warn('操作耗时过长:', metrics);
  }
});
```

## 📞 获取帮助

如果以上解决方案都无法解决你的问题，请：

1. **查看控制台错误** - 详细的错误信息通常包含解决线索
2. **检查浏览器兼容性** - 确认你的浏览器支持相关 API
3. **查看 GitHub Issues** - 搜索类似问题的解决方案
4. **提交新 Issue** - 提供详细的错误信息和复现步骤
5. **参与讨论** - 在 GitHub Discussions 中寻求帮助

### 提交 Issue 时请包含：

- 浏览器版本和操作系统
- js-use-core 版本
- 完整的错误信息
- 最小复现代码
- 预期行为和实际行为

我们会尽快帮助你解决问题！