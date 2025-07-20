/**
 * UA 版本比较器
 */

import type { ParsedUA, VersionOperator, VersionRange, ModernBrowserOptions } from './types';

/**
 * 比较两个版本号
 * @param version1 版本1
 * @param version2 版本2
 * @returns -1: version1 < version2, 0: 相等, 1: version1 > version2
 */
function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(v => parseInt(v) || 0);
  const v2Parts = version2.split('.').map(v => parseInt(v) || 0);
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;
    
    if (v1 < v2) return -1;
    if (v1 > v2) return 1;
  }
  
  return 0;
}

/**
 * 检查版本是否满足条件
 * @param version 当前版本
 * @param operator 操作符
 * @param targetVersion 目标版本
 * @returns 是否满足条件
 */
function satisfiesVersion(version: string, operator: VersionOperator, targetVersion: string): boolean {
  const comparison = compareVersions(version, targetVersion);
  
  switch (operator) {
    case '>=':
      return comparison >= 0;
    case '>':
      return comparison > 0;
    case '<=':
      return comparison <= 0;
    case '<':
      return comparison < 0;
    case '===':
      return comparison === 0;
    case '!==':
      return comparison !== 0;
    default:
      return false;
  }
}

/**
 * 解析版本范围字符串
 * @param range 版本范围字符串，如 "Chrome >= 100"
 * @returns 解析后的版本范围对象
 */
function parseVersionRange(range: string): VersionRange | null {
  const trimmed = range.trim();
  
  // 匹配格式：浏览器名 操作符 版本号
  const match = trimmed.match(/^(\w+)\s*(>=|>|<=|<|===|!==)\s*([\d.]+)$/);
  
  if (!match) {
    return null;
  }
  
  return {
    browser: match[1],
    operator: match[2] as VersionOperator,
    version: match[3]
  };
}

/**
 * 检查 UA 是否满足版本范围要求
 * @param ua UA 对象或字符串
 * @param range 版本范围字符串
 * @returns 是否满足要求
 */
export function satisfies(ua: ParsedUA | string, range: string): boolean {
  let parsedUA: ParsedUA;
  
  if (typeof ua === 'string') {
    // 如果是字符串，需要先解析
    const { parseUA } = require('./parser');
    parsedUA = parseUA(ua);
  } else {
    parsedUA = ua;
  }
  
  const versionRange = parseVersionRange(range);
  if (!versionRange) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Invalid version range format: ${range}`);
    }
    return false;
  }
  
  // 浏览器名称匹配（不区分大小写）
  if (parsedUA.browser.name.toLowerCase() !== versionRange.browser.toLowerCase()) {
    return false;
  }
  
  // 版本比较
  return satisfiesVersion(parsedUA.browser.version, versionRange.operator, versionRange.version);
}

/**
 * 检查是否为现代浏览器
 * @param ua UA 对象
 * @param options 检查选项
 * @returns 是否为现代浏览器
 */
export function isModern(ua: ParsedUA, options: ModernBrowserOptions = {}): boolean {
  const {
    es2020 = true,
    webgl2 = false,
    webassembly = false,
    serviceWorker = false
  } = options;
  
  const { browser } = ua;
  
  // 基础现代浏览器版本要求
  const modernVersions: Record<string, number> = {
    'Chrome': 80,
    'Edge': 80,
    'Firefox': 72,
    'Safari': 13.1, // Safari 需要 13.1 及以上
    'Opera': 67,
    'Samsung': 12
  };
  
  const minVersion = modernVersions[browser.name];
  if (!minVersion || isNaN(browser.major)) {
    return false;
  }
  
  // 对于 Safari，需要特殊处理小数版本
  if (browser.name === 'Safari') {
    const version = parseFloat(browser.version);
    if (isNaN(version) || version < minVersion) {
      return false;
    }
  } else if (browser.major < minVersion) {
    return false;
  }
  
  // ES2020 支持检查
  if (es2020) {
    const es2020Versions: Record<string, number> = {
      'Chrome': 80,
      'Edge': 80,
      'Firefox': 72,
      'Safari': 13.1,
      'Opera': 67,
      'Samsung': 13
    };
    
    const requiredVersion = es2020Versions[browser.name];
    if (requiredVersion && browser.major < requiredVersion) {
      return false;
    }
  }
  
  // WebGL2 支持检查
  if (webgl2) {
    const webgl2Versions: Record<string, number> = {
      'Chrome': 56,
      'Edge': 79,
      'Firefox': 51,
      'Safari': 15,
      'Opera': 43,
      'Samsung': 6
    };
    
    const requiredVersion = webgl2Versions[browser.name];
    if (requiredVersion && browser.major < requiredVersion) {
      return false;
    }
  }
  
  // WebAssembly 支持检查
  if (webassembly) {
    const wasmVersions: Record<string, number> = {
      'Chrome': 57,
      'Edge': 16,
      'Firefox': 52,
      'Safari': 11,
      'Opera': 44,
      'Samsung': 7
    };
    
    const requiredVersion = wasmVersions[browser.name];
    if (requiredVersion && browser.major < requiredVersion) {
      return false;
    }
  }
  
  // Service Worker 支持检查
  if (serviceWorker) {
    const swVersions: Record<string, number> = {
      'Chrome': 40,
      'Edge': 17,
      'Firefox': 44,
      'Safari': 11.1,
      'Opera': 27,
      'Samsung': 4
    };
    
    const requiredVersion = swVersions[browser.name];
    if (requiredVersion && browser.major < requiredVersion) {
      return false;
    }
  }
  
  return true;
}

/**
 * 批量检查版本范围
 * @param ua UA 对象或字符串
 * @param ranges 版本范围数组
 * @returns 是否全部满足
 */
export function satisfiesAll(ua: ParsedUA | string, ranges: string[]): boolean {
  return ranges.every(range => satisfies(ua, range));
}

/**
 * 检查是否满足任一版本范围
 * @param ua UA 对象或字符串
 * @param ranges 版本范围数组
 * @returns 是否满足任一条件
 */
export function satisfiesAny(ua: ParsedUA | string, ranges: string[]): boolean {
  return ranges.some(range => satisfies(ua, range));
}