/**
 * URL 工具函数
 */

import type { UrlValidateOptions, QueryParams } from './types';

/**
 * 验证 URL 是否有效
 * @param url URL 字符串
 * @param options 验证选项
 * @returns 是否有效
 */
export function isValidUrl(url: string, options: UrlValidateOptions = {}): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const {
    protocols = ['http:', 'https:'],
    requireProtocol = true,
    allowLocalhost = true,
    allowIp = true
  } = options;
  
  try {
    // 如果不要求协议且URL不包含协议，添加默认协议进行验证
    let testUrl = url;
    if (!requireProtocol && !url.includes('://')) {
      testUrl = `https://${url}`;
    }
    
    const urlObj = new URL(testUrl);
    
    // 检查协议
    if (!protocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // 检查本地主机
    if (!allowLocalhost && (
      urlObj.hostname === 'localhost' ||
      urlObj.hostname === '127.0.0.1' ||
      urlObj.hostname.endsWith('.local')
    )) {
      return false;
    }
    
    // 检查 IP 地址
    if (!allowIp && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(urlObj.hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * 规范化 URL
 * @param url URL 字符串
 * @param base 基础 URL
 * @returns 规范化后的 URL
 */
export function normalizeUrl(url: string, base?: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url, base);
    return urlObj.href;
  } catch {
    return url;
  }
}

/**
 * 连接 URL 路径
 * @param base 基础路径
 * @param paths 要连接的路径
 * @returns 连接后的路径
 */
export function joinPath(base: string, ...paths: string[]): string {
  if (!base) return paths.join('/');
  
  let result = base.replace(/\/+$/, ''); // 移除末尾的斜杠
  
  for (const path of paths) {
    if (!path) continue;
    
    const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, ''); // 移除首尾斜杠
    if (cleanPath) {
      result += `/${cleanPath}`;
    }
  }
  
  return result;
}

/**
 * 从 URL 获取文件扩展名
 * @param url URL 或文件路径
 * @returns 文件扩展名 (不包含点)
 */
export function getFileExtensionFromUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDot = pathname.lastIndexOf('.');
    const lastSlash = pathname.lastIndexOf('/');
    
    if (lastDot > lastSlash && lastDot !== -1) {
      return pathname.slice(lastDot + 1).toLowerCase();
    }
  } catch {
    // 如果不是有效的 URL，直接处理为路径
    const lastDot = url.lastIndexOf('.');
    const lastSlash = url.lastIndexOf('/');
    
    if (lastDot > lastSlash && lastDot !== -1) {
      return url.slice(lastDot + 1).toLowerCase();
    }
  }
  
  return '';
}

/**
 * 从 URL 获取文件名
 * @param url URL 或文件路径
 * @param withExtension 是否包含扩展名
 * @returns 文件名
 */
export function getFileNameFromUrl(url: string, withExtension: boolean = true): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || '';
    
    if (!withExtension) {
      const lastDot = fileName.lastIndexOf('.');
      return lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
    }
    
    return fileName;
  } catch {
    // 如果不是有效的 URL，直接处理为路径
    const fileName = url.split('/').pop() || '';
    
    if (!withExtension) {
      const lastDot = fileName.lastIndexOf('.');
      return lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
    }
    
    return fileName;
  }
}

/**
 * 添加或更新查询参数
 * @param url 原始 URL
 * @param params 要添加的参数
 * @returns 更新后的 URL
 */
export function addQuery(url: string, params: QueryParams): string {
  if (!url || !params || typeof params !== 'object') return url;
  
  try {
    const urlObj = new URL(url);
    
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        urlObj.searchParams.delete(key);
      } else if (Array.isArray(value)) {
        urlObj.searchParams.delete(key);
        for (const item of value) {
          urlObj.searchParams.append(key, String(item));
        }
      } else {
        urlObj.searchParams.set(key, String(value));
      }
    }
    
    return urlObj.href;
  } catch {
    return url;
  }
}

/**
 * 移除查询参数
 * @param url 原始 URL
 * @param keys 要移除的参数键
 * @returns 更新后的 URL
 */
export function removeQuery(url: string, keys: string | string[]): string {
  if (!url || !keys) return url;
  
  try {
    const urlObj = new URL(url);
    const keysArray = Array.isArray(keys) ? keys : [keys];
    
    for (const key of keysArray) {
      urlObj.searchParams.delete(key);
    }
    
    return urlObj.href;
  } catch {
    return url;
  }
}

/**
 * 检查是否为相对 URL
 * @param url URL 字符串
 * @returns 是否为相对 URL
 */
export function isRelativeUrl(url: string): boolean {
  if (!url) return false;
  return !url.includes('://') && !url.startsWith('//');
}

/**
 * 检查是否为绝对 URL
 * @param url URL 字符串
 * @returns 是否为绝对 URL
 */
export function isAbsoluteUrl(url: string): boolean {
  return !isRelativeUrl(url);
}

/**
 * 检查两个 URL 是否同源
 * @param url1 第一个 URL
 * @param url2 第二个 URL
 * @returns 是否同源
 */
export function isSameOrigin(url1: string, url2: string): boolean {
  try {
    const urlObj1 = new URL(url1);
    const urlObj2 = new URL(url2);
    return urlObj1.origin === urlObj2.origin;
  } catch {
    return false;
  }
}