/**
 * 核心架构类型定义
 * 
 * @description 定义核心架构相关的类型和接口
 * @author js-use-core
 * @date 2024-07-20
 */

/**
 * 基础配置接口
 */
export interface BaseOptions {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retries?: number;
  /** 是否启用缓存 */
  cache?: boolean;
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 用户错误 - 用户输入错误或使用不当 */
  USER_ERROR = 'USER_ERROR',
  /** 系统错误 - 浏览器不支持或环境问题 */
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  /** 网络错误 - 网络请求失败 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 权限错误 - 权限不足 */
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  /** 配置错误 - 配置参数错误 */
  CONFIG_ERROR = 'CONFIG_ERROR',
  /** 超时错误 - 操作超时 */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  /** 未知错误 - 其他未分类错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误上下文接口
 */
export interface ErrorContext {
  /** 模块名称 */
  module: string;
  /** 方法名称 */
  method: string;
  /** 输入参数 */
  input?: any;
  /** 用户代理字符串 */
  userAgent?: string;
  /** 时间戳 */
  timestamp: number;
  /** 额外的上下文信息 */
  extra?: Record<string, any>;
}

/**
 * 处理后的错误接口
 */
export interface ProcessedError {
  /** 错误类型 */
  type: ErrorType;
  /** 错误消息 */
  message: string;
  /** 原始错误对象 */
  originalError: Error;
  /** 错误上下文 */
  context: ErrorContext;
  /** 解决方案建议 */
  solution?: string;
  /** 是否可恢复 */
  recoverable: boolean;
  /** 错误代码 */
  code?: string;
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  /** 日志级别 */
  level: LogLevel;
  /** 日志消息 */
  message: string;
  /** 时间戳 */
  timestamp: number;
  /** 模块名称 */
  module?: string;
  /** 额外数据 */
  data?: any;
}

/**
 * 缓存条目接口
 */
export interface CacheEntry<T = any> {
  /** 缓存的值 */
  value: T;
  /** 过期时间戳 */
  expireAt: number;
  /** 创建时间戳 */
  createdAt: number;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessed: number;
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 最大缓存条目数 */
  maxSize?: number;
  /** 默认过期时间（毫秒） */
  defaultTTL?: number;
  /** 是否启用LRU清理 */
  enableLRU?: boolean;
  /** 清理间隔（毫秒） */
  cleanupInterval?: number;
}

/**
 * 事件监听器函数类型
 */
export type EventListener = (...args: any[]) => void;

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
  /** 监听器函数 */
  listener: EventListener;
  /** 是否只执行一次 */
  once?: boolean;
  /** 优先级（数字越大优先级越高） */
  priority?: number;
}

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: ProcessedError;
  /** 元数据 */
  metadata?: {
    /** 时间戳 */
    timestamp: number;
    /** 版本号 */
    version: string;
    /** 是否来自缓存 */
    cached: boolean;
  };
}