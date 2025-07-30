/**
 * 公共工具函数
 */

// 导出DOM相关工具函数
export * from './dom';

// 导出浏览器适配器工具函数，但排除与DOM冲突的函数
export { getBrowserAdapter } from './browser';