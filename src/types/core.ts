/**
 * 核心架构相关类型定义
 * 
 * @description 定义核心基础架构组件的类型接口和枚举
 * @author js-use-core
 * @date 2024-07-20
 */

/**
 * 基础配置接口
 * 所有模块配置的基础接口
 */
export interface BaseOptions {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 操作超时时间（毫秒） */
  timeout?: number;
  /** 失败重试次数 */
  retries?: number;
  /** 是否启用缓存 */
  cache?: boolean;
  /** 缓存过期时间（毫秒） */
  cacheTTL?: number;
}

/**
 * 模块状态枚举
 */
export enum ModuleState {
  /** 未初始化 */
  UNINITIALIZED = 'uninitialized',
  /** 初始化中 */
  INITIALIZING = 'initializing',
  /** 已初始化 */
  INITIALIZED = 'initialized',
  /** 运行中 */
  RUNNING = 'running',
  /** 已暂停 */
  PAUSED = 'paused',
  /** 错误状态 */
  ERROR = 'error',
  /** 已销毁 */
  DESTROYED = 'destroyed'
}

/**
 * 生命周期钩子类型
 */
export type LifecycleHook = () => void | Promise<void>;

/**
 * 生命周期钩子映射
 */
export interface LifecycleHooks {
  /** 初始化前钩子 */
  beforeInit?: LifecycleHook;
  /** 初始化后钩子 */
  afterInit?: LifecycleHook;
  /** 销毁前钩子 */
  beforeDestroy?: LifecycleHook;
  /** 销毁后钩子 */
  afterDestroy?: LifecycleHook;
  /** 错误处理钩子 */
  onError?: (error: Error) => void | Promise<void>;
}

/**
 * 基础管理器接口
 */
export interface IBaseManager<T = any> {
  /** 配置选项 */
  readonly options: T;
  /** 当前状态 */
  readonly state: ModuleState;
  /** 是否已初始化 */
  readonly isInitialized: boolean;
  /** 是否正在运行 */
  readonly isRunning: boolean;
  
  /** 初始化方法 */
  initialize(): Promise<void>;
  /** 启动方法 */
  start?(): Promise<void>;
  /** 停止方法 */
  stop?(): Promise<void>;
  /** 暂停方法 */
  pause?(): Promise<void>;
  /** 恢复方法 */
  resume?(): Promise<void>;
  /** 销毁方法 */
  destroy(): Promise<void>;
  
  /** 添加事件监听器 */
  on(event: string, listener: Function): void;
  /** 移除事件监听器 */
  off(event: string, listener: Function): void;
  /** 触发事件 */
  emit(event: string, ...args: any[]): void;
}

/**
 * 事件监听器类型
 */
export type EventListener = (...args: any[]) => void | Promise<void>;

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
  /** 监听器函数 */
  listener: EventListener;
  /** 是否为一次性监听器 */
  once: boolean;
  /** 优先级 */
  priority?: number;
}

/**
 * 事件发射器接口
 */
export interface IEventEmitter {
  /** 添加事件监听器 */
  on(event: string, listener: EventListener): void;
  /** 添加一次性事件监听器 */
  once(event: string, listener: EventListener): void;
  /** 移除事件监听器 */
  off(event: string, listener?: EventListener): void;
  /** 触发事件 */
  emit(event: string, ...args: any[]): boolean;
  /** 获取事件监听器列表 */
  listeners(event: string): EventListener[];
  /** 获取事件监听器数量 */
  listenerCount(event: string): number;
  /** 移除所有监听器 */
  removeAllListeners(event?: string): void;
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
  /** 调试级别 */
  DEBUG = 0,
  /** 信息级别 */
  INFO = 1,
  /** 警告级别 */
  WARN = 2,
  /** 错误级别 */
  ERROR = 3,
  /** 静默级别 */
  SILENT = 4
}

/**
 * 日志记录接口
 */
export interface LogEntry {
  /** 日志级别 */
  level: LogLevel;
  /** 日志消息 */
  message: string;
  /** 时间戳 */
  timestamp: number;
  /** 模块名称 */
  module?: string;
  /** 额外数据 */
  data?: any;
  /** 错误对象 */
  error?: Error;
}

/**
 * 日志器配置
 */
export interface LoggerConfig {
  /** 日志级别 */
  level?: LogLevel;
  /** 日志前缀 */
  prefix?: string;
  /** 是否启用时间戳 */
  timestamp?: boolean;
  /** 是否启用颜色 */
  colors?: boolean;
  /** 自定义输出函数 */
  output?: (entry: LogEntry) => void;
  /** 最大日志条数 */
  maxEntries?: number;
}

/**
 * 日志器接口
 */
export interface ILogger {
  /** 调试日志 */
  debug(message: string, ...args: any[]): void;
  /** 信息日志 */
  info(message: string, ...args: any[]): void;
  /** 警告日志 */
  warn(message: string, ...args: any[]): void;
  /** 错误日志 */
  error(message: string, error?: Error, ...args: any[]): void;
  /** 设置日志级别 */
  setLevel(level: LogLevel): void;
  /** 获取日志历史 */
  getHistory(): LogEntry[];
  /** 清除日志历史 */
  clearHistory(): void;
}

/**
 * 缓存项接口
 */
export interface CacheEntry<T = any> {
  /** 缓存值 */
  value: T;
  /** 创建时间 */
  createdAt: number;
  /** 过期时间 */
  expireAt: number;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessed: number;
}

/**
 * 缓存项接口（向后兼容）
 */
