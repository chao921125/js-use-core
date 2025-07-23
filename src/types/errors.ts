/**
 * 错误处理相关类型定义
 * 
 * @description 定义错误处理系统的类型接口和枚举
 * @author js-use-core
 * @date 2024-07-20
 */

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
  /** 验证错误 - 数据验证失败 */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** 超时错误 - 操作超时 */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  /** 不支持错误 - 功能不支持 */
  UNSUPPORTED_ERROR = 'UNSUPPORTED_ERROR',
  /** 内部错误 - 内部逻辑错误 */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** 外部错误 - 第三方服务错误 */
  EXTERNAL_ERROR = 'EXTERNAL_ERROR'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  /** 低级别 - 不影响核心功能 */
  LOW = 'low',
  /** 中级别 - 影响部分功能 */
  MEDIUM = 'medium',
  /** 高级别 - 影响核心功能 */
  HIGH = 'high',
  /** 严重级别 - 系统无法正常工作 */
  CRITICAL = 'critical'
}

/**
 * 错误上下文信息
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
  /** 请求ID */
  requestId?: string;
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  sessionId?: string;
  /** 页面URL */
  url?: string;
  /** 堆栈跟踪 */
  stackTrace?: string;
  /** 额外的上下文数据 */
  extra?: Record<string, any>;
}

/**
 * 错误解决方案
 */
export interface ErrorSolution {
  /** 解决方案描述 */
  description: string;
  /** 解决步骤 */
  steps: string[];
  /** 相关链接 */
  links?: string[];
  /** 是否为自动解决方案 */
  automatic?: boolean;
  /** 解决方案优先级 */
  priority?: number;
}

/**
 * 处理后的错误信息
 */
export interface ProcessedError {
  /** 错误类型 */
  type: ErrorType;
  /** 错误严重级别 */
  severity: ErrorSeverity;
  /** 错误消息 */
  message: string;
  /** 用户友好的错误消息 */
  userMessage: string;
  /** 原始错误对象 */
  originalError: Error;
  /** 错误上下文 */
  context: ErrorContext;
  /** 错误代码 */
  code: string;
  /** 是否可恢复 */
  recoverable: boolean;
  /** 解决方案 */
  solutions: ErrorSolution[];
  /** 错误ID */
  id: string;
  /** 处理时间戳 */
  processedAt: number;
  /** 相关错误ID */
  relatedErrors?: string[];
}

/**
 * 自定义错误类基类
 */
export interface CustomErrorOptions {
  /** 错误类型 */
  type: ErrorType;
  /** 错误严重级别 */
  severity?: ErrorSeverity;
  /** 错误代码 */
  code?: string;
  /** 是否可恢复 */
  recoverable?: boolean;
  /** 错误上下文 */
  context?: Partial<ErrorContext>;
  /** 原因错误 */
  cause?: Error;
  /** 解决方案 */
  solutions?: ErrorSolution[];
}

/**
 * 自定义错误类接口
 */
export interface ICustomError extends Error {
  /** 错误类型 */
  readonly type: ErrorType;
  /** 错误严重级别 */
  readonly severity: ErrorSeverity;
  /** 错误代码 */
  readonly code: string;
  /** 是否可恢复 */
  readonly recoverable: boolean;
  /** 错误上下文 */
  readonly context?: ErrorContext;
  /** 原因错误 */
  readonly cause?: Error;
  /** 解决方案 */
  readonly solutions: ErrorSolution[];
  /** 错误ID */
  readonly id: string;
  /** 创建时间 */
  readonly createdAt: number;
  
  /** 转换为JSON */
  toJSON(): object;
  /** 获取用户友好的消息 */
  getUserMessage(): string;
}

/**
 * 错误处理策略
 */
