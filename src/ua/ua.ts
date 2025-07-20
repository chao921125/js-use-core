/**
 * UA 主要功能类
 */

import type { ParsedUA, UAParserPlugin, ModernBrowserOptions, UAGenerateSpec } from './types';
import { parseUA } from './parser';
import { generateUA } from './generator';
import { satisfies, isModern } from './comparator';

/**
 * UA 解析缓存
 */
const parseCache = new Map<string, Readonly<ParsedUA>>();

/**
 * 插件列表
 */
const plugins: UAParserPlugin[] = [];

/**
 * UA 工具类
 */
export class UA {
  /**
   * 解析 UA 字符串，缓存命中则直接返回
   * @param ua UA 字符串，默认使用当前环境的 UA
   * @returns 只读的解析结果
   */
  static parse(ua?: string): Readonly<ParsedUA> {
    const userAgent = ua || UA.getCurrentUA();
    
    // 检查缓存
    if (parseCache.has(userAgent)) {
      return parseCache.get(userAgent)!;
    }
    
    // 尝试插件解析
    let result: ParsedUA | null = null;
    for (const plugin of plugins) {
      if (plugin.test(userAgent)) {
        const pluginResult = plugin.parse(userAgent);
        if (pluginResult) {
          // 合并插件结果和默认解析结果
          const defaultResult = parseUA(userAgent);
          result = { ...defaultResult, ...pluginResult };
          break;
        }
      }
    }
    
    // 使用默认解析器
    if (!result) {
      result = parseUA(userAgent);
    }
    
    // 冻结对象确保不可变
    const frozenResult = Object.freeze({
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
    
    // 缓存结果
    parseCache.set(userAgent, frozenResult);
    
    return frozenResult;
  }
  
  /**
   * 生成 UA 字符串
   * @param spec 生成规格
   * @returns UA 字符串
   */
  static stringify(spec: UAGenerateSpec): string {
    return generateUA(spec);
  }
  
  /**
   * 检查是否满足语义化版本规则
   * @param ua UA 对象或字符串
   * @param range 版本范围字符串
   * @returns 是否满足条件
   */
  static satisfies(ua: ParsedUA | string, range: string): boolean {
    return satisfies(ua, range);
  }
  
  /**
   * 判断是否为现代浏览器
   * @param ua UA 对象
   * @param opts 检查选项
   * @returns 是否为现代浏览器
   */
  static isModern(ua: ParsedUA, opts?: ModernBrowserOptions): boolean {
    return isModern(ua, opts);
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
    plugins.push(plugin);
  }
  
  /**
   * 清除解析缓存
   */
  static clearCache(): void {
    parseCache.clear();
  }
  
  /**
   * 获取缓存统计信息
   * @returns 缓存大小
   */
  static getCacheSize(): number {
    return parseCache.size;
  }
  
  /**
   * 获取当前环境的 UA 字符串
   * @returns UA 字符串
   */
  static getCurrentUA(): string {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    return '';
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