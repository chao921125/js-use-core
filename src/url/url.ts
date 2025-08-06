/**
 * URL 主要功能类
 */

import type { UrlInfo, QueryParams, UrlBuildOptions, UrlValidateOptions, UrlManagerOptions } from './types';
import { parseQuery, stringifyQuery } from './parser';
import { normalizeUrl, addQuery, removeQuery, isValidUrl } from './utils';
import { BaseManager } from '../core/BaseManager';
import { ErrorType } from '../core/types';

/**
 * URL 管理类
 * 继承 BaseManager，提供统一的架构和错误处理
 */
export class UrlManager extends BaseManager<UrlManagerOptions> {
  private _url: string;
  private _urlObj: URL;

  constructor(options?: UrlManagerOptions | string) {
    // 支持直接传入 URL 字符串的便捷构造方式
    const normalizedOptions = typeof options === 'string' 
      ? { url: options } 
      : options;
      
    super(normalizedOptions, 'UrlManager');
    
    this._url = normalizedOptions?.url || (typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    
    try {
      this._urlObj = new URL(this._url);
    } catch (error) {
      // 如果 URL 无效，使用默认值并记录错误
      this._urlObj = new URL('http://localhost');
      this.handleError(error as Error, 'constructor');
    }

    // 自动初始化以保持向后兼容性
    this.initialize().catch(error => {
      this.handleError(error as Error, 'auto-initialize');
    });
  }

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<UrlManagerOptions> {
    return {
      debug: false,
      timeout: 5000,
      retries: 1,
      cache: true,
      url: typeof window !== 'undefined' ? window.location.href : 'http://localhost',
      validateUrls: true,
      allowedProtocols: ['http:', 'https:'],
      maxUrlLength: 2048
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
      // 验证初始URL
      if (this.options.validateUrls && !this.isValidUrl(this._url)) {
        throw this.errorHandler.createError(
          ErrorType.VALIDATION_ERROR,
          `Invalid initial URL: ${this._url}`,
          { context: { method: 'initialize' } }
        );
      }

      this.initialized = true;
      this.emit('initialized');
      this.logger.info('UrlManager initialized successfully');
    } catch (error) {
      throw this.handleError(error as Error, 'initialize');
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.baseDestroy();
    this.logger.info('UrlManager destroyed');
  }

  /**
   * 获取完整的 URL 信息
   */
  getUrlInfo(): UrlInfo {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    try {
      const cacheKey = `urlInfo:${this._url}`;
      return this.getCached(cacheKey) || (() => {
        const info: UrlInfo = {
          url: this._urlObj.href,
          protocol: this._urlObj.protocol,
          hostname: this._urlObj.hostname,
          port: this._urlObj.port,
          origin: this._urlObj.origin,
          pathname: this._urlObj.pathname,
          search: this._urlObj.search,
          hash: this._urlObj.hash,
          host: this._urlObj.host
        };
        this.setCached(cacheKey, info, 60000); // 缓存1分钟
        return info;
      })();
    } catch (error) {
      throw this.handleError(error as Error, 'getUrlInfo');
    }
  }

  /**
   * 获取查询参数
   */
  getQuery(): QueryParams {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    try {
      const cacheKey = `query:${this._urlObj.search}`;
      return this.getCached(cacheKey) || (() => {
        const params = parseQuery(this._urlObj.search);
        this.setCached(cacheKey, params, 30000); // 缓存30秒
        return params;
      })();
    } catch (error) {
      throw this.handleError(error as Error, 'getQuery');
    }
  }

  /**
   * 设置查询参数
   */
  setQuery(params: QueryParams): this {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    if (!this.validateInput(params, { type: 'object', required: true })) {
      throw this.errorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Invalid query parameters',
        { context: { method: 'setQuery', input: params } }
      );
    }

    try {
      const queryString = stringifyQuery(params, false);
      this._urlObj.search = queryString;
      this._updateUrl();
      
      this.emit('queryChanged', params);
      return this;
    } catch (error) {
      throw this.handleError(error as Error, 'setQuery');
    }
  }

  /**
   * 添加查询参数
   */
  addQuery(params: QueryParams): this {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    if (!this.validateInput(params, { type: 'object', required: true })) {
      throw this.errorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Invalid query parameters',
        { context: { method: 'addQuery', input: params } }
      );
    }

    try {
      this._url = addQuery(this._url, params);
      this._urlObj = new URL(this._url);
      this._validateUrl();
      
      this.emit('queryAdded', params);
      return this;
    } catch (error) {
      throw this.handleError(error as Error, 'addQuery');
    }
  }

  /**
   * 移除查询参数
   */
  removeQuery(keys: string | string[]): this {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    if (!keys) {
      throw this.errorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Keys parameter is required',
        { context: { method: 'removeQuery' } }
      );
    }

