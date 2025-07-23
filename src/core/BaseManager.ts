/**
 * 基础管理器抽象类
 * 
 * @description 所有功能模块的基类，提供统一的生命周期管理、事件处理和错误处理机制
 * @author js-use-core
 * @date 2024-07-20
 */

import { BaseOptions } from '../types/core';
import { ErrorContext, ProcessedError } from '../types/errors';
import { EventEmitter } from './EventEmitter';
import { ErrorHandler } from './ErrorHandler';
import { Logger } from './Logger';
import { Cache } from './Cache';

/**
 * 基础管理器抽象类
 */
export abstract class BaseManager<T extends BaseOptions = BaseOptions> {
  protected options: Required<T>;
  protected eventEmitter: EventEmitter;
  protected errorHandler: ErrorHandler;
  protected logger: Logger;
  protected cache?: Cache;
  protected initialized: boolean = false;
  protected destroyed: boolean = false;

  /**
   * 构造函数
   * @param options 配置选项
   * @param moduleName 模块名称
   */
  constructor(options?: T, moduleName: string = 'BaseManager') {
    // 合并默认配置
    this.options = this.mergeDefaultOptions(options);
    
    // 初始化核心组件
    this.logger = new Logger(moduleName, {
      level: this.options.debug ? 0 : 1, // DEBUG : INFO
      enableConsole: this.options.debug
    });
    
    this.eventEmitter = new EventEmitter();
    this.errorHandler = new ErrorHandler(this.logger);
    
    // 如果启用缓存，初始化缓存管理器
    if (this.options.cache) {
      this.cache = new Cache();
    }

    // 设置错误处理
    this.setupErrorHandling();
  }

  /**
   * 初始化管理器（抽象方法，子类必须实现）
   */
  abstract initialize(): Promise<void>;

  /**
   * 销毁管理器（抽象方法，子类必须实现）
   */
  abstract destroy(): void;

  /**
   * 获取默认配置（抽象方法，子类必须实现）
   */
  protected abstract getDefaultOptions(): Required<T>;

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param options 监听器选项
   */
  on(event: string, listener: (...args: any[]) => void, options?: { once?: boolean; priority?: number }): this {
    this.eventEmitter.on(event, listener, options);
    return this;
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener?: (...args: any[]) => void): this {
    this.eventEmitter.off(event, listener);
    return this;
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  emit(event: string, ...args: any[]): boolean {
    return this.eventEmitter.emit(event, ...args);
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param priority 优先级
   */
  once(event: string, listener: (...args: any[]) => void, priority?: number): this {
    this.eventEmitter.once(event, listener, priority);
    return this;
  }

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   */
  listenerCount(event: string): number {
    return this.eventEmitter.listenerCount(event);
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return this.eventEmitter.eventNames();
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 处理后的错误对象
   */
  protected handleError(error: Error, context?: string): ProcessedError {
    const errorContext: Partial<ErrorContext> = {
      module: this.constructor.name,
      method: context
    };

    const processedError = this.errorHandler.handleError(error, errorContext);
    
    // 触发错误事件
    this.emit('error', processedError);
    
    return processedError;
  }

  /**
   * 验证输入参数
   * @param input 输入参数
   * @param schema 验证模式
   * @returns 是否验证通过
   */
  protected validateInput(input: any, schema: any): boolean {
    try {
      // 简单的类型验证
      if (schema.type) {
        const actualType = typeof input;
        if (actualType !== schema.type) {
          throw this.errorHandler.createError(
            'USER_ERROR' as any,
            `Expected ${schema.type}, got ${actualType}`,
            { context: { method: 'validateInput' } }
          );
        }
      }

      // 必填字段验证
      if (schema.required && (input === null || input === undefined)) {
        throw this.errorHandler.createError(
          'USER_ERROR' as any,
          'Required parameter is missing',
          { context: { method: 'validateInput' } }
        );
      }

      // 数组验证
      if (schema.isArray && !Array.isArray(input)) {
        throw this.errorHandler.createError(
          'USER_ERROR' as any,
          'Expected array',
          { context: { method: 'validateInput' } }
        );
      }

      // 对象属性验证
      if (schema.properties && typeof input === 'object' && input !== null) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (!this.validateInput(input[key], propSchema)) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      this.handleError(error as Error, 'validateInput');
      return false;
    }
  }

  /**
   * 安全执行异步操作
   * @param operation 异步操作函数
   * @param context 上下文信息
   * @param retries 重试次数
   * @returns 操作结果
   */
  protected async safeExecute<R>(
    operation: () => Promise<R>,
    context: string,
    retries?: number
  ): Promise<R> {
    const maxRetries = retries ?? this.options.retries ?? 0;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 设置超时
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(this.errorHandler.createError(
              'TIMEOUT_ERROR' as any,
              `Operation timed out after ${this.options.timeout}ms`,
              { context: { method: context } }
            ));
          }, this.options.timeout);
        });

