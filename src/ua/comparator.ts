/**
 * UA 版本比较器 - 重构版本
 */

import type { ParsedUA, VersionOperator, VersionRange, ModernBrowserOptions } from './types';

/**
 * 版本比较结果枚举
 */
enum ComparisonResult {
  LESS_THAN = -1,
  EQUAL = 0,
  GREATER_THAN = 1
}

/**
 * 版本号解析结果
 */
interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  build?: number;
  prerelease?: string;
  raw: string;
}

/**
 * 解析版本号字符串为结构化对象
 * @param version 版本号字符串
 * @returns 解析后的版本对象
 */
function parseVersionString(version: string): ParsedVersion {
  if (!version || typeof version !== 'string') {
    return {
      major: 0,
      minor: 0,
      patch: 0,
      raw: version || ''
    };
  }

  try {
    // 清理版本字符串
    let cleanVersion = version.trim();
    
    // 提取预发布标识 (如 beta, alpha, rc)
    let prerelease: string | undefined;
    const prereleaseMatch = cleanVersion.match(/[-+]?([a-zA-Z]+[\w.-]*)/);
    if (prereleaseMatch) {
      prerelease = prereleaseMatch[1];
      cleanVersion = cleanVersion.replace(/[-+][a-zA-Z]+[\w.-]*/, '');
    }

    // 分割版本号
    const parts = cleanVersion.split('.').map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? 0 : num;
    });

    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      build: parts[3],
      prerelease,
      raw: version
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error parsing version: ${version}`, error);
    }
    return {
      major: 0,
      minor: 0,
      patch: 0,
      raw: version
    };
  }
}

/**
 * 比较两个版本号 - 改进版本
 * @param version1 版本1
 * @param version2 版本2
 * @returns ComparisonResult
 */
function compareVersions(version1: string, version2: string): ComparisonResult {
  if (version1 === version2) {
    return ComparisonResult.EQUAL;
  }

  const v1 = parseVersionString(version1);
  const v2 = parseVersionString(version2);

  // 比较主版本号
  if (v1.major !== v2.major) {
    return v1.major < v2.major ? ComparisonResult.LESS_THAN : ComparisonResult.GREATER_THAN;
  }

  // 比较次版本号
  if (v1.minor !== v2.minor) {
    return v1.minor < v2.minor ? ComparisonResult.LESS_THAN : ComparisonResult.GREATER_THAN;
  }

  // 比较补丁版本号
  if (v1.patch !== v2.patch) {
    return v1.patch < v2.patch ? ComparisonResult.LESS_THAN : ComparisonResult.GREATER_THAN;
  }

  // 比较构建号（如果存在）
  if (v1.build !== undefined && v2.build !== undefined) {
    if (v1.build !== v2.build) {
      return v1.build < v2.build ? ComparisonResult.LESS_THAN : ComparisonResult.GREATER_THAN;
    }
  } else if (v1.build !== undefined) {
    return ComparisonResult.GREATER_THAN;
  } else if (v2.build !== undefined) {
    return ComparisonResult.LESS_THAN;
  }

  // 比较预发布版本
  if (v1.prerelease && v2.prerelease) {
    return v1.prerelease.localeCompare(v2.prerelease) as ComparisonResult;
  } else if (v1.prerelease) {
    return ComparisonResult.LESS_THAN; // 预发布版本小于正式版本
  } else if (v2.prerelease) {
    return ComparisonResult.GREATER_THAN;
  }

  return ComparisonResult.EQUAL;
}

/**
 * 检查版本是否满足条件 - 改进版本
 * @param version 当前版本
 * @param operator 操作符
 * @param targetVersion 目标版本
 * @returns 是否满足条件
 */
function satisfiesVersion(version: string, operator: VersionOperator, targetVersion: string): boolean {
  try {
    // 特殊处理：如果目标版本只有主版本号，且操作符是 === 或 !==，则只比较主版本号
    if ((operator === '===' || operator === '!==') && /^\d+$/.test(targetVersion)) {
      const currentParsed = parseVersionString(version);
      const targetMajor = parseInt(targetVersion, 10);
      
      if (operator === '===') {
        return currentParsed.major === targetMajor;
      } else {
        return currentParsed.major !== targetMajor;
      }
    }

    const comparison = compareVersions(version, targetVersion);
    
    switch (operator) {
      case '>=':
        return comparison >= ComparisonResult.EQUAL;
      case '>':
        return comparison > ComparisonResult.EQUAL;
      case '<=':
        return comparison <= ComparisonResult.EQUAL;
      case '<':
        return comparison < ComparisonResult.EQUAL;
      case '===':
        return comparison === ComparisonResult.EQUAL;
      case '!==':
        return comparison !== ComparisonResult.EQUAL;
      default:
        if (process.env.NODE_ENV !== "production") {
          console.warn(`Unknown operator: ${operator}`);
        }
        return false;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error in satisfiesVersion: ${version} ${operator} ${targetVersion}`, error);
    }
    return false;
  }
}

