/**
 * URL 解析相关功能
 */

import type { UrlParseResult, UrlInfo, QueryParams } from './types';
import { decodeUrl, encodeUrl } from './utils';

/**
 * 将URL转为对象 (从 core.ts 迁移过来)
 * @param url URL字符串
 * @returns 解析后的对象
 */
export function urlToObj(url: string): UrlParseResult {
  const obj: UrlParseResult = {};
  if (!url || typeof url !== 'string') return obj;

  try {
    // 提取查询参数 - 改进的正则表达式，更准确地匹配参数
    const queryMatches = url.match(/[?&]([^=&#]+)=([^&#]*)/g);
    if (queryMatches) {
      queryMatches.forEach(match => {
        const [, key, value] = match.match(/[?&]([^=&#]+)=([^&#]*)/) || [];
        if (key) {
          try {
            obj[decodeUrl(key, true)] = decodeUrl(value || '', true);
          } catch {
            // 如果解码失败，使用原始值
            obj[key] = value || '';
          }
        }
      });
    }

    // 提取哈希值 - 改进的哈希提取
    const hashMatch = url.match(/#([^?]*)/);
    if (hashMatch && hashMatch[1]) {
      try {
        obj["HASH"] = decodeUrl(hashMatch[1], true);
      } catch {
        obj["HASH"] = hashMatch[1];
      }
    }
  } catch (error) {
    console.warn('Error parsing URL:', error);
  }
  
  return obj;
}

/**
 * 将对象转为URL查询字符串
 * @param obj 要转换的对象
 * @param prefix 前缀，默认为'?'
 * @returns URL查询字符串
 */
export function objToUrl(obj: Record<string, any>, prefix: string = '?'): string {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return '';
  }

  const parts: string[] = [];
  
  try {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && key !== 'HASH') {
        const value = obj[key];
        if (value !== undefined && value !== null) {
          const encodedKey = encodeUrl(String(key), true);
          const encodedValue = encodeUrl(String(value), true);
          parts.push(`${encodedKey}=${encodedValue}`);
        }
      }
    }
  } catch (error) {
    console.warn('Error converting object to URL:', error);
    return '';
  }
  
  const queryString = parts.length > 0 ? `${prefix}${parts.join('&')}` : '';
  const hash = obj.HASH ? `#${encodeUrl(String(obj.HASH), true)}` : '';
  
  return `${queryString}${hash}`;
}

/**
 * 解析查询字符串为对象
 * @param search 查询字符串 (可以包含或不包含 '?')
 * @returns 查询参数对象
 */
export function parseQuery(search: string): QueryParams {
  const params: QueryParams = {};
  if (!search || typeof search !== 'string') return params;

  try {
    // 移除开头的 '?'
    const queryString = search.startsWith('?') ? search.slice(1) : search;
    
    if (!queryString) return params;

    // 使用 URLSearchParams 进行更可靠的解析
    const urlParams = new URLSearchParams(queryString);
    
    // 收集所有键值对
    const keyValueMap = new Map<string, string[]>();
    
    for (const [key, value] of urlParams.entries()) {
      if (!keyValueMap.has(key)) {
        keyValueMap.set(key, []);
      }
      keyValueMap.get(key)!.push(value);
    }
    
    // 处理结果
    for (const [key, values] of keyValueMap.entries()) {
      if (key.endsWith('[]')) {
        // 数组参数
        const arrayKey = key.slice(0, -2);
        params[arrayKey] = values;
      } else if (values.length === 1) {
        // 单个值
        params[key] = values[0];
      } else {
        // 多个值，转换为数组
        params[key] = values;
      }
    }
  } catch (error) {
    console.warn('Error parsing query string:', error);
    
    // 降级到手动解析
    const queryString = search.startsWith('?') ? search.slice(1) : search;
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      if (!pair) continue;
      
      const equalIndex = pair.indexOf('=');
      const key = equalIndex !== -1 ? pair.slice(0, equalIndex) : pair;
      const value = equalIndex !== -1 ? pair.slice(equalIndex + 1) : '';
      
      if (key) {
        try {
          const decodedKey = decodeUrl(key, true);
          const decodedValue = decodeUrl(value, true);
          
          if (decodedKey.endsWith('[]')) {
            const arrayKey = decodedKey.slice(0, -2);
            if (!params[arrayKey]) {
              params[arrayKey] = [];
            }
            (params[arrayKey] as string[]).push(decodedValue);
          } else if (params[decodedKey]) {
            if (Array.isArray(params[decodedKey])) {
              (params[decodedKey] as string[]).push(decodedValue);
            } else {
              params[decodedKey] = [params[decodedKey] as string, decodedValue];
            }
          } else {
            params[decodedKey] = decodedValue;
          }
        } catch {
          // 如果解码失败，使用原始值
          params[key] = value;
        }
      }
    }
  }
  
  return params;
}

/**
 * 将查询参数对象转换为查询字符串
 * @param params 查询参数对象
 * @param prefix 是否添加 '?' 前缀
 * @returns 查询字符串
 */
export function stringifyQuery(params: QueryParams, prefix: boolean = true): string {
  if (!params || typeof params !== 'object') return '';
  
  const parts: string[] = [];
  
  try {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      
      if (Array.isArray(value)) {
        // 处理数组参数 - 不编码方括号以保持兼容性
        for (const item of value) {
          if (item !== undefined && item !== null) {
            const encodedKey = encodeURIComponent(key) + '[]';
            const encodedValue = encodeURIComponent(String(item));
            parts.push(`${encodedKey}=${encodedValue}`);
          }
        }
      } else {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        parts.push(`${encodedKey}=${encodedValue}`);
      }
    }
    
    const queryString = parts.join('&');
    return queryString ? (prefix ? `?${queryString}` : queryString) : '';
  } catch (error) {
    console.warn('Error stringifying query params:', error);
    return '';
  }
}

/**
 * 高性能查询参数解析器
 * 专门用于处理大量查询参数的场景
 */
export class QueryParser {
  private cache = new Map<string, QueryParams>();
  private maxCacheSize = 100;

  /**
   * 解析查询字符串（带缓存）
   */
  parse(search: string): QueryParams {
    if (!search) return {};
    
    if (this.cache.has(search)) {
      return this.cache.get(search)!;
    }
    
    const result = parseQuery(search);
    
    // 简单的LRU缓存
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(search, result);
    return result;
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}