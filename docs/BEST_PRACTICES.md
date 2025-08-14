# 最佳实践指南

## 🎯 自动初始化最佳实践

### 1. 直接使用模式（推荐）

```javascript
// ✅ 推荐：直接使用，简洁明了
const clipboard = new ClipboardManager();
await clipboard.copyText('hello');

// ❌ 不推荐：不必要的手动初始化
const clipboard = new ClipboardManager();
await clipboard.initialize(); // 多余的步骤
await clipboard.copyText('hello');
```

### 2. 错误处理模式

```javascript
// ✅ 推荐：统一的错误处理
const clipboard = new ClipboardManager();
try {
  await clipboard.copyText('hello');
} catch (error) {
  console.error('操作失败:', error.message);
  // 根据错误类型进行相应处理
}

// ✅ 推荐：使用 ready() 进行预检查
const clipboard = new ClipboardManager();
try {
  await clipboard.ready(); // 确保初始化成功
  await clipboard.copyText('hello');
} catch (error) {
  if (error.message.includes('initialization')) {
    console.error('初始化失败，请检查浏览器兼容性');
  } else {
    console.error('复制失败:', error.message);
  }
}
```

### 3. 批量操作模式

```javascript
// ✅ 推荐：预初始化后批量操作
const clipboard = new ClipboardManager();
await clipboard.ready(); // 等待初始化完成

// 现在可以快速执行多个操作
await clipboard.copyText('text1');
await clipboard.copyText('text2');
await clipboard.copyText('text3');

// ❌ 不推荐：每次操作都等待初始化
const clipboard = new ClipboardManager();
await clipboard.copyText('text1'); // 等待初始化
await clipboard.copyText('text2'); // 已初始化，快速执行
await clipboard.copyText('text3'); // 已初始化，快速执行
```

## 🏗️ 架构设计最佳实践

### 1. 单例模式

```javascript
// ✅ 推荐：创建全局单例
class AppClipboard {
  private static instance: ClipboardManager | null = null;
  
  static getInstance(): ClipboardManager {
    if (!this.instance) {
      this.instance = new ClipboardManager({
        enablePermissionCheck: true,
        enableFallback: true,
        debug: process.env.NODE_ENV === 'development'
      });
    }
    return this.instance;
  }
}

// 使用
const clipboard = AppClipboard.getInstance();
await clipboard.copyText('hello');
```

### 2. 工厂模式

```javascript
// ✅ 推荐：使用工厂函数
export function createClipboardManager(options?: ClipboardManagerOptions) {
  return new ClipboardManager({
    enablePermissionCheck: true,
    enableFallback: true,
    debug: false,
    ...options
  });
}

// 使用
const clipboard = createClipboardManager({ debug: true });
await clipboard.copyText('hello');
```

### 3. 依赖注入模式

```javascript
// ✅ 推荐：依赖注入
class DocumentService {
  constructor(
    private clipboard: ClipboardManager,
    private fullscreen: FullscreenManager
  ) {}
  
  async copyDocumentContent(content: string) {
    await this.clipboard.copyText(content);
  }
  
  async enterFullscreenMode(element: Element) {
    await this.fullscreen.request(element);
  }
}

// 使用
const service = new DocumentService(
  new ClipboardManager(),
  new FullscreenManager()
);
```

## 🔧 配置最佳实践

### 1. 环境相关配置

```javascript
// ✅ 推荐：根据环境配置
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const clipboard = new ClipboardManager({
  debug: isDevelopment,
  timeout: isProduction ? 10000 : 5000,
  retries: isProduction ? 3 : 1,
  cache: isProduction,
  enablePermissionCheck: true
});
```

### 2. 功能特性配置

```javascript
// ✅ 推荐：根据功能需求配置
const clipboard = new ClipboardManager({
  // 基础配置
  debug: false,
  timeout: 5000,
  retries: 2,
  
  // 剪贴板特定配置
  enablePermissionCheck: true,
  enableFallback: true,
  enableDataValidation: true,
  
  // 性能配置
  cache: true,
  cacheTTL: 30000
});
```

### 3. 安全配置

```javascript
// ✅ 推荐：安全相关配置
const clipboard = new ClipboardManager({
  enablePermissionCheck: true,
  enableDataValidation: true,
  maxDataSize: 1024 * 1024, // 1MB
  allowedMimeTypes: ['text/plain', 'text/html'],
  sanitizeHTML: true
});
```

## 🎭 事件处理最佳实践

### 1. 事件监听器管理