/**
 * 解析版本范围字符串 - 改进版本
 * @param range 版本范围字符串，如 "Chrome >= 100" 或 "Firefox === 115.0"
 * @returns 解析后的版本范围对象
 */
function parseVersionRange(range: string): VersionRange | null {
  if (!range || typeof range !== 'string') {
    return null;
  }

  try {
    const trimmed = range.trim();
    
    // 支持更多格式的匹配
    const patterns = [
      // 标准格式：浏览器名 操作符 版本号（支持纯数字版本）
      /^(\w+)\s*(>=|>|<=|<|===|!==|==|!=)\s*(\d+(?:\.\d+)*(?:[-+][a-zA-Z]+[\w.-]*)?)$/,
      // 支持带引号的浏览器名
      /^["'](\w+)["']\s*(>=|>|<=|<|===|!==|==|!=)\s*(\d+(?:\.\d+)*(?:[-+][a-zA-Z]+[\w.-]*)?)$/,
      // 支持空格分隔的浏览器名
      /^([\w\s]+?)\s+(>=|>|<=|<|===|!==|==|!=)\s+(\d+(?:\.\d+)*(?:[-+][a-zA-Z]+[\w.-]*)?)$/
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        let operatorStr = match[2];
        
        // 标准化操作符
        if (operatorStr === '==') operatorStr = '===';
        if (operatorStr === '!=') operatorStr = '!==';
        
        const operator = operatorStr as VersionOperator;

        return {
          browser: match[1].trim(),
          operator,
          version: match[3]
        };
      }
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error parsing version range: ${range}`, error);
    }
    return null;
  }
}

/**
 * 检查 UA 是否满足版本范围要求 - 改进版本
 * @param ua UA 对象或字符串
 * @param range 版本范围字符串或数组
 * @returns 是否满足要求
 */
export function satisfies(ua: ParsedUA | string, range: string | string[]): boolean {
  try {
    let parsedUA: ParsedUA;
    
    if (typeof ua === 'string') {
      // 如果是字符串，需要先解析
      const { parseUA } = require('./parser');
      parsedUA = parseUA(ua);
    } else {
      parsedUA = ua;
    }

    // 支持多个范围条件（OR 逻辑）
    if (Array.isArray(range)) {
      return range.some(r => satisfiesSingle(parsedUA, r));
    }

    return satisfiesSingle(parsedUA, range);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error in satisfies: ${JSON.stringify(ua)} satisfies ${range}`, error);
    }
    return false;
  }
}

/**
 * 检查单个版本范围条件
 * @param parsedUA 解析后的 UA 对象
 * @param range 版本范围字符串
 * @returns 是否满足条件
 */