    try {
      this._url = removeQuery(this._url, keys);
      this._urlObj = new URL(this._url);
      
      this.emit('queryRemoved', keys);
      return this;
    } catch (error) {
      throw this.handleError(error as Error, 'removeQuery');
    }
  }

  /**
   * 设置哈希值
   */
  setHash(hash: string): this {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    if (!this.validateInput(hash, { type: 'string', required: true })) {
      throw this.errorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Hash must be a string',
        { context: { method: 'setHash', input: hash } }
      );
    }

    try {
      this._urlObj.hash = hash.startsWith('#') ? hash : `#${hash}`;
      this._updateUrl();
      
      this.emit('hashChanged', hash);
      return this;
    } catch (error) {
      throw this.handleError(error as Error, 'setHash');
    }
  }

  /**
   * 设置路径
   */
  setPathname(pathname: string): this {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    if (!this.validateInput(pathname, { type: 'string', required: true })) {
      throw this.errorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Pathname must be a string',
        { context: { method: 'setPathname', input: pathname } }
      );
    }

    try {
      this._urlObj.pathname = pathname;
      this._updateUrl();
      
      this.emit('pathnameChanged', pathname);
      return this;
    } catch (error) {
      throw this.handleError(error as Error, 'setPathname');
    }
  }

  /**
   * 获取当前 URL
   */
  toString(): string {
    this.ensureNotDestroyed();
    return this._url;
  }

  /**
   * 重置为新的 URL
   */
  reset(url: string): this {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    if (!this.validateInput(url, { type: 'string', required: true })) {
      throw this.errorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'URL must be a string',
        { context: { method: 'reset', input: url } }
      );
    }

    try {
      if (this.options.validateUrls && !this.isValidUrl(url)) {
        throw this.errorHandler.createError(
          ErrorType.VALIDATION_ERROR,
          `Invalid URL: ${url}`,
          { context: { method: 'reset', input: url } }
        );
      }

      this._url = url;
      this._urlObj = new URL(url);
      this._validateUrl();
      
      this.emit('urlReset', url);
      return this;
    } catch (error) {
      throw this.handleError(error as Error, 'reset');
    }
  }

  /**
   * 验证 URL 是否有效
   */
  isValidUrl(url: string): boolean {
    try {
      return isValidUrl(url, {
        protocols: this.options.allowedProtocols,
        requireProtocol: true,
        allowLocalhost: true,
        allowIp: true
      });
    } catch (error) {
      this.handleError(error as Error, 'isValidUrl');
      return false;
    }
  }

  /**
   * 更新内部 URL 并验证
   */
  private _updateUrl(): void {
    this._url = this._urlObj.href;
    this._validateUrl();
  }

  /**
   * 验证当前 URL
   */
  private _validateUrl(): void {
    if (this.options.validateUrls) {
      if (this._url.length > this.options.maxUrlLength) {
        throw this.errorHandler.createError(
          ErrorType.VALIDATION_ERROR,
          `URL length exceeds maximum allowed length of ${this.options.maxUrlLength}`,
          { context: { method: '_validateUrl' } }
        );
      }

      if (!this.options.allowedProtocols.includes(this._urlObj.protocol)) {
        throw this.errorHandler.createError(
          ErrorType.VALIDATION_ERROR,
          `Protocol ${this._urlObj.protocol} is not allowed`,
          { context: { method: '_validateUrl' } }
        );
      }
    }
  }
}

/**
 * 获取当前页面的 URL 信息
 * @param url 可选的 URL，默认使用当前页面 URL
 * @returns URL 信息对象
 */
export function getUrl(url?: string): UrlInfo {
  const manager = new UrlManager(url);
  return manager.getUrlInfo();
}

/**
 * 构建 URL
 * @param options 构建选项
 * @returns 构建的 URL
 */
export function buildUrl(options: UrlBuildOptions): string {
  const { base = '', pathname = '', query, hash } = options;
  
  let url = base;
  
  // 添加路径
  if (pathname) {
    url = url.endsWith('/') ? url + pathname.replace(/^\//, '') : url + '/' + pathname.replace(/^\//, '');
  }
  
  // 添加查询参数
  if (query) {
    const queryString = stringifyQuery(query);
    if (queryString) {
      url += queryString;
    }
  }
  
  // 添加哈希
  if (hash) {
    url += hash.startsWith('#') ? hash : `#${hash}`;
  }
  
  return normalizeUrl(url);
}

/**
 * 获取当前页面查询参数
 * @returns 查询参数对象
 */
export function getQuery(): QueryParams {
  if (typeof window === 'undefined') return {};
  return parseQuery(window.location.search);
}

/**
 * 获取当前页面哈希值
 * @returns 哈希值 (不包含 #)
 */
export function getHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash.slice(1);
}

// 默认导出
export default {
  UrlManager,
  getUrl,
  buildUrl,
  getQuery,
  getHash
};