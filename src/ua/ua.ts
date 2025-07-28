/**
 * UA 主要功能类 - 重构版本
 * 继承 BaseManager，统一架构模式
 */

import type { ParsedUA, UAParserPlugin, ModernBrowserOptions, UAGenerateSpec, UAManagerOptions } from './types';
import { parseUA } from './parser';
import { generateUA } from './generator';
import { satisfies, isModern } from './comparator';
import { BaseManager } from '../core/BaseManager';
import { BaseOptions } from '../types/core';

/**
 * UA 管理器选项接口
 */
export interface UAManagerOptions extends BaseOptions {
  enablePlugins?: boolean;
  maxCacheSize?: number;
  parseTimeout?: number;
}

/**
 * UA 管理器类 - 继承 BaseManager
 */
export class UAManager extends BaseManager<UAManagerOptions> {
  private plugins: UAParserPlugin[] = [];
  private parseStats = {
    totalParses: 0,
    cacheHits: 0,
    pluginHits: 0,
    errors: 0
  };

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options?: UAManagerOptions) {
    super(options, 'UAManager');
  }

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<UAManagerOptions> {
    return {
      debug: false,
      timeout: 5000,
      retries: 1,
      cache: true,
      enablePlugins: true,
      maxCacheSize: 1000,
      parseTimeout: 1000
    };
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.logger.info('Initializing UA Manager');

      // 初始化缓存
      if (this.options.cache && this.cache) {
        this.cache.updateConfig({ maxSize: this.options.maxCacheSize });
      }

      // 触发初始化完成事件
      this.emit('initialized');
      this.initialized = true;

      this.logger.info('UA Manager initialized successfully');
    } catch (error) {
      const processedError = this.handleError(error as Error, 'initialize');
      throw processedError;
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.logger.info('Destroying UA Manager');

    // 清理插件
    this.plugins = [];

    // 重置统计信息
    this.parseStats = {
      totalParses: 0,
      cacheHits: 0,
      pluginHits: 0,
      errors: 0
    };

    // 调用基类销毁方法
    this.baseDestroy();

    this.logger.info('UA Manager destroyed');
  }

  /**
   * 解析 UA 字符串，支持缓存和插件
   * @param ua UA 字符串，默认使用当前环境的 UA
   * @returns 只读的解析结果
   */
  async parse(ua?: string): Promise<Readonly<ParsedUA>> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    const userAgent = ua || this.getCurrentUA();
    this.parseStats.totalParses++;

    try {
      // 检查缓存
      if (this.options.cache && this.cache) {
        const cached = this.getCached<ParsedUA>(`parse:${userAgent}`);
        if (cached) {
          this.parseStats.cacheHits++;
          this.emit('cacheHit', { ua: userAgent });
          return cached;
        }
      }

      // 使用安全执行包装解析逻辑
      const result = await this.safeExecute(
        () => this.performParse(userAgent),
        'parse'
      );

      // 冻结对象确保不可变
      const frozenResult = this.freezeParseResult(result);

      // 缓存结果
      if (this.options.cache && this.cache) {
        this.setCached(`parse:${userAgent}`, frozenResult, 5 * 60 * 1000); // 5分钟缓存
      }

      this.emit('parsed', { ua: userAgent, result: frozenResult });
      return frozenResult;

    } catch (error) {
      this.parseStats.errors++;
      this.emit('parseError', { ua: userAgent, error });
      throw error;
    }
  }

  /**
   * 同步解析 UA 字符串（向后兼容）
   * @param ua UA 字符串
   * @returns 解析结果
   */
  parseSync(ua?: string): Readonly<ParsedUA> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    const userAgent = ua || this.getCurrentUA();
    this.parseStats.totalParses++;

    try {
      // 检查缓存
      if (this.options.cache && this.cache) {
        const cached = this.getCached<ParsedUA>(`parse:${userAgent}`);
        if (cached) {
          this.parseStats.cacheHits++;
          return cached;
        }
      }

      const result = this.performParseSync(userAgent);
      const frozenResult = this.freezeParseResult(result);

      // 缓存结果
      if (this.options.cache && this.cache) {
        this.setCached(`parse:${userAgent}`, frozenResult, 5 * 60 * 1000);
      }

      return frozenResult;

    } catch (error) {
      this.parseStats.errors++;
      throw this.handleError(error as Error, 'parseSync');
    }
  }

  /**
   * 生成 UA 字符串
   * @param spec 生成规格
   * @returns UA 字符串
   */
  stringify(spec: UAGenerateSpec): string {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    try {
      this.validateInput(spec, {
        type: 'object',
        required: true,
        properties: {
          browser: { type: 'object' },
          engine: { type: 'object' },
          os: { type: 'object' },
          device: { type: 'object' },
          cpu: { type: 'object' }
        }
      });

      const result = generateUA(spec);
      this.emit('generated', { spec, result });
      return result;

    } catch (error) {
      throw this.handleError(error as Error, 'stringify');
    }
  }

  /**
   * 检查是否满足语义化版本规则
   * @param ua UA 对象或字符串
   * @param range 版本范围字符串
   * @returns 是否满足条件
   */
  satisfies(ua: ParsedUA | string, range: string): boolean {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    try {
      this.validateInput(range, { type: 'string', required: true });
      return satisfies(ua, range);
    } catch (error) {
      throw this.handleError(error as Error, 'satisfies');
    }
  }

  /**
   * 判断是否为现代浏览器
   * @param ua UA 对象
   * @param opts 检查选项
   * @returns 是否为现代浏览器
   */
  isModern(ua: ParsedUA, opts?: ModernBrowserOptions): boolean {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    try {
      this.validateInput(ua, { type: 'object', required: true });
      return isModern(ua, opts);
    } catch (error) {
      throw this.handleError(error as Error, 'isModern');
    }
  }

  /**
   * 获取当前运行时 UA
   * @returns 当前环境的解析结果
   */
  async getCurrent(): Promise<ParsedUA> {
    return this.parse();
  }

  /**
   * 注册解析插件
   * @param plugin 插件对象
   */
  use(plugin: UAParserPlugin): void {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    if (!this.options.enablePlugins) {
      this.logger.warn('Plugins are disabled');
      return;
    }

    try {
      this.validateInput(plugin, {
        type: 'object',
        required: true,
        properties: {
          test: { type: 'function', required: true },
          parse: { type: 'function', required: true }
        }
      });

      this.plugins.push(plugin);
      this.emit('pluginRegistered', { plugin });
      this.logger.info(`Plugin registered: ${plugin.constructor.name || 'Anonymous'}`);

    } catch (error) {
      throw this.handleError(error as Error, 'use');
    }
  }

  /**
   * 移除插件
   * @param plugin 插件对象
   */
  removePlugin(plugin: UAParserPlugin): boolean {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    const index = this.plugins.indexOf(plugin);
    if (index !== -1) {
      this.plugins.splice(index, 1);
      this.emit('pluginRemoved', { plugin });
      return true;
    }
    return false;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalParses: number;
    cacheHits: number;
    pluginHits: number;
    errors: number;
    cacheHitRate: number;
    pluginCount: number;
    cacheSize?: number;
  } {
    const cacheHitRate = this.parseStats.totalParses > 0 
      ? this.parseStats.cacheHits / this.parseStats.totalParses 
      : 0;

    return {
      ...this.parseStats,
      cacheHitRate,
      pluginCount: this.plugins.length,
      cacheSize: this.cache?.size()
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.parseStats = {
      totalParses: 0,
      cacheHits: 0,
      pluginHits: 0,
      errors: 0
    };
    this.emit('statsReset');
  }

  /**
   * 获取当前环境的 UA 字符串
   * @returns UA 字符串
   */
  getCurrentUA(): string {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    return '';
  }

  /**
   * 执行实际的解析逻辑（异步版本）
   */
  private async performParse(userAgent: string): Promise<ParsedUA> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(this.errorHandler.createError(
          'TIMEOUT_ERROR' as any,
          `UA parsing timed out after ${this.options.parseTimeout}ms`,
          { context: { method: 'performParse' } }
        ));
      }, this.options.parseTimeout);

      try {
        const result = this.performParseSync(userAgent);
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * 执行实际的解析逻辑（同步版本）
   */
  private performParseSync(userAgent: string): ParsedUA {
    // 尝试插件解析
    if (this.options.enablePlugins) {
      for (const plugin of this.plugins) {
        try {
          if (plugin.test(userAgent)) {
            const pluginResult = plugin.parse(userAgent);
            if (pluginResult) {
              this.parseStats.pluginHits++;
              // 合并插件结果和默认解析结果
              const defaultResult = parseUA(userAgent);
              this.emit('pluginHit', { plugin, ua: userAgent });
              return { ...defaultResult, ...pluginResult };
            }
          }
        } catch (error) {
          this.logger.warn(`Plugin error: ${(error as Error).message}`, { plugin });
        }
      }
    }

    // 使用默认解析器
    return parseUA(userAgent);
  }

  /**
   * 冻结解析结果确保不可变
   */
  private freezeParseResult(result: ParsedUA): Readonly<ParsedUA> {
    return Object.freeze({
      browser: Object.freeze(result.browser),
      engine: Object.freeze(result.engine),
      os: Object.freeze(result.os),
      device: Object.freeze(result.device),
      cpu: Object.freeze(result.cpu),
      isBot: result.isBot,
      isWebView: result.isWebView,
      isHeadless: result.isHeadless,
      source: result.source
    }) as Readonly<ParsedUA>;
  }
}