```javascript
// ✅ 推荐：统一的事件管理
class ClipboardService {
  private clipboard: ClipboardManager;
  private listeners: Map<string, Function[]> = new Map();
  
  constructor() {
    this.clipboard = new ClipboardManager();
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    this.clipboard.on('copy', this.handleCopy.bind(this));
    this.clipboard.on('paste', this.handlePaste.bind(this));
    this.clipboard.on('error', this.handleError.bind(this));
  }
  
  private handleCopy(data: any) {
    console.log('复制成功:', data);
    this.notifyListeners('copy', data);
  }
  
  private handlePaste(data: any) {
    console.log('粘贴成功:', data);
    this.notifyListeners('paste', data);
  }
  
  private handleError(error: Error) {
    console.error('剪贴板错误:', error);
    this.notifyListeners('error', error);
  }
  
  // 公共 API
  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }
  
  private notifyListeners(event: string, data: any) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
  
  destroy() {
    this.clipboard.destroy();
    this.listeners.clear();
  }
}
```

### 2. 错误事件处理

```javascript
// ✅ 推荐：全局错误处理
const clipboard = new ClipboardManager();

clipboard.on('error', (error) => {
  // 记录错误
  console.error('Clipboard error:', error);
  
  // 发送错误报告
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false
    });
  }
  
  // 用户友好的错误提示
  showUserFriendlyError(error);
});

function showUserFriendlyError(error: Error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('permission')) {
    alert('需要剪贴板权限才能使用此功能');
  } else if (message.includes('not supported')) {
    alert('您的浏览器不支持此功能');
  } else {
    alert('操作失败，请重试');
  }
}
```

## 🚀 性能优化最佳实践

### 1. 懒加载模式

```javascript
// ✅ 推荐：按需创建管理器
class FeatureManager {
  private _clipboard?: ClipboardManager;
  private _fullscreen?: FullscreenManager;
  private _font?: FontManager;
  
  get clipboard() {
    if (!this._clipboard) {
      this._clipboard = new ClipboardManager();
    }
    return this._clipboard;
  }
  
  get fullscreen() {
    if (!this._fullscreen) {
      this._fullscreen = new FullscreenManager();
    }
    return this._fullscreen;
  }
  
  get font() {
    if (!this._font) {
      this._font = new FontManager();
    }
    return this._font;
  }
}

// 使用
const features = new FeatureManager();
await features.clipboard.copyText('hello'); // 只有在使用时才创建
```

### 2. 预加载模式

```javascript
// ✅ 推荐：预加载关键功能
class AppManager {
  private clipboard: ClipboardManager;
  private fullscreen: FullscreenManager;
  private initPromise: Promise<void>;
  
  constructor() {
    this.clipboard = new ClipboardManager();
    this.fullscreen = new FullscreenManager();
    
    // 预加载关键功能
    this.initPromise = this.preloadFeatures();
  }
  
  private async preloadFeatures() {
    await Promise.all([
      this.clipboard.ready(),
      this.fullscreen.ready()
    ]);
    console.log('关键功能已预加载完成');
  }
  
  async ready() {
    await this.initPromise;
  }
  
  // 公共 API
  async copyText(text: string) {
    await this.ready(); // 确保预加载完成
    return this.clipboard.copyText(text);
  }
}
```

### 3. 缓存优化

```javascript
// ✅ 推荐：合理使用缓存
const fontManager = new FontManager({
  cache: true,
  cacheTTL: 5 * 60 * 1000, // 5分钟缓存
  maxCacheSize: 100
});

// 批量检查字体，利用缓存
const fonts = ['Arial', 'Helvetica', 'Times New Roman'];
const results = await Promise.all(
  fonts.map(font => fontManager.check(font))
);
```

## 🧪 测试最佳实践

### 1. 单元测试

```javascript
// ✅ 推荐：测试自动初始化
describe('ClipboardManager', () => {
  it('should auto-initialize on first use', async () => {
    const manager = new ClipboardManager();
    
    // 直接使用，应该自动初始化
    try {
      await manager.copyText('test');
      expect(manager.getStatus().initialized).toBe(true);
    } catch (error) {
      // 在测试环境中可能会失败，但不应该是初始化错误
      expect(error.message).not.toContain('not initialized');
    }
  });
  
  it('should handle initialization errors gracefully', async () => {
    const manager = new ClipboardManager();
    
    // 模拟初始化失败
    jest.spyOn(manager, 'initialize').mockRejectedValue(new Error('Init failed'));
    
    try {
      await manager.copyText('test');
    } catch (error) {
      expect(error.message).toContain('Init failed');
    }
  });
});
```

### 2. 集成测试

```javascript
// ✅ 推荐：测试完整流程
describe('Clipboard Integration', () => {
  it('should work end-to-end', async () => {
    const manager = new ClipboardManager();
    
    // 等待初始化完成
    await manager.ready();
    
    // 测试复制
    await manager.copyText('test text');
    
    // 测试读取
    const text = await manager.readText();
    expect(text).toBe('test text');
  });
});
```

## 🔒 安全最佳实践

### 1. 权限检查

```javascript
// ✅ 推荐：检查权限
const clipboard = new ClipboardManager({
  enablePermissionCheck: true
});

async function safeCopy(text: string) {
  try {
    // 检查权限
    const permissions = await clipboard.checkPermissions();
    if (permissions.write !== 'granted') {
      const granted = await clipboard.requestPermissions();
      if (!granted) {
        throw new Error('用户拒绝了剪贴板权限');
      }
    }
    
    await clipboard.copyText(text);
  } catch (error) {
    console.error('复制失败:', error);
  }
}
```

### 2. 数据验证

```javascript
// ✅ 推荐：验证输入数据
const clipboard = new ClipboardManager({
  enableDataValidation: true,
  maxDataSize: 1024 * 1024 // 1MB 限制
});

async function safeCopyWithValidation(text: string) {
  // 验证输入
  if (!text || typeof text !== 'string') {
    throw new Error('无效的文本数据');
  }
  
  if (text.length > 1000000) { // 1M 字符
    throw new Error('文本数据过大');
  }
  
  // 清理数据
  const cleanText = text.trim().replace(/[\x00-\x1F\x7F]/g, '');
  
  await clipboard.copyText(cleanText);
}
```

## 📱 跨平台最佳实践

### 1. 环境检测

```javascript
// ✅ 推荐：检测运行环境
function createClipboardManager() {
  const isBrowser = typeof window !== 'undefined';
  const isSecureContext = isBrowser && window.isSecureContext;
  
  return new ClipboardManager({
    enablePermissionCheck: isBrowser && isSecureContext,
    enableFallback: isBrowser,
    debug: !isBrowser || process.env.NODE_ENV === 'development'
  });
}
```

### 2. 功能降级

```javascript
// ✅ 推荐：优雅降级
class ClipboardService {
  private manager: ClipboardManager;
  
  constructor() {
    this.manager = new ClipboardManager({
      enableFallback: true
    });
  }
  
  async copyText(text: string): Promise<boolean> {
    try {
      await this.manager.copyText(text);
      return true;
    } catch (error) {
      console.warn('剪贴板复制失败，尝试降级方案:', error);
      return this.fallbackCopy(text);
    }
  }
  
  private fallbackCopy(text: string): boolean {
    try {
      // 创建临时文本区域
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (error) {
      console.error('降级复制也失败了:', error);
      return false;
    }
  }
}
```

## 📊 监控和调试最佳实践

### 1. 性能监控

```javascript
// ✅ 推荐：性能监控
const clipboard = new ClipboardManager({
  debug: true,
  enablePerformanceMonitoring: true
});

clipboard.on('performance', (metrics) => {
  console.log('性能指标:', metrics);
  
  // 发送到监控系统
  if (metrics.duration > 1000) {
    console.warn('操作耗时过长:', metrics);
  }
});
```

### 2. 调试信息

```javascript
// ✅ 推荐：详细的调试信息
const clipboard = new ClipboardManager({
  debug: process.env.NODE_ENV === 'development'
});

// 监听所有事件进行调试
if (process.env.NODE_ENV === 'development') {
  clipboard.on('*', (event, data) => {
    console.log(`[Clipboard] ${event}:`, data);
  });
}
```

## 🔄 生命周期管理最佳实践

### 1. 资源清理

```javascript
// ✅ 推荐：及时清理资源
class ComponentWithClipboard {
  private clipboard: ClipboardManager;
  
  constructor() {
    this.clipboard = new ClipboardManager();
  }
  
  // React/Vue 组件卸载时调用
  componentWillUnmount() {
    this.cleanup();
  }
  
  // 手动清理
  cleanup() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  }
}
```

### 2. 状态管理

```javascript
// ✅ 推荐：状态管理
class ClipboardState {
  private manager: ClipboardManager;
  private status: 'idle' | 'copying' | 'reading' | 'error' = 'idle';
  
  constructor() {
    this.manager = new ClipboardManager();
  }
  
  async copyText(text: string) {
    this.status = 'copying';
    try {
      await this.manager.copyText(text);
      this.status = 'idle';
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
  
  getStatus() {
    return {
      managerStatus: this.manager.getStatus(),
      operationStatus: this.status
    };
  }
}
```

这些最佳实践将帮助你更好地使用 js-use-core 库，充分利用自动初始化功能，编写更健壮、高性能的代码。