export interface CacheItem<T = any> extends CacheEntry<T> {
  /** 缓存键 */
  key: string;
  /** 过期时间（向后兼容） */
  expiresAt: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 最大缓存项数量 */
  maxSize?: number;
  /** 默认过期时间（毫秒） */
  defaultTTL?: number;
  /** 是否启用LRU淘汰策略 */
  enableLRU?: boolean;
  /** 清理间隔（毫秒） */
  cleanupInterval?: number;
  /** 是否启用统计 */
  enableStats?: boolean;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 缓存大小 */
  size: number;
  /** 最大大小 */
  maxSize: number;
  /** 命中次数 */
  hits: number;
  /** 未命中次数 */
  misses: number;
  /** 命中率 */
  hitRate: number;
  /** 过期清理次数 */
  evictions: number;
  /** 创建时间 */
  createdAt: number;
}

/**
 * 缓存接口
 */
export interface ICache<T = any> {
  /** 获取缓存值 */
  get(key: string): T | undefined;
  /** 设置缓存值 */
  set(key: string, value: T, ttl?: number): void;
  /** 检查是否存在 */
  has(key: string): boolean;
  /** 删除缓存项 */
  delete(key: string): boolean;
  /** 清空缓存 */
  clear(): void;
  /** 获取缓存大小 */
  size(): number;
  /** 获取所有键 */
  keys(): string[];
  /** 获取统计信息 */
  getStats(): CacheStats;
}

/**
 * 插件接口
 */
export interface IPlugin {
  /** 插件名称 */
  readonly name: string;
  /** 插件版本 */
  readonly version: string;
  /** 插件描述 */
  readonly description?: string;
  /** 插件作者 */
  readonly author?: string;
  /** 依赖的插件 */
  readonly dependencies?: string[];
  
  /** 安装插件 */
  install(manager: IBaseManager): void | Promise<void>;
  /** 卸载插件 */
  uninstall(manager: IBaseManager): void | Promise<void>;
  /** 插件是否已安装 */
  isInstalled(): boolean;
}

/**
 * 插件管理器接口
 */
export interface IPluginManager {
  /** 注册插件 */
  register(plugin: IPlugin): void;
  /** 卸载插件 */
  unregister(name: string): void;
  /** 获取插件 */
  get(name: string): IPlugin | undefined;
  /** 获取所有插件 */
  getAll(): IPlugin[];
  /** 检查插件是否存在 */
  has(name: string): boolean;
  /** 启用插件 */
  enable(name: string): Promise<void>;
  /** 禁用插件 */
  disable(name: string): Promise<void>;
}

/**
 * 性能监控指标
 */
export interface PerformanceMetrics {
  /** 初始化时间（毫秒） */
  initTime: number;
  /** API调用时间（毫秒） */
  apiCallTime: number;
  /** 内存使用量（字节） */
  memoryUsage: number;
  /** 缓存命中率 */
  cacheHitRate: number;
  /** 错误率 */
  errorRate: number;
  /** 吞吐量（操作/秒） */
  throughput: number;
}

/**
 * 性能监控器接口
 */
export interface IPerformanceMonitor {
  /** 开始计时 */
  startTiming(operation: string): void;
  /** 结束计时 */
  endTiming(operation: string): number;
  /** 记录内存使用 */
  recordMemoryUsage(): void;
  /** 记录错误 */
  recordError(error: Error): void;
  /** 获取指标 */
  getMetrics(): PerformanceMetrics;
  /** 重置指标 */
  resetMetrics(): void;
}

/**
 * 配置验证规则
 */
export interface ValidationRule {
  /** 字段名 */
  field: string;
  /** 是否必需 */
  required?: boolean;
  /** 数据类型 */
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  /** 最小值/长度 */
  min?: number;
  /** 最大值/长度 */
  max?: number;
  /** 正则表达式 */
  pattern?: RegExp;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | string;
  /** 默认值 */
  default?: any;
}

/**
 * 配置验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 验证后的配置 */
  config: any;
}

/**
 * 配置验证器接口
 */
export interface IConfigValidator {
  /** 添加验证规则 */
  addRule(rule: ValidationRule): void;
  /** 验证配置 */
  validate(config: any): ValidationResult;
  /** 获取默认配置 */
  getDefaults(): any;
}

/**
 * 通用响应接口
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 错误代码 */
  code?: string | number;
  /** 响应消息 */
  message?: string;
  /** 元数据 */
  metadata?: {
    /** 时间戳 */
    timestamp: number;
    /** 版本 */
    version: string;
    /** 是否来自缓存 */
    cached: boolean;
    /** 请求ID */
    requestId?: string;
  };
}

/**
 * 异步操作状态
 */
export enum AsyncOperationStatus {
  /** 待处理 */
  PENDING = 'pending',
  /** 进行中 */
  RUNNING = 'running',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 已失败 */
  FAILED = 'failed',
  /** 已取消 */
  CANCELLED = 'cancelled'
}

/**
 * 异步操作结果
 */
export interface AsyncOperationResult<T = any> {
  /** 操作ID */
  id: string;
  /** 操作状态 */
  status: AsyncOperationStatus;
  /** 结果数据 */
  result?: T;
  /** 错误信息 */
  error?: Error;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime?: number;
  /** 进度百分比 */
  progress?: number;
}

/**
 * 异步操作管理器接口
 */
export interface IAsyncOperationManager {
  /** 执行异步操作 */
  execute<T>(operation: () => Promise<T>, id?: string): Promise<AsyncOperationResult<T>>;
  /** 取消操作 */
  cancel(id: string): boolean;
  /** 获取操作状态 */
  getStatus(id: string): AsyncOperationStatus | undefined;
  /** 获取操作结果 */
  getResult<T>(id: string): AsyncOperationResult<T> | undefined;
  /** 清理已完成的操作 */
  cleanup(): void;
}