function satisfiesSingle(parsedUA: ParsedUA, range: string): boolean {
  const versionRange = parseVersionRange(range);
  if (!versionRange) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Invalid version range format: ${range}`);
    }
    return false;
  }
  
  // 浏览器名称匹配（不区分大小写，支持别名）
  if (!isBrowserMatch(parsedUA.browser.name, versionRange.browser)) {
    return false;
  }
  
  // 版本比较
  return satisfiesVersion(parsedUA.browser.version, versionRange.operator, versionRange.version);
}

/**
 * 检查浏览器名称是否匹配（支持别名）
 * @param browserName 实际浏览器名称
 * @param targetName 目标浏览器名称
 * @returns 是否匹配
 */
function isBrowserMatch(browserName: string, targetName: string): boolean {
  const normalizedBrowser = browserName.toLowerCase();
  const normalizedTarget = targetName.toLowerCase();

  // 直接匹配
  if (normalizedBrowser === normalizedTarget) {
    return true;
  }

  // 浏览器别名映射
  const aliases: Record<string, string[]> = {
    'chrome': ['chrome', 'chromium', 'google chrome'],
    'firefox': ['firefox', 'ff', 'mozilla firefox'],
    'safari': ['safari', 'mobile safari'],
    'edge': ['edge', 'microsoft edge', 'msedge'],
    'ie': ['ie', 'internet explorer', 'msie'],
    'opera': ['opera', 'opr'],
    'samsung': ['samsung', 'samsung internet', 'samsungbrowser'],
    'qq': ['qq', 'qqbrowser'],
    'uc': ['uc', 'ucbrowser'],
    'sogou': ['sogou', 'sogou browser'],
    '360': ['360', '360se', '360ee']
  };

  // 检查别名匹配
  for (const [canonical, aliasList] of Object.entries(aliases)) {
    if (aliasList.includes(normalizedBrowser) && aliasList.includes(normalizedTarget)) {
      return true;
    }
  }

  return false;
}

/**
 * 现代浏览器特性支持版本映射
 */
const FEATURE_SUPPORT_VERSIONS: Record<string, Record<string, number | string>> = {
  // 基础现代浏览器版本要求
  modern: {
    'Chrome': 80,
    'Edge': 80,
    'Firefox': 72,
    'Safari': 13.1,
    'Opera': 67,
    'Samsung': 12,
    'QQ': 10,
    'UC': 12,
    'Sogou': 8
  },
  
  // ES2020 支持
  es2020: {
    'Chrome': 80,
    'Edge': 80,
    'Firefox': 72,
    'Safari': 13.1,
    'Opera': 67,
    'Samsung': 13
  },
  
  // WebGL2 支持
  webgl2: {
    'Chrome': 56,
    'Edge': 79,
    'Firefox': 51,
    'Safari': 15,
    'Opera': 43,
    'Samsung': 6
  },
  
  // WebAssembly 支持
  webassembly: {
    'Chrome': 57,
    'Edge': 16,
    'Firefox': 52,
    'Safari': 11,
    'Opera': 44,
    'Samsung': 7
  },
  
  // Service Worker 支持
  serviceWorker: {
    'Chrome': 40,
    'Edge': 17,
    'Firefox': 44,
    'Safari': 11.1,
    'Opera': 27,
    'Samsung': 4
  },
  
  // CSS Grid 支持
  cssGrid: {
    'Chrome': 57,
    'Edge': 16,
    'Firefox': 52,
    'Safari': 10.1,
    'Opera': 44,
    'Samsung': 6
  },
  
  // ES Modules 支持
  esModules: {
    'Chrome': 61,
    'Edge': 16,
    'Firefox': 60,
    'Safari': 10.1,
    'Opera': 48,
    'Samsung': 8
  }
};

/**
 * 检查浏览器是否支持特定特性
 * @param ua UA 对象
 * @param feature 特性名称
 * @returns 是否支持
 */
function supportsFeature(ua: ParsedUA, feature: string): boolean {
  const versions = FEATURE_SUPPORT_VERSIONS[feature];
  if (!versions) {
    return false;
  }

  const { browser } = ua;
  const requiredVersion = versions[browser.name];
  
  if (requiredVersion === undefined) {
    return false;
  }

  if (typeof requiredVersion === 'string') {
    return compareVersions(browser.version, requiredVersion) >= ComparisonResult.EQUAL;
  }

  // 对于 Safari，需要特殊处理小数版本
  if (browser.name === 'Safari') {
    const version = parseFloat(browser.version);
    return !isNaN(version) && version >= requiredVersion;
  }

  return !isNaN(browser.major) && browser.major >= requiredVersion;
}

/**
 * 检查是否为现代浏览器 - 改进版本
 * @param ua UA 对象
 * @param options 检查选项
 * @returns 是否为现代浏览器
 */
export function isModern(ua: ParsedUA, options: ModernBrowserOptions = {}): boolean {
  try {
    const {
      es2020 = true,
      webgl2 = false,
      webassembly = false,
      serviceWorker = false
    } = options;

    // 基础现代浏览器检查
    if (!supportsFeature(ua, 'modern')) {
      return false;
    }

    // 特性支持检查
    const featureChecks = [
      { enabled: es2020, feature: 'es2020' },
      { enabled: webgl2, feature: 'webgl2' },
      { enabled: webassembly, feature: 'webassembly' },
      { enabled: serviceWorker, feature: 'serviceWorker' }
    ];

    for (const { enabled, feature } of featureChecks) {
      if (enabled && !supportsFeature(ua, feature)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error in isModern check:`, error);
    }
    return false;
  }
}

/**
 * 批量检查版本范围 - 改进版本
 * @param ua UA 对象或字符串
 * @param ranges 版本范围数组
 * @returns 是否全部满足
 */