/**
 * 全局 UA 管理器实例
 */
let globalUAManager: UAManager | null = null;

/**
 * UA 工具类 - 保持向后兼容的静态接口
 */
export class UA {
  /**
   * 获取全局管理器实例
   */
  private static getManager(): UAManager {
    if (!globalUAManager) {
      globalUAManager = new UAManager();
      // 自动初始化
      globalUAManager.initialize().catch(error => {
        console.error('Failed to initialize global UA manager:', error);
      });
    }
    return globalUAManager;
  }

  /**
   * 解析 UA 字符串，缓存命中则直接返回
   * @param ua UA 字符串，默认使用当前环境的 UA
   * @returns 只读的解析结果
   */
  static parse(ua?: string): Readonly<ParsedUA> {
    return UA.getManager().parseSync(ua);
  }

  /**
   * 异步解析 UA 字符串
   * @param ua UA 字符串，默认使用当前环境的 UA
   * @returns 只读的解析结果
   */
  static async parseAsync(ua?: string): Promise<Readonly<ParsedUA>> {
    return UA.getManager().parse(ua);
  }

  /**
   * 生成 UA 字符串
   * @param spec 生成规格
   * @returns UA 字符串
   */
  static stringify(spec: UAGenerateSpec): string {
    return UA.getManager().stringify(spec);
  }

