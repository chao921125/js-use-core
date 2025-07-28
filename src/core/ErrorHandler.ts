/**
 * 统一错误处理器
 * 
 * @description 提供统一的错误处理机制，支持错误分类、日志记录和用户友好的错误信息
 * @author js-use-core
 * @date 2024-07-20
 */

import { ErrorType, ErrorSeverity, ErrorContext, ProcessedError } from '../types/errors';
import { Logger } from './Logger';

/**
 * 自定义错误类
 */
export class CustomError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly context?: ErrorContext;
  public readonly recoverable: boolean;

  constructor(
    type: ErrorType,
    message: string,
    options?: {
      code?: string;
      context?: ErrorContext;
      recoverable?: boolean;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.code = options?.code;
    this.context = options?.context;
    this.recoverable = options?.recoverable ?? false;

    if (options?.cause) {
      (this as any).cause = options.cause;
    }

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private logger: Logger;
  private errorSolutions: Map<string, string> = new Map();

  /**
   * 构造函数
   * @param logger 日志记录器实例
   */
  constructor(logger?: Logger) {
    this.logger = logger || new Logger('ErrorHandler');
    this.initializeErrorSolutions();
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 处理后的错误对象
   */
  handleError(error: Error, context?: Partial<ErrorContext>): ProcessedError {
    const errorType = this.classifyError(error);
    const fullContext: ErrorContext = {
      module: 'Unknown',
      method: 'Unknown',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      ...context
    };

    const processedError: ProcessedError = {
      type: errorType,
      severity: this.getErrorSeverity(errorType),
      message: error.message,
      userMessage: this.getUserFriendlyMessage(error, errorType),
      originalError: error,
      context: fullContext,
      code: this.getErrorCode(error) || this.generateErrorCode(errorType),
      recoverable: this.isRecoverableError(error),
      solutions: this.getErrorSolutions(error),
      id: this.generateErrorId(),
      processedAt: Date.now(),
      relatedErrors: []
    };

    // 记录错误日志
    this.logger.error(
      `[${errorType}] ${processedError.message}`,
      {
        error: error.message,
        stack: error.stack,
        context: fullContext,
        recoverable: processedError.recoverable
      }
    );

    return processedError;
  }

  /**
   * 创建自定义错误
   * @param type 错误类型
   * @param message 错误消息
   * @param details 错误详情
   * @returns 自定义错误对象
   */
  createError(
    type: ErrorType,
    message: string,
    details?: {
      code?: string;
      context?: Partial<ErrorContext>;
      recoverable?: boolean;
      cause?: Error;
    }
  ): CustomError {
    const context: ErrorContext = {
      module: 'Unknown',
      method: 'Unknown',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      ...details?.context
    };

    return new CustomError(type, message, {
      code: details?.code,
      context,
      recoverable: details?.recoverable,
      cause: details?.cause
    });
  }

  /**
   * 判断错误是否可恢复
   * @param error 错误对象
   * @returns 是否可恢复
   */
  isRecoverableError(error: Error): boolean {
    if (error instanceof CustomError) {
      return error.recoverable;
    }

    // 根据错误类型判断是否可恢复
    const errorType = this.classifyError(error);
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return true;
      case ErrorType.PERMISSION_ERROR:
      case ErrorType.SYSTEM_ERROR:
        return false;
      case ErrorType.USER_ERROR:
      case ErrorType.CONFIG_ERROR:
        return true;
      default:
        return false;
    }
  }

  /**
   * 获取错误解决方案
   * @param error 错误对象
   * @returns 解决方案建议或null
   */
  getErrorSolution(error: Error): string | null {
    const errorCode = this.getErrorCode(error);
    if (errorCode && this.errorSolutions.has(errorCode)) {
      return this.errorSolutions.get(errorCode)!;
    }

    const errorType = this.classifyError(error);
    return this.getDefaultSolution(errorType);
  }

  /**
   * 获取错误解决方案列表
   * @param error 错误对象
   * @returns 解决方案列表
   */
  getErrorSolutions(error: Error): Array<{ description: string; steps: string[]; links?: string[]; automatic?: boolean; priority?: number }> {
    const solution = this.getErrorSolution(error);
    if (solution) {
      return [{
        description: solution,
        steps: [solution],
        automatic: false,
        priority: 1
      }];
    }
    return [];
  }

  /**
   * 获取错误严重级别
   * @param errorType 错误类型
   * @returns 错误严重级别
   */
  private getErrorSeverity(errorType: ErrorType): ErrorSeverity {
    switch (errorType) {
      case ErrorType.USER_ERROR:
      case ErrorType.CONFIG_ERROR:
        return ErrorSeverity.LOW;
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return ErrorSeverity.MEDIUM;
      case ErrorType.PERMISSION_ERROR:
      case ErrorType.VALIDATION_ERROR:
        return ErrorSeverity.HIGH;
      case ErrorType.SYSTEM_ERROR:
      case ErrorType.INTERNAL_ERROR:
        return ErrorSeverity.CRITICAL;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * 生成错误代码
   * @param errorType 错误类型
   * @returns 错误代码
   */
  private generateErrorCode(errorType: ErrorType): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${errorType}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * 生成错误ID
   * @returns 错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加错误解决方案
   * @param errorCode 错误代码
   * @param solution 解决方案
   */
  addErrorSolution(errorCode: string, solution: string): void {
    this.errorSolutions.set(errorCode, solution);
  }

  /**
   * 批量添加错误解决方案
   * @param solutions 错误解决方案映射
   */
  addErrorSolutions(solutions: Record<string, string>): void {
    for (const [code, solution] of Object.entries(solutions)) {
      this.errorSolutions.set(code, solution);
    }
  }

  /**
   * 分类错误类型
   * @param error 错误对象
   * @returns 错误类型
   */
  private classifyError(error: Error): ErrorType {
    if (error instanceof CustomError) {
      return error.type;
    }

    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // 网络相关错误
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('xhr') ||
      name.includes('networkerror')
    ) {
      return ErrorType.NETWORK_ERROR;
    }

    // 超时错误
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      name.includes('timeouterror')
    ) {
      return ErrorType.TIMEOUT_ERROR;
    }

    // 权限错误
    if (
      message.includes('permission') ||
      message.includes('denied') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      name.includes('notallowederror')
    ) {
      return ErrorType.PERMISSION_ERROR;
    }

    // 系统/浏览器不支持错误
    if (
      message.includes('not supported') ||
      message.includes('not available') ||
      message.includes('not implemented') ||
      name.includes('notsupportederror')
    ) {
      return ErrorType.SYSTEM_ERROR;
    }

    // 配置错误
    if (
      message.includes('invalid') ||
      message.includes('configuration') ||
      message.includes('config') ||
      name.includes('configerror')
    ) {
      return ErrorType.CONFIG_ERROR;
    }

    // 用户输入错误
    if (
      error instanceof TypeError ||
      error instanceof RangeError ||
      message.includes('invalid argument') ||
      message.includes('invalid parameter')
    ) {
      return ErrorType.USER_ERROR;
    }

    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * 获取用户友好的错误消息
   * @param error 错误对象
   * @param errorType 错误类型
   * @returns 用户友好的错误消息
   */
  private getUserFriendlyMessage(error: Error, errorType: ErrorType): string {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return '网络连接失败，请检查网络连接后重试';
      case ErrorType.TIMEOUT_ERROR:
        return '操作超时，请稍后重试';
      case ErrorType.PERMISSION_ERROR:
        return '权限不足，请检查浏览器权限设置';
      case ErrorType.SYSTEM_ERROR:
        return '当前浏览器不支持此功能，请使用其他浏览器或升级浏览器版本';
      case ErrorType.CONFIG_ERROR:
        return '配置参数错误，请检查配置';
      case ErrorType.USER_ERROR:
        return '输入参数错误，请检查输入参数';
      default:
        return error.message || '发生未知错误';
    }
  }

  /**
   * 获取错误代码
   * @param error 错误对象
   * @returns 错误代码
   */
  private getErrorCode(error: Error): string | undefined {
    if (error instanceof CustomError) {
      return error.code;
    }

    // 尝试从错误对象中提取代码
    const errorWithCode = error as any;
    return errorWithCode.code || errorWithCode.errno || undefined;
  }

  /**
   * 获取默认解决方案
   * @param errorType 错误类型
   * @returns 默认解决方案
   */
  private getDefaultSolution(errorType: ErrorType): string | null {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return '请检查网络连接，确保网络正常后重试';
      case ErrorType.TIMEOUT_ERROR:
        return '请稍后重试，或增加超时时间设置';
      case ErrorType.PERMISSION_ERROR:
        return '请在浏览器设置中允许相关权限，或使用HTTPS协议';
      case ErrorType.SYSTEM_ERROR:
        return '请使用支持此功能的现代浏览器，或升级浏览器版本';
      case ErrorType.CONFIG_ERROR:
        return '请检查配置参数是否正确，参考文档进行配置';
      case ErrorType.USER_ERROR:
        return '请检查输入参数的类型和格式是否正确';
      default:
        return null;
    }
  }

  /**
   * 初始化错误解决方案
   */
  private initializeErrorSolutions(): void {
    this.errorSolutions.set('ENOTFOUND', '域名解析失败，请检查网络连接');
    this.errorSolutions.set('ECONNREFUSED', '连接被拒绝，请检查服务器状态');
    this.errorSolutions.set('ETIMEDOUT', '连接超时，请检查网络连接或稍后重试');
    this.errorSolutions.set('CERT_UNTRUSTED', 'SSL证书不受信任，请检查证书配置');
    this.errorSolutions.set('MIXED_CONTENT', '混合内容错误，请使用HTTPS协议');
  }
}