export function satisfiesAll(ua: ParsedUA | string, ranges: string[]): boolean {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return true;
  }

  try {
    return ranges.every(range => satisfies(ua, range));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error in satisfiesAll:`, error);
    }
    return false;
  }
}

/**
 * 检查是否满足任一版本范围 - 改进版本
 * @param ua UA 对象或字符串
 * @param ranges 版本范围数组
 * @returns 是否满足任一条件
 */
export function satisfiesAny(ua: ParsedUA | string, ranges: string[]): boolean {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return false;
  }

  try {
    return ranges.some(range => satisfies(ua, range));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error in satisfiesAny:`, error);
    }
    return false;
  }
}

/**
 * 比较两个 UA 的版本
 * @param ua1 第一个 UA
 * @param ua2 第二个 UA
 * @returns 比较结果
 */
export function compareUA(ua1: ParsedUA | string, ua2: ParsedUA | string): ComparisonResult {
  try {
    let parsedUA1: ParsedUA;
    let parsedUA2: ParsedUA;

    if (typeof ua1 === 'string') {
      const { parseUA } = require('./parser');
      parsedUA1 = parseUA(ua1);
    } else {
      parsedUA1 = ua1;
    }

    if (typeof ua2 === 'string') {
      const { parseUA } = require('./parser');
      parsedUA2 = parseUA(ua2);
    } else {
      parsedUA2 = ua2;
    }

    // 只有相同浏览器才能比较版本
    if (!isBrowserMatch(parsedUA1.browser.name, parsedUA2.browser.name)) {
      throw new Error('Cannot compare different browsers');
    }

    return compareVersions(parsedUA1.browser.version, parsedUA2.browser.version);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error in compareUA:`, error);
    }
    throw error;
  }
}

/**
 * 获取浏览器支持的特性列表
 * @param ua UA 对象
 * @returns 支持的特性列表
 */
export function getSupportedFeatures(ua: ParsedUA): string[] {
  const supportedFeatures: string[] = [];

  for (const feature of Object.keys(FEATURE_SUPPORT_VERSIONS)) {
    if (supportsFeature(ua, feature)) {
      supportedFeatures.push(feature);
    }
  }

  return supportedFeatures;
}

/**
 * 检查浏览器是否过时
 * @param ua UA 对象
 * @param monthsThreshold 过时阈值（月）
 * @returns 是否过时
 */
export function isOutdated(ua: ParsedUA, monthsThreshold: number = 24): boolean {
  try {
    // 基于发布时间的粗略估算
    const releaseDates: Record<string, Record<number, string>> = {
      'Chrome': {
        120: '2023-11',
        110: '2023-02',
        100: '2022-03',
        90: '2021-04',
        80: '2020-02'
      },
      'Firefox': {
        120: '2023-11',
        110: '2023-01',
        100: '2022-05',
        90: '2021-04',
        80: '2020-11'
      },
      'Safari': {
        17: '2023-09',
        16: '2022-09',
        15: '2021-09',
        14: '2020-09',
        13: '2019-09'
      },
      'Edge': {
        120: '2023-11',
        110: '2023-02',
        100: '2022-03',
        90: '2021-04',
        80: '2020-02'
      }
    };

    const browserReleases = releaseDates[ua.browser.name];
    if (!browserReleases || isNaN(ua.browser.major)) {
      return false;
    }

    const releaseDate = browserReleases[ua.browser.major];
    if (!releaseDate) {
      return true; // 如果找不到发布日期，认为是过时的
    }

    const [year, month] = releaseDate.split('-').map(Number);
    const releaseTime = new Date(year, month - 1);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - releaseTime.getFullYear()) * 12 + 
                      (now.getMonth() - releaseTime.getMonth());

    return monthsDiff > monthsThreshold;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error in isOutdated check:`, error);
    }
    return false;
  }
}

/**
 * 获取浏览器的安全等级评估
 * @param ua UA 对象
 * @returns 安全等级 (high, medium, low, critical)
 */
export function getSecurityLevel(ua: ParsedUA): 'high' | 'medium' | 'low' | 'critical' {
  try {
    // 如果是机器人或无头浏览器，安全等级较低
    if (ua.isBot || ua.isHeadless) {
      return 'low';
    }

    // 检查是否为现代浏览器
    if (!isModern(ua)) {
      return 'critical';
    }

    // 检查是否过时
    if (isOutdated(ua, 12)) { // 12个月
      return 'low';
    } else if (isOutdated(ua, 6)) { // 6个月
      return 'medium';
    }

    return 'high';
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Error in getSecurityLevel:`, error);
    }
    return 'medium';
  }
}

// 导出工具函数
export {
  compareVersions,
  parseVersionString,
  supportsFeature,
  ComparisonResult
};