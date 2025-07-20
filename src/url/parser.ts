/**
 * URL 解析相关功能
 */

import type { UrlParseResult, UrlInfo, QueryParams } from './types';

/**
 * 将URL转为对象 (从 core.ts 迁移过来)
 * @param url URL字符串
 * @returns 解析后的对象
 */
export function urlToObj(url: string): UrlParseResult {
  const obj: UrlParseResult = {};
  if (!url) return obj;

  // 提取查询参数
  url.replace(/([^?=&#]+)=([^?=&#]+)/g, (_, key, value) => {
    // 解码URI组件，处理编码字符
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
    return '';
  });

  // 提取哈希值
  url.replace(/#([^?=&#]+)/g, (_, hash) => {
    obj["HASH"] = decodeURIComponent(hash);
    return '';
  });
  
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
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key !== 'HASH') {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
  }
  
  const queryString = parts.length > 0 ? `${prefix}${parts.join('&')}` : '';
  const hash = obj.HASH ? `#${encodeURIComponent(obj.HASH)}` : '';
  
  return `${queryString}${hash}`;
}

/**
 * 解析查询字符串为对象
 * @param search 查询字符串 (可以包含或不包含 '?')
 * @returns 查询参数对象
 */
export function parseQuery(search: string): QueryParams {
  const params: QueryParams = {};
  if (!search) return params;

  // 移除开头的 '?'
  const queryString = search.startsWith('?') ? search.slice(1) : search;
  
  if (!queryString) return params;

  // 分割参数
  const pairs = queryString.split('&');
  
  for (const pair of pairs) {
    const [key, value = ''] = pair.split('=');
    if (key) {
      const decodedKey = decodeURIComponent(key);
      const decodedValue = decodeURIComponent(value);
      
      // 处理数组参数 (如: key[]=value1&key[]=value2)
      if (decodedKey.endsWith('[]')) {
        const arrayKey = decodedKey.slice(0, -2);
        if (!params[arrayKey]) {
          params[arrayKey] = [];
        }
        (params[arrayKey] as string[]).push(decodedValue);
      } else if (params[decodedKey]) {
        // 如果键已存在，转换为数组
        if (Array.isArray(params[decodedKey])) {
          (params[decodedKey] as string[]).push(decodedValue);
        } else {
          params[decodedKey] = [params[decodedKey] as string, decodedValue];
        }
      } else {
        params[decodedKey] = decodedValue;
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
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      // 处理数组参数
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(item))}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  
  const queryString = parts.join('&');
  return queryString ? (prefix ? `?${queryString}` : queryString) : '';
}