export interface ErrorHandlingStrategy {
  /** 策略名称 */
  name: string;
  /** 是否匹配该错误 */
  matches(error: Error, context: ErrorContext): boolean;
  /** 处理错误 */
  handle(error: Error, context: ErrorContext): ProcessedError;
  /** 策略优先级 */
  priority: number;
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy {
  /** 策略名称 */
  name: string;
  /** 是否可以恢复 */
  canRecover(error: ProcessedError): boolean;
  /** 执行恢复 */
  recover(error: ProcessedError): Promise<any>;
  /** 恢复优先级 */
  priority: number;
}

/**
 * 错误报告配置
 */
export interface ErrorReportingConfig {
  /** 是否启用错误报告 */
  enabled?: boolean;
  /** 报告端点URL */
  endpoint?: string;
  /** API密钥 */
  apiKey?: string;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 最大报告数量 */
  maxReports?: number;
  /** 报告间隔（毫秒） */
  reportInterval?: number;
  /** 是否包含堆栈跟踪 */
  includeStackTrace?: boolean;
  /** 是否包含用户信息 */
  includeUserInfo?: boolean;
  /** 过滤函数 */
  filter?: (error: ProcessedError) => boolean;
  /** 转换函数 */
  transform?: (error: ProcessedError) => any;
}

/**
 * 错误统计信息
 */
export interface ErrorStats {
  /** 总错误数 */
  totalErrors: number;
  /** 按类型分组的错误数 */
  errorsByType: Record<ErrorType, number>;
  /** 按严重级别分组的错误数 */
  errorsBySeverity: Record<ErrorSeverity, number>;
  /** 按模块分组的错误数 */
  errorsByModule: Record<string, number>;
  /** 最常见的错误 */
  topErrors: Array<{
    message: string;
    count: number;
    type: ErrorType;
  }>;
  /** 错误率 */
  errorRate: number;
  /** 统计时间范围 */
  timeRange: {
    start: number;
    end: number;
  };
}

/**
 * 错误处理器配置
 */
export interface ErrorHandlerConfig {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 最大错误历史记录数 */
  maxHistory?: number;
  /** 是否启用自动恢复 */
  enableAutoRecovery?: boolean;
  /** 是否启用错误报告 */
  enableReporting?: boolean;
  /** 错误报告配置 */
  reporting?: ErrorReportingConfig;
  /** 自定义错误处理策略 */
  strategies?: ErrorHandlingStrategy[];
  /** 自定义恢复策略 */
  recoveryStrategies?: ErrorRecoveryStrategy[];
  /** 默认错误类型 */
  defaultErrorType?: ErrorType;
  /** 默认严重级别 */
  defaultSeverity?: ErrorSeverity;
}

/**
 * 错误处理器接口
 */
export interface IErrorHandler {
  /** 处理错误 */
  handleError(error: Error, context?: Partial<ErrorContext>): ProcessedError;
  /** 创建自定义错误 */
  createError(message: string, options?: CustomErrorOptions): ICustomError;
  /** 检查错误是否可恢复 */
  isRecoverableError(error: Error): boolean;
  /** 获取错误解决方案 */
  getErrorSolutions(error: Error): ErrorSolution[];
  /** 尝试恢复错误 */
  recoverFromError(error: ProcessedError): Promise<any>;
  /** 添加错误处理策略 */
  addStrategy(strategy: ErrorHandlingStrategy): void;
  /** 添加恢复策略 */
  addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void;
  /** 获取错误历史 */
  getErrorHistory(): ProcessedError[];
  /** 获取错误统计 */
  getErrorStats(): ErrorStats;
  /** 清除错误历史 */
  clearHistory(): void;
  /** 报告错误 */
  reportError(error: ProcessedError): Promise<void>;
}

/**
 * 错误边界配置
 */
export interface ErrorBoundaryConfig {
  /** 错误边界名称 */
  name: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 回退组件或函数 */
  fallback?: any;
  /** 错误处理函数 */
  onError?: (error: Error, errorInfo: any) => void;
  /** 是否重置状态 */
  resetOnPropsChange?: boolean;
  /** 重置键 */
  resetKeys?: string[];
}

/**
 * 错误边界接口
 */
export interface IErrorBoundary {
  /** 捕获错误 */
  componentDidCatch?(error: Error, errorInfo: any): void;
  /** 获取派生状态 */
  getDerivedStateFromError?(error: Error): any;
  /** 重置错误状态 */
  resetErrorBoundary?(): void;
}

/**
 * 全局错误处理器配置
 */
export interface GlobalErrorHandlerConfig extends ErrorHandlerConfig {
  /** 是否捕获未处理的Promise拒绝 */
  catchUnhandledRejections?: boolean;
  /** 是否捕获全局错误 */
  catchGlobalErrors?: boolean;
  /** 是否在控制台输出错误 */
  logToConsole?: boolean;
  /** 自定义日志函数 */
  customLogger?: (error: ProcessedError) => void;
}

/**
 * 错误重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  delay: number;
  /** 延迟倍数（指数退避） */
  backoffMultiplier?: number;
  /** 最大延迟时间 */
  maxDelay?: number;
  /** 重试条件函数 */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** 重试前的钩子 */
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * 错误重试结果
 */
export interface RetryResult<T> {
  /** 是否成功 */
  success: boolean;
  /** 结果数据 */
  result?: T;
  /** 最终错误 */
  error?: Error;
  /** 重试次数 */
  attempts: number;
  /** 总耗时 */
  totalTime: number;
}

/**
 * 错误重试器接口
 */
export interface IErrorRetrier {
  /** 执行带重试的操作 */
  retry<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<RetryResult<T>>;
  
  /** 设置默认重试配置 */
  setDefaultConfig(config: Partial<RetryConfig>): void;
  
  /** 获取重试统计 */
  getRetryStats(): {
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    averageAttempts: number;
  };
}