        const result = await Promise.race([operation(), timeoutPromise]);
        
        // 如果是重试成功，记录日志
        if (attempt > 0) {
          this.logger.info(`Operation succeeded after ${attempt} retries`, { context });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // 如果是最后一次尝试或错误不可恢复，直接抛出
        if (attempt === maxRetries || !this.errorHandler.isRecoverableError(lastError)) {
          throw this.handleError(lastError, context);
        }
        
        // 等待一段时间后重试
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // 指数退避，最大5秒
        this.logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`, {
          context,
          error: lastError.message
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 这里不应该到达，但为了类型安全
    throw this.handleError(lastError!, context);
  }

  /**
   * 获取缓存值
   * @param key 缓存键
   * @returns 缓存值
   */
  protected getCached<R>(key: string): R | undefined {
    return this.cache?.get(key);
  }

  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间
   */
  protected setCached<R>(key: string, value: R, ttl?: number): void {
    this.cache?.set(key, value, ttl);
  }

  /**
   * 获取或设置缓存值
   * @param key 缓存键
   * @param factory 工厂函数
   * @param ttl 过期时间
   * @returns 缓存值
   */
  protected async getOrSetCached<R>(
    key: string,
    factory: () => Promise<R>,
    ttl?: number
  ): Promise<R> {
    if (this.cache) {
      return this.cache.getOrSet(key, factory, ttl);
    }
    return factory();
  }

  /**
   * 检查是否已初始化
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw this.errorHandler.createError(
        'SYSTEM_ERROR' as any,
        'Manager not initialized. Call initialize() first.',
        { context: { method: 'ensureInitialized' } }
      );
    }
  }

  /**
   * 检查是否已销毁
   */
  protected ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw this.errorHandler.createError(
        'SYSTEM_ERROR' as any,
        'Manager has been destroyed and cannot be used.',
        { context: { method: 'ensureNotDestroyed' } }
      );
    }
  }

  /**
   * 获取管理器状态
   */
  getStatus(): {
    initialized: boolean;
    destroyed: boolean;
    eventListeners: number;
    cacheSize?: number;
  } {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      eventListeners: this.eventNames().reduce((total, event) => total + this.listenerCount(event), 0),
      cacheSize: this.cache?.size()
    };
  }

  /**
   * 更新配置
   * @param newOptions 新的配置选项
   */
  updateOptions(newOptions: Partial<T>): void {
    this.options = { ...this.options, ...newOptions };
    
    // 更新日志级别
    if (newOptions.debug !== undefined) {
      this.logger.setLevel(newOptions.debug ? 0 : 1);
      this.logger.setConsoleOutput(newOptions.debug);
    }
    
    // 触发配置更新事件
    this.emit('optionsUpdated', this.options);
  }

  /**
   * 合并默认配置
   * @param options 用户配置
   * @returns 合并后的配置
   */
  private mergeDefaultOptions(options?: T): Required<T> {
    const defaultOptions = this.getDefaultOptions();
    return { ...defaultOptions, ...options } as Required<T>;
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 监听未捕获的Promise拒绝
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(new Error(event.reason), 'unhandledrejection');
      });
    } else if (typeof process !== 'undefined') {
      process.on('unhandledRejection', (reason) => {
        this.handleError(new Error(String(reason)), 'unhandledRejection');
      });
    }
  }

  /**
   * 基础销毁逻辑
   */
  protected baseDestroy(): void {
    if (this.destroyed) {
      return;
    }

    // 触发销毁前事件
    this.emit('beforeDestroy');

    // 清理事件监听器
    this.eventEmitter.removeAllListeners();

    // 停止缓存清理
    this.cache?.destroy();

    // 停止日志清理
    this.logger.clear();

    // 标记为已销毁
    this.destroyed = true;
    this.initialized = false;

    // 触发销毁后事件
    this.emit('destroyed');
  }
}