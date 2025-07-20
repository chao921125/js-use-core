/**
 * URL 主要功能类
 */

import type { UrlInfo, QueryParams, UrlBuildOptions } from './types';
import { parseQuery, stringifyQuery } from './parser';
import { normalizeUrl, addQuery, removeQuery } from './utils';

/**
 * URL 管理类
 */
export class UrlManager {
  private _url: string;
  private _urlObj: URL;

  constructor(url?: string) {
    this._url = url || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      this._urlObj = new URL(this._url);
    } catch {
      // 如果 URL 无效，使用默认值
      this._urlObj = new URL('http://localhost');
    }
  }

  /**
   * 获取完整的 URL 信息
   */
  getUrlInfo(): UrlInfo {
    return {
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
  }

  /**
   * 获取查询参数
   */
  getQuery(): QueryParams {
    return parseQuery(this._urlObj.search);
  }

  /**
   * 设置查询参数
   */
  setQuery(params: QueryParams): this {
    const queryString = stringifyQuery(params, false);
    this._urlObj.search = queryString;
    this._url = this._urlObj.href;
    return this;
  }

  /**
   * 添加查询参数
   */
  addQuery(params: QueryParams): this {
    this._url = addQuery(this._url, params);
    this._urlObj = new URL(this._url);
    return this;
  }

  /**
   * 移除查询参数
   */
  removeQuery(keys: string | string[]): this {
    this._url = removeQuery(this._url, keys);
    this._urlObj = new URL(this._url);
    return this;
  }

  /**
   * 设置哈希值
   */
  setHash(hash: string): this {
    this._urlObj.hash = hash.startsWith('#') ? hash : `#${hash}`;
    this._url = this._urlObj.href;
    return this;
  }

  /**
   * 设置路径
   */
  setPathname(pathname: string): this {
    this._urlObj.pathname = pathname;
    this._url = this._urlObj.href;
    return this;
  }

  /**
   * 获取当前 URL
   */
  toString(): string {
    return this._url;
  }

  /**
   * 重置为新的 URL
   */
  reset(url: string): this {
    this._url = url;
    this._urlObj = new URL(url);
    return this;
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