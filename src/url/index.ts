/**
 * URL 工具模块
 * 提供 URL 解析、操作和相关功能
 */

export * from './types';
export * from './parser';
export * from './utils';
export * from './url';

// 便捷导出
export { UrlManager as default } from './url';

// 创建默认实例的工厂函数
import { UrlManager } from './url';
import type { UrlManagerOptions } from './types';

export function createUrlManager(options?: UrlManagerOptions): UrlManager {
  return new UrlManager(options);
}