/**
 * URL 相关类型定义
 */

import { BaseOptions } from '../core/types';

/**
 * URL 解析结果对象
 */
export interface UrlParseResult {
  /** URL参数键值对 */
  [key: string]: string;
}

/**
 * URL 信息对象
 */
export interface UrlInfo {
  /** 完整的 URL */
  url: string;
  /** 协议 (如: 'https:') */
  protocol: string;
  /** 主机名 (如: 'example.com') */
  hostname: string;
  /** 端口号 */
  port: string;
  /** 源 (协议 + 主机名 + 端口) */
  origin: string;
  /** 路径名 */
  pathname: string;
  /** 查询字符串 (包含 '?') */
  search: string;
  /** 哈希值 (包含 '#') */
  hash: string;
  /** 主机 (主机名 + 端口) */
  host: string;
}

/**
 * 查询参数对象
 */
export interface QueryParams {
  [key: string]: string | string[] | undefined;
}

/**
 * URL 构建选项
 */
export interface UrlBuildOptions {
  /** 基础 URL */
  base?: string;
  /** 路径 */
  pathname?: string;
  /** 查询参数对象 */
  query?: QueryParams;
  /** 哈希值 */
  hash?: string;
}

/**
 * URL 验证选项
 */
export interface UrlValidateOptions {
  /** 允许的协议列表 */
  protocols?: string[];
  /** 是否要求协议 */
  requireProtocol?: boolean;
  /** 是否允许本地主机 */
  allowLocalhost?: boolean;
  /** 是否允许 IP 地址 */
  allowIp?: boolean;
}

/**
 * URL 管理器配置选项
 */
export interface UrlManagerOptions extends BaseOptions {
  /** 初始 URL */
  url?: string;
  /** 是否验证 URL */
  validateUrls?: boolean;
  /** 允许的协议列表 */
  allowedProtocols?: string[];
  /** 最大 URL 长度 */
  maxUrlLength?: number;
}