  /**
   * 检查是否满足语义化版本规则
   * @param ua UA 对象或字符串
   * @param range 版本范围字符串
   * @returns 是否满足条件
   */
  static satisfies(ua: ParsedUA | string, range: string): boolean {
    return UA.getManager().satisfies(ua, range);
  }

  /**
   * 判断是否为现代浏览器
   * @param ua UA 对象
   * @param opts 检查选项
   * @returns 是否为现代浏览器
   */
  static isModern(ua: ParsedUA, opts?: ModernBrowserOptions): boolean {
    return UA.getManager().isModern(ua, opts);
  }

  /**
   * 获取当前运行时 UA
   * @returns 当前环境的解析结果
   */
  static get current(): ParsedUA {
    return UA.parse();
  }

  /**
   * 注册解析插件
   * @param plugin 插件对象
   */
  static use(plugin: UAParserPlugin): void {
    UA.getManager().use(plugin);
  }

  /**
   * 清除解析缓存
   */
  static clearCache(): void {
    const manager = UA.getManager();
    if (manager.cache) {
      manager.cache.clear();
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存大小
   */
  static getCacheSize(): number {
    return UA.getManager().cache?.size() || 0;
  }

  /**
   * 获取统计信息
   */
  static getStats() {
    return UA.getManager().getStats();
  }

  /**
   * 获取当前环境的 UA 字符串
   * @returns UA 字符串
   */
  static getCurrentUA(): string {
    return UA.getManager().getCurrentUA();
  }

  /**
   * 重置全局管理器（主要用于测试）
   */
  static resetManager(): void {
    if (globalUAManager) {
      globalUAManager.destroy();
      globalUAManager = null;
    }
  }
}

/**
 * 便捷函数：解析当前环境 UA
 * @returns 当前环境的解析结果
 */
export function getCurrentUA(): Readonly<ParsedUA> {
  return UA.current;
}

/**
 * 便捷函数：解析指定 UA
 * @param ua UA 字符串
 * @returns 解析结果
 */
export function parseUserAgent(ua: string): Readonly<ParsedUA> {
  return UA.parse(ua);
}

/**
 * 便捷函数：检查版本兼容性
 * @param range 版本范围
 * @param ua 可选的 UA 字符串
 * @returns 是否兼容
 */
export function isCompatible(range: string, ua?: string): boolean {
  return UA.satisfies(ua || UA.getCurrentUA(), range);
}

// 默认导出
export default {
  UA,
  getCurrentUA,
  parseUserAgent,
  isCompatible
};