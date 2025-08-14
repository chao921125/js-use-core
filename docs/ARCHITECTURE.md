# 架构设计文档

## 概述

js-use-core 采用模块化、可扩展的架构设计，基于统一的 BaseManager 基类构建各种功能管理器。整个架构遵循单一职责原则、开闭原则和依赖倒置原则，确保代码的可维护性和可扩展性。

## 🏗️ 核心架构

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        js-use-core                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  ClipboardMgr   │  │  FullscreenMgr  │  │  FontManager │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   FileManager   │  │  DeviceDetector │  │  UrlManager  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      BaseManager                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────┐ │
│  │EventEmitter │  │ErrorHandler │  │   Logger    │  │Cache │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Utils & Types                          │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

#### 1. BaseManager（基础管理器）

所有功能管理器的基类，提供统一的生命周期管理、事件系统、错误处理和性能监控。

**核心功能**：
- 自动初始化机制
- 统一的生命周期管理
- 事件发布订阅系统
- 错误处理和重试机制
- 性能监控和缓存
- 配置管理

**设计模式**：
- 模板方法模式：定义初始化和销毁的标准流程
- 观察者模式：事件系统实现
- 策略模式：错误处理策略

#### 2. EventEmitter（事件发射器）

轻量级的事件系统实现，支持事件的发布、订阅和取消订阅。

**特性**：
- 支持一次性监听器
- 支持监听器优先级
- 支持通配符事件监听
- 内存泄漏防护

#### 3. ErrorHandler（错误处理器）

统一的错误处理机制，提供错误分类、重试策略和降级处理。

**错误类型**：
- USER_ERROR：用户操作错误
- SYSTEM_ERROR：系统错误
- NETWORK_ERROR：网络错误
- TIMEOUT_ERROR：超时错误
- PERMISSION_ERROR：权限错误

#### 4. Logger（日志记录器）

统一的日志记录系统，支持不同级别的日志输出和格式化。

**日志级别**：
- ERROR：错误信息
- WARN：警告信息
- INFO：一般信息
- DEBUG：调试信息

#### 5. Cache（缓存管理器）

智能缓存系统，支持 TTL、LRU 策略和内存管理。

**缓存策略**：
- TTL（Time To Live）：基于时间的过期策略
- LRU（Least Recently Used）：最近最少使用策略
- 内存限制：防止内存溢出

## 📦 模块设计

### 1. 剪贴板模块（Clipboard）

**职责**：处理剪贴板相关操作
**核心功能**：
- 文本、HTML、文件的复制和读取
- 权限管理和检查
- 数据验证和清理
- 降级处理

**架构特点**：
- 适配器模式：统一不同浏览器的 API 差异
- 策略模式：不同数据类型的处理策略
- 装饰器模式：权限检查和数据验证

### 2. 全屏模块（Fullscreen）

**职责**：处理全屏相关操作
**核心功能**：
- 元素全屏请求和退出
- 全屏状态监听
- 跨浏览器兼容性处理

**架构特点**：
- 外观模式：简化复杂的全屏 API
- 状态模式：管理全屏状态转换

### 3. 字体模块（Font）

**职责**：处理字体加载和检测
**核心功能**：
- 字体可用性检测
- 动态字体加载
- 字体加载状态监控

**架构特点**：
- 工厂模式：创建不同类型的字体检测器
- 观察者模式：字体加载状态通知

### 4. 文件模块（File）

**职责**：处理文件操作
**核心功能**：
- 文件读取和转换
- Base64 编码解码
- 文件类型检测

**架构特点**：
- 建造者模式：构建复杂的文件处理流程
- 责任链模式：文件处理管道

### 5. 设备检测模块（Device）

**职责**：检测设备信息
**核心功能**：
- 设备类型检测
- 操作系统识别
- 浏览器检测
- 硬件信息获取

**架构特点**：
- 单例模式：全局设备信息管理
- 策略模式：不同检测策略

### 6. URL 模块（URL）

**职责**：处理 URL 操作
**核心功能**：
- URL 解析和构建
- 查询参数处理
- URL 验证

**架构特点**：
- 建造者模式：URL 构建
- 命令模式：URL 操作命令

### 7. User Agent 模块（UA）

**职责**：解析和处理 User Agent
**核心功能**：
- UA 字符串解析
- 版本比较
- 浏览器特性检测

**架构特点**：
- 解释器模式：UA 字符串解析
- 比较器模式：版本比较

## 🔄 自动初始化机制

### 设计原理

自动初始化机制是 v1.3.0 引入的核心特性，旨在简化库的使用方式，提供开箱即用的体验。

### 实现流程

```typescript
class BaseManager {
  private initPromise?: Promise<void>;
  private initializing: boolean = false;
  private initialized: boolean = false;

  constructor(options?: T) {
    this.setupOptions(options);
    this.setupEventSystem();
    this.setupErrorHandling();
    
    // 自动开始初始化
    this.startAutoInitialization();
  }

  private startAutoInitialization(): void {
    this.initializing = true;
    this.initPromise = this.initialize()
      .then(() => {
        this.initialized = true;
        this.initializing = false;
        this.emit('initialized');
      })
      .catch((error) => {
        this.initializing = false;
        this.emit('error', error);
        throw error;
      });
    
    // 防止未处理的 Promise 拒绝
    this.initPromise.catch(() => {});
  }

  protected async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
    } else {
      throw new Error('Initialization failed');
    }
  }

  async ready(): Promise<void> {
    await this.ensureInitialized();
  }
}
```

### 优势

1. **简化使用**：无需手动调用 initialize()
2. **错误处理**：统一的错误处理机制
3. **性能优化**：避免重复初始化
4. **向后兼容**：现有代码无需修改

## 🎯 设计原则

### 1. 单一职责原则（SRP）

每个模块只负责一个特定的功能领域，确保代码的内聚性和可维护性。

### 2. 开闭原则（OCP）

对扩展开放，对修改关闭。通过插件系统和事件机制支持功能扩展。

### 3. 里氏替换原则（LSP）

所有管理器都可以替换为其基类 BaseManager，保证接口的一致性。

### 4. 接口隔离原则（ISP）

提供细粒度的接口，用户只需要依赖他们实际使用的接口。

### 5. 依赖倒置原则（DIP）

高层模块不依赖低层模块，都依赖于抽象。通过接口和抽象类实现解耦。

## 🔌 扩展机制

### 插件系统

```typescript
interface Plugin {
  name: string;
  version: string;
  install(manager: BaseManager): void;
  uninstall(manager: BaseManager): void;
}

class BaseManager {
  private plugins: Map<string, Plugin> = new Map();

  use(plugin: Plugin): this {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already installed`);
    }
    
    plugin.install(this);
    this.plugins.set(plugin.name, plugin);
    return this;
  }

  unuse(pluginName: string): this {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.uninstall(this);
      this.plugins.delete(pluginName);
    }
    return this;
  }
}
```

### 中间件系统

```typescript
type Middleware<T = any> = (
  context: T,
  next: () => Promise<void>
) => Promise<void>;

class BaseManager {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  protected async runMiddlewares(context: any): Promise<void> {
    let index = 0;
    
    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) return;
      const middleware = this.middlewares[index++];
      await middleware(context, next);
    };
    
    await next();
  }
}
```

## 📊 性能优化

### 1. 懒加载

```typescript
class LazyManager {
  private _instance?: ActualManager;

  get instance(): ActualManager {
    if (!this._instance) {
      this._instance = new ActualManager();
    }
    return this._instance;
  }
}
```

### 2. 缓存策略

```typescript
class CacheManager {
  private cache = new Map<string, CacheItem>();
  private maxSize = 100;
  private ttl = 5 * 60 * 1000; // 5分钟

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    item.accessCount++;
    return item.value;
  }
}
```

### 3. 批量操作

```typescript
class BatchProcessor {
  private queue: Task[] = [];
  private processing = false;

  add(task: Task): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...task, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, 10); // 批量处理10个
    
    try {
      await this.processBatch(batch);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }
}
```

## 🧪 测试架构

### 单元测试

```typescript
describe('BaseManager', () => {
  let manager: TestManager;

  beforeEach(() => {
    manager = new TestManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  it('should auto-initialize', async () => {
    expect(manager.getStatus().initializing).toBe(true);
    await manager.ready();
    expect(manager.getStatus().initialized).toBe(true);
  });
});
```

### 集成测试

```typescript
describe('Integration Tests', () => {
  it('should work with multiple managers', async () => {
    const clipboard = new ClipboardManager();
    const fullscreen = new FullscreenManager();
    
    await Promise.all([
      clipboard.ready(),
      fullscreen.ready()
    ]);
    
    // 测试交互功能
  });
});
```

## 🔒 安全考虑

### 1. 输入验证

```typescript
class InputValidator {
  static validateText(text: string): boolean {
    if (typeof text !== 'string') return false;
    if (text.length > 1000000) return false; // 1MB 限制
    return true;
  }

  static sanitizeHTML(html: string): string {
    // HTML 清理逻辑
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}
```

### 2. 权限检查

```typescript
class PermissionManager {
  async checkPermission(permission: string): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: permission });
      return result.state === 'granted';
    } catch (error) {
      return false;
    }
  }
}
```

### 3. 错误边界

```typescript
class ErrorBoundary {
  static wrap<T>(fn: () => T): T | null {
    try {
      return fn();
    } catch (error) {
      console.error('Error caught by boundary:', error);
      return null;
    }
  }
}
```

## 🚀 未来规划

### 1. 微前端支持

- 支持模块联邦
- 独立部署和版本管理
- 跨应用状态共享

### 2. Web Workers 集成

- 后台任务处理
- 大文件处理优化
- 并行计算支持

### 3. WebAssembly 集成

- 性能关键模块的 WASM 实现
- 复杂算法优化
- 跨平台兼容性

### 4. 云端集成

- 云端配置管理
- 远程功能开关
- 使用统计和分析

## 📚 相关文档

- [API 参考](./API_REFERENCE.md)
- [最佳实践](./BEST_PRACTICES.md)
- [自动初始化](./AUTO_INITIALIZATION.md)
- [故障排除](./TROUBLESHOOTING.md)
- [迁移指南](../MIGRATION_GUIDE.md)