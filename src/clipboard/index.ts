import { isElement, getElement } from '../utils/dom';
import { BaseManager } from '../core/BaseManager';
import { BaseOptions } from '../types/core';
import { ErrorType } from '../types/errors';

/**
 * 剪贴板数据类型
 */
export type ClipboardDataType = 'text' | 'html' | 'image' | 'rtf' | 'files';

/**
 * 剪贴板数据接口
 */
export interface ClipboardData {
  type: ClipboardDataType;
  data: string | Blob | File[] | ArrayBuffer;
  size?: number;
  timestamp?: number;
  mimeType?: string;
  encoding?: string;
}

/**
 * 复制选项接口
 */
export interface CopyOptions {
  format?: ClipboardDataType;
  fallback?: boolean;
  timeout?: number;
  validateData?: boolean;
  mimeType?: string;
  encoding?: string;
  preserveFormatting?: boolean;
  sanitizeHtml?: boolean;
}

/**
 * 粘贴选项接口
 */
export interface PasteOptions {
  format?: ClipboardDataType;
  fallback?: boolean;
  timeout?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  sanitizeHtml?: boolean;
  preserveFormatting?: boolean;
}

/**
 * 剪贴板管理器配置接口
 */
export interface ClipboardManagerOptions extends BaseOptions {
  /** 默认数据格式 */
  defaultFormat?: ClipboardDataType;
  /** 是否启用权限检查 */
  enablePermissionCheck?: boolean;
  /** 最大数据大小（字节） */
  maxDataSize?: number;
  /** 是否启用数据验证 */
  enableDataValidation?: boolean;
  /** 是否启用降级处理 */
  enableFallback?: boolean;
  /** 权限请求超时时间 */
  permissionTimeout?: number;
  /** 是否启用HTML清理 */
  enableHtmlSanitization?: boolean;
  /** 支持的MIME类型 */
  supportedMimeTypes?: string[];
  /** 是否启用自动权限请求 */
  autoRequestPermissions?: boolean;
  /** 降级策略优先级 */
  fallbackStrategies?: ('modern' | 'execCommand' | 'selection' | 'input')[];
  /** 是否启用数据转换 */
  enableDataConversion?: boolean;
  /** 最大文件数量 */
  maxFileCount?: number;
  /** 支持的文件类型 */
  allowedFileTypes?: string[];
}

/**
 * 剪贴板权限状态
 */
export enum ClipboardPermissionState {
  GRANTED = 'granted',
  DENIED = 'denied',
  PROMPT = 'prompt',
  UNKNOWN = 'unknown'
}

/**
 * 降级策略类型
 */
export enum FallbackStrategy {
  MODERN_API = 'modern',
  EXEC_COMMAND = 'execCommand',
  SELECTION_API = 'selection',
  INPUT_ELEMENT = 'input',
  TEXTAREA_ELEMENT = 'textarea'
}

/**
 * 数据转换器接口
 */
export interface DataConverter {
  /** 源数据类型 */
  readonly fromType: ClipboardDataType;
  /** 目标数据类型 */
  readonly toType: ClipboardDataType;
  /** 转换器名称 */
  readonly name: string;
  /** 是否支持大数据处理 */
  readonly supportsBigData?: boolean;
  
  canConvert(from: ClipboardDataType, to: ClipboardDataType): boolean;
  convert(data: any, from: ClipboardDataType, to: ClipboardDataType): Promise<any>;
  
  /** 验证输入数据 */
  validateInput?(data: any): boolean;
  /** 获取转换选项 */
  getOptions?(): Record<string, any>;
}

/**
 * 权限请求结果
 */
export interface PermissionRequestResult {
  granted: boolean;
  state: ClipboardPermissionState;
  error?: Error;
  fallbackAvailable: boolean;
}

/**
 * 数据验证规则
 */
export interface DataValidationRule {
  /** 规则名称 */
  name: string;
  /** 验证函数 */
  validate: (data: any, type: ClipboardDataType) => boolean | string;
  /** 是否为必需验证 */
  required?: boolean;
  /** 错误消息 */
  errorMessage?: string;
}

/**
 * 数据验证结果
 */
export interface DataValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
  /** 验证后的数据 */
  processedData?: any;
}

/**
 * 数据处理选项
 */
export interface DataProcessingOptions {
  /** 是否启用数据压缩 */
  enableCompression?: boolean;
  /** 压缩阈值（字节） */
  compressionThreshold?: number;
  /** 是否启用分块处理 */
  enableChunking?: boolean;
  /** 分块大小（字节） */
  chunkSize?: number;
  /** 是否启用缓存 */
  enableCaching?: boolean;
  /** 缓存过期时间（毫秒） */
  cacheExpiry?: number;
  /** 最大处理时间（毫秒） */
  maxProcessingTime?: number;
}

/**
 * 数据处理结果
 */
export interface DataProcessingResult<T = any> {
  /** 处理后的数据 */
  data: T;
  /** 原始数据大小 */
  originalSize: number;
  /** 处理后数据大小 */
  processedSize: number;
  /** 处理时间（毫秒） */
  processingTime: number;
  /** 是否使用了缓存 */
  fromCache: boolean;
  /** 是否被压缩 */
  compressed: boolean;
  /** 处理步骤 */
  steps: string[];
}

/**
 * 剪贴板管理器类
 * 继承 BaseManager，提供统一的架构模式
 */
export class ClipboardManager extends BaseManager<ClipboardManagerOptions> {
  private dataConverters: Map<string, DataConverter> = new Map();
  private permissionCache: Map<string, ClipboardPermissionState> = new Map();
  private eventListeners: Map<string, EventListener[]> = new Map();

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options?: ClipboardManagerOptions) {
    super(options, 'ClipboardManager');
    this.initializeDataConverters();
  }

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<ClipboardManagerOptions> {
    return {
      debug: false,
      timeout: 5000,
      retries: 2,
      cache: true,
      cacheTTL: 30000,
      defaultFormat: 'text',
      enablePermissionCheck: true,
      maxDataSize: 10 * 1024 * 1024, // 10MB
      enableDataValidation: true,
      enableFallback: true,
      permissionTimeout: 3000,
      enableHtmlSanitization: true,
      supportedMimeTypes: [
        'text/plain',
        'text/html',
        'text/rtf',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp'
      ],
      autoRequestPermissions: true,
      fallbackStrategies: ['modern', 'execCommand', 'selection', 'input'],
      enableDataConversion: true,
      maxFileCount: 10,
      allowedFileTypes: ['image/*', 'text/*', '.pdf', '.doc', '.docx']
    };
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    this.ensureNotDestroyed();
    
    if (this.initialized) {
      return;
    }

    try {
      this.logger.info('Initializing ClipboardManager');
      
      // 检查浏览器支持
      await this.checkBrowserSupport();
      
      // 检查权限状态
      if (this.options.enablePermissionCheck) {
        await this.checkPermissions();
      }
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 初始化默认验证规则
      this.initializeValidationRules();
      
      this.initialized = true;
      this.emit('initialized');
      
      this.logger.info('ClipboardManager initialized successfully');
    } catch (error) {
      const processedError = this.handleError(error as Error, 'initialize');
      throw processedError;
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.logger.info('Destroying ClipboardManager');
    
    // 清理事件监听器
    this.removeEventListeners();
    
    // 清理缓存
    this.permissionCache.clear();
    this.dataConverters.clear();
    this.eventListeners.clear();
    
    // 调用基类销毁方法
    this.baseDestroy();
    
    this.logger.info('ClipboardManager destroyed');
  }

  /**
   * 检查是否支持现代剪贴板 API
   */
  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 
           'clipboard' in navigator && 
           'writeText' in navigator.clipboard;
  }

  /**
   * 检查是否支持读取剪贴板
   */
  get canRead(): boolean {
    return typeof navigator !== 'undefined' && 
           'clipboard' in navigator && 
           'readText' in navigator.clipboard;
  }

  /**
   * 检查是否支持写入剪贴板
   */
  get canWrite(): boolean {
    return this.isSupported;
  }

  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本
   * @param options 复制选项
   * @returns 是否复制成功
   */
  async copyText(text: string, options: CopyOptions = {}): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      // 验证输入
      if (!this.validateInput(text, { type: 'string', required: true })) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Invalid text input for clipboard copy',
          { context: { method: 'copyText' } }
        );
      }

      // 数据验证和转换
      let processedText = text;
      if (this.options.enableDataValidation) {
        this.validateClipboardData(text, 'text');
      }

      // 数据格式转换（如果需要）
      if (options.format && options.format !== 'text') {
        processedText = await this.convertData(text, 'text', options.format, {
          enableCaching: this.options.cache,
          enableChunking: true,
          maxProcessingTime: this.options.timeout
        });
      }

      const cacheKey = `copy_text_${this.hashString(processedText)}`;
      
      // 尝试从缓存获取结果
      const cached = this.getCached<boolean>(cacheKey);
      if (cached !== undefined) {
        this.logger.debug('Using cached copy result');
        return cached;
      }

      let result = false;
      let permissionResult: PermissionRequestResult | null = null;

      try {
        // 智能权限检查和请求
        if (this.options.enablePermissionCheck) {
          permissionResult = await this.requestPermissionSmart('write');
          
          if (!permissionResult.granted && !permissionResult.fallbackAvailable) {
            throw permissionResult.error || this.errorHandler.createError(
              ErrorType.PERMISSION_ERROR,
              'Clipboard write permission denied and no fallback available',
              { context: { method: 'copyText' } }
            );
          }
        }

        // 尝试现代API
        if (this.canWrite && (!permissionResult || permissionResult.granted)) {
          await navigator.clipboard.writeText(processedText);
          result = true;
          this.logger.debug('Text copied using modern API');
        } else if (options.fallback !== false && this.options.enableFallback) {
          result = await this.fallbackCopyText(processedText);
          this.logger.debug('Text copied using fallback method');
        } else {
          throw this.errorHandler.createError(
            ErrorType.SYSTEM_ERROR,
            'Clipboard API not supported and fallback disabled',
            { context: { method: 'copyText' } }
          );
        }
      } catch (error) {
        // 如果现代API失败，尝试降级方案
        if (options.fallback !== false && this.options.enableFallback) {
          try {
            result = await this.fallbackCopyText(processedText);
            this.logger.warn('Fallback to alternative method after API failure');
          } catch (fallbackError) {
            // 如果降级也失败，抛出原始错误
            throw error;
          }
        } else {
          throw error;
        }
      }

      // 缓存结果
      this.setCached(cacheKey, result, 5000); // 5秒缓存

      // 触发事件
      if (result) {
        this.emit('copy', { 
          type: 'text', 
          data: processedText, 
          size: processedText.length,
          timestamp: Date.now(),
          mimeType: options.mimeType || 'text/plain',
          encoding: options.encoding || 'utf-8'
        });
      }

      return result;
    }, 'copyText');
  }

  /**
   * 复制 HTML 到剪贴板
   * @param html 要复制的HTML内容
   * @param options 复制选项
   * @returns 是否复制成功
   */
  async copyHTML(html: string, options: CopyOptions = {}): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      // 验证输入
      if (!this.validateInput(html, { type: 'string', required: true })) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Invalid HTML input for clipboard copy',
          { context: { method: 'copyHTML' } }
        );
      }

      // 数据验证和清理
      let processedHtml = html;
      if (this.options.enableDataValidation) {
        this.validateClipboardData(html, 'html');
      }

      // HTML清理
      if (options.sanitizeHtml !== false && this.options.enableHtmlSanitization) {
        processedHtml = this.sanitizeHtml(html);
      }

      // 数据格式转换（如果需要）
      if (options.format && options.format !== 'html') {
        processedHtml = await this.convertData(processedHtml, 'html', options.format, {
          enableCaching: this.options.cache,
          enableChunking: true,
          maxProcessingTime: this.options.timeout
        });
      }

      const cacheKey = `copy_html_${this.hashString(processedHtml)}`;
      
      // 尝试从缓存获取结果
      const cached = this.getCached<boolean>(cacheKey);
      if (cached !== undefined) {
        this.logger.debug('Using cached HTML copy result');
        return cached;
      }

      let result = false;
      let permissionResult: PermissionRequestResult | null = null;

      try {
        // 智能权限检查和请求
        if (this.options.enablePermissionCheck) {
          permissionResult = await this.requestPermissionSmart('write');
          
          if (!permissionResult.granted && !permissionResult.fallbackAvailable) {
            throw permissionResult.error || this.errorHandler.createError(
              ErrorType.PERMISSION_ERROR,
              'Clipboard write permission denied and no fallback available',
              { context: { method: 'copyHTML' } }
            );
          }
        }

        // 尝试现代API
        if (this.canWrite && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined' && 
            (!permissionResult || permissionResult.granted)) {
          const mimeType = options.mimeType || 'text/html';
          const blob = new Blob([processedHtml], { type: mimeType });
          const data = [new ClipboardItem({ [mimeType]: blob })];
          await (navigator.clipboard as any).write(data);
          result = true;
          this.logger.debug('HTML copied using modern API');
        } else if (options.fallback !== false && this.options.enableFallback) {
          result = await this.fallbackCopyHTML(processedHtml);
          this.logger.debug('HTML copied using fallback method');
        } else {
          throw this.errorHandler.createError(
            ErrorType.SYSTEM_ERROR,
            'Clipboard HTML API not supported and fallback disabled',
            { context: { method: 'copyHTML' } }
          );
        }
      } catch (error) {
        // 如果现代API失败，尝试降级方案
        if (options.fallback !== false && this.options.enableFallback) {
          try {
            result = await this.fallbackCopyHTML(processedHtml);
            this.logger.warn('Fallback to alternative method after HTML API failure');
          } catch (fallbackError) {
            // 如果降级也失败，抛出原始错误
            throw error;
          }
        } else {
          throw error;
        }
      }

      // 缓存结果
      this.setCached(cacheKey, result, 5000); // 5秒缓存

      // 触发事件
      if (result) {
        this.emit('copy', { 
          type: 'html', 
          data: processedHtml, 
          size: processedHtml.length,
          timestamp: Date.now(),
          mimeType: options.mimeType || 'text/html',
          encoding: options.encoding || 'utf-8'
        });
      }

      return result;
    }, 'copyHTML');
  }

  /**
   * 复制元素内容到剪贴板
   * @param element 要复制的元素或元素选择器
   * @param options 复制选项
   * @returns 是否复制成功
   */
  async copyElement(element: Element | string, options: CopyOptions = {}): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      const targetElement = getElement(element);
      if (!targetElement) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Invalid element provided for clipboard copy',
          { context: { method: 'copyElement', input: element } }
        );
      }

      const { format = this.options.defaultFormat, fallback = this.options.enableFallback } = options;

      try {
        switch (format) {
          case 'html':
            return await this.copyHTML(targetElement.innerHTML, options);
          case 'text':
          default:
            return await this.copyText(targetElement.textContent || '', options);
        }
      } catch (error) {
        if (fallback) {
          this.logger.warn('Attempting fallback element copy method');
          return await this.fallbackCopyElement(targetElement, format);
        }
        throw error;
      }
    }, 'copyElement');
  }

  /**
   * 从剪贴板读取文本
   * @param options 读取选项
   * @returns 剪贴板中的文本内容
   */
  async readText(options: PasteOptions = {}): Promise<string> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      if (!this.canRead) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'Clipboard reading not supported in this browser',
          { context: { method: 'readText' } }
        );
      }

      let permissionResult: PermissionRequestResult | null = null;

      // 智能权限检查和请求
      if (this.options.enablePermissionCheck) {
        permissionResult = await this.requestPermissionSmart('read');
        
        if (!permissionResult.granted) {
          throw permissionResult.error || this.errorHandler.createError(
            ErrorType.PERMISSION_ERROR,
            'Clipboard read permission denied',
            { context: { method: 'readText', extra: { permission: permissionResult.state } } }
          );
        }
      }

      const text = await navigator.clipboard.readText();
      
      // 数据验证
      if (this.options.enableDataValidation) {
        this.validateClipboardData(text, 'text');
      }

      // 大小检查
      if (options.maxSize && text.length > options.maxSize) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          `Clipboard text exceeds maximum size limit (${options.maxSize} characters)`,
          { context: { method: 'readText', extra: { size: text.length, maxSize: options.maxSize } } }
        );
      }

      // 数据格式转换（如果需要）
      let processedText = text;
      if (options.format && options.format !== 'text') {
        processedText = await this.convertData(text, 'text', options.format, {
          enableCaching: this.options.cache,
          enableChunking: true,
          maxProcessingTime: this.options.timeout
        });
      }

      // HTML清理（如果需要）
      if (options.format === 'html' && options.sanitizeHtml !== false && this.options.enableHtmlSanitization) {
        processedText = this.sanitizeHtml(processedText);
      }

      this.logger.debug(`Read ${text.length} characters from clipboard`);
      
      // 触发事件
      this.emit('read', { 
        type: 'text', 
        data: processedText, 
        size: processedText.length,
        timestamp: Date.now(),
        mimeType: 'text/plain',
        encoding: 'utf-8'
      });

      return processedText;
    }, 'readText');
  }

  /**
   * 从剪贴板读取 HTML
   * @param options 读取选项
   * @returns 剪贴板中的HTML内容
   */
  async readHTML(options: PasteOptions = {}): Promise<string> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      if (!this.canRead || !('read' in navigator.clipboard)) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'Clipboard HTML reading not supported in this browser',
          { context: { method: 'readHTML' } }
        );
      }

      // 检查权限
      if (this.options.enablePermissionCheck) {
        const permission = await this.checkReadPermission();
        if (permission !== ClipboardPermissionState.GRANTED) {
          throw this.errorHandler.createError(
            ErrorType.PERMISSION_ERROR,
            'Clipboard read permission denied',
            { context: { method: 'readHTML', extra: { permission } } }
          );
        }
      }

      const data = await (navigator.clipboard as any).read();
      
      for (const item of data) {
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html');
          const html = await blob.text();
          
          // 数据验证
          if (this.options.enableDataValidation) {
            this.validateClipboardData(html, 'html');
          }

          // 大小检查
          if (options.maxSize && html.length > options.maxSize) {
            throw this.errorHandler.createError(
              ErrorType.USER_ERROR,
              `Clipboard HTML exceeds maximum size limit (${options.maxSize} characters)`,
              { context: { method: 'readHTML', extra: { size: html.length, maxSize: options.maxSize } } }
            );
          }

          this.logger.debug(`Read ${html.length} characters of HTML from clipboard`);
          
          // 触发事件
          this.emit('read', { type: 'html', data: html, timestamp: Date.now() });

          return html;
        }
      }
      
      throw this.errorHandler.createError(
        ErrorType.USER_ERROR,
        'No HTML content found in clipboard',
        { context: { method: 'readHTML' } }
      );
    }, 'readHTML');
  }

  /**
   * 复制文件到剪贴板
   * @param files 要复制的文件数组
   * @param options 复制选项
   * @returns 是否复制成功
   */
  async copyFiles(files: File[], options: CopyOptions = {}): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      // 验证输入
      if (!Array.isArray(files) || files.length === 0) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Invalid files input for clipboard copy',
          { context: { method: 'copyFiles' } }
        );
      }

      // 数据验证
      if (this.options.enableDataValidation) {
        this.validateClipboardData(files, 'files');
      }

      let permissionResult: PermissionRequestResult | null = null;

      // 智能权限检查和请求
      if (this.options.enablePermissionCheck) {
        permissionResult = await this.requestPermissionSmart('write');
        
        if (!permissionResult.granted && !permissionResult.fallbackAvailable) {
          throw permissionResult.error || this.errorHandler.createError(
            ErrorType.PERMISSION_ERROR,
            'Clipboard write permission denied and no fallback available',
            { context: { method: 'copyFiles' } }
          );
        }
      }

      try {
        // 检查是否支持文件复制
        if (this.canWrite && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          const clipboardItems: ClipboardItem[] = [];
          
          for (const file of files) {
            if (this.options.supportedMimeTypes.includes(file.type) || 
                this.options.supportedMimeTypes.some(type => type.includes('*') && file.type.startsWith(type.split('/')[0]))) {
              clipboardItems.push(new ClipboardItem({ [file.type]: file }));
            } else {
              this.logger.warn(`File type ${file.type} not supported, skipping file: ${file.name}`);
            }
          }

          if (clipboardItems.length > 0) {
            await (navigator.clipboard as any).write(clipboardItems);
            this.logger.debug(`${clipboardItems.length} files copied using modern API`);
            
            // 触发事件
            this.emit('copy', { 
              type: 'files', 
              data: files, 
              size: files.reduce((total, file) => total + file.size, 0),
              timestamp: Date.now()
            });
            
            return true;
          }
        }

        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'File clipboard copying not supported in this browser',
          { context: { method: 'copyFiles' } }
        );
      } catch (error) {
        // 文件复制通常没有降级方案，因为安全限制
        this.logger.error('File copy failed:', error);
        throw error;
      }
    }, 'copyFiles');
  }

  /**
   * 从剪贴板读取文件
   * @param options 读取选项
   * @returns 剪贴板中的文件数组
   */
  async readFiles(options: PasteOptions = {}): Promise<File[]> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      if (!this.canRead || !('read' in navigator.clipboard)) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'Clipboard file reading not supported in this browser',
          { context: { method: 'readFiles' } }
        );
      }

      let permissionResult: PermissionRequestResult | null = null;

      // 智能权限检查和请求
      if (this.options.enablePermissionCheck) {
        permissionResult = await this.requestPermissionSmart('read');
        
        if (!permissionResult.granted) {
          throw permissionResult.error || this.errorHandler.createError(
            ErrorType.PERMISSION_ERROR,
            'Clipboard read permission denied',
            { context: { method: 'readFiles', extra: { permission: permissionResult.state } } }
          );
        }
      }

      const data = await (navigator.clipboard as any).read();
      const files: File[] = [];
      
      for (const item of data) {
        for (const type of item.types) {
          if (options.acceptedTypes && !options.acceptedTypes.includes(type)) {
            continue;
          }
          
          if (this.isFileTypeAllowed(type)) {
            try {
              const blob = await item.getType(type);
              const file = new File([blob], `clipboard-file.${this.getFileExtension(type)}`, { type });
              files.push(file);
            } catch (error) {
              this.logger.warn(`Failed to read file of type ${type}:`, error);
            }
          }
        }
      }

      // 数据验证
      if (this.options.enableDataValidation && files.length > 0) {
        this.validateClipboardData(files, 'files');
      }

      this.logger.debug(`Read ${files.length} files from clipboard`);
      
      // 触发事件
      if (files.length > 0) {
        this.emit('read', { 
          type: 'files', 
          data: files, 
          size: files.reduce((total, file) => total + file.size, 0),
          timestamp: Date.now()
        });
      }

      return files;
    }, 'readFiles');
  }

  /**
   * 从剪贴板读取数据
   * @param options 读取选项
   * @returns 剪贴板数据
   */
  async read(options: PasteOptions = {}): Promise<ClipboardData> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      const { format = this.options.defaultFormat, fallback = this.options.enableFallback } = options;

      try {
        switch (format) {
          case 'html':
            const html = await this.readHTML(options);
            return { 
              type: 'html', 
              data: html, 
              size: html.length,
              timestamp: Date.now(),
              mimeType: 'text/html',
              encoding: 'utf-8'
            };
          case 'files':
            const files = await this.readFiles(options);
            return { 
              type: 'files', 
              data: files, 
              size: files.reduce((total, file) => total + file.size, 0),
              timestamp: Date.now()
            };
          case 'text':
          default:
            const text = await this.readText(options);
            return { 
              type: 'text', 
              data: text, 
              size: text.length,
              timestamp: Date.now(),
              mimeType: 'text/plain',
              encoding: 'utf-8'
            };
        }
      } catch (error) {
        if (fallback) {
          this.logger.warn('Attempting fallback read method');
          return await this.fallbackRead(format);
        }
        throw error;
      }
    }, 'read');
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'text/plain': 'txt',
      'text/html': 'html',
      'text/css': 'css',
      'text/javascript': 'js',
      'application/json': 'json',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
    };

    return extensions[mimeType] || 'bin';
  }

  /**
   * 检查浏览器支持
   */
  private async checkBrowserSupport(): Promise<void> {
    if (typeof navigator === 'undefined') {
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Navigator not available - running in non-browser environment',
        { context: { method: 'checkBrowserSupport' } }
      );
    }

    // 记录支持的功能
    const support = {
      clipboard: 'clipboard' in navigator,
      writeText: this.canWrite,
      readText: this.canRead,
      write: this.canWrite && 'write' in navigator.clipboard,
      read: this.canRead && 'read' in navigator.clipboard,
      execCommand: typeof document !== 'undefined' && 'execCommand' in document
    };

    this.logger.debug('Browser clipboard support:', support);

    if (!support.clipboard && !support.execCommand) {
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'No clipboard support available in this browser',
        { context: { method: 'checkBrowserSupport', extra: { support } } }
      );
    }
  }

  /**
   * 检查权限状态
   */
  private async checkPermissions(): Promise<void> {
    if (!('permissions' in navigator)) {
      this.logger.warn('Permissions API not available');
      return;
    }

    try {
      const writePermission = await this.checkWritePermission();
      const readPermission = await this.checkReadPermission();
      
      this.logger.debug('Clipboard permissions:', { write: writePermission, read: readPermission });
    } catch (error) {
      this.logger.warn('Failed to check clipboard permissions:', error);
    }
  }

  /**
   * 检查写入权限
   */
  private async checkWritePermission(): Promise<ClipboardPermissionState> {
    if (!('permissions' in navigator)) {
      return ClipboardPermissionState.UNKNOWN;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as any });
      return permission.state as ClipboardPermissionState;
    } catch (error) {
      this.logger.warn('Failed to check clipboard write permission:', error);
      return ClipboardPermissionState.UNKNOWN;
    }
  }

  /**
   * 检查读取权限
   */
  private async checkReadPermission(): Promise<ClipboardPermissionState> {
    if (!('permissions' in navigator)) {
      return ClipboardPermissionState.UNKNOWN;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as any });
      return permission.state as ClipboardPermissionState;
    } catch (error) {
      this.logger.warn('Failed to check clipboard read permission:', error);
      return ClipboardPermissionState.UNKNOWN;
    }
  }

  /**
   * 智能权限请求
   * @param operation 操作类型 ('read' | 'write')
   * @returns 权限请求结果
   */
  private async requestPermissionSmart(operation: 'read' | 'write'): Promise<PermissionRequestResult> {
    const cacheKey = `permission_${operation}`;
    
    // 检查缓存的权限状态
    const cachedState = this.permissionCache.get(cacheKey);
    if (cachedState === ClipboardPermissionState.GRANTED) {
      return {
        granted: true,
        state: cachedState,
        fallbackAvailable: this.options.enableFallback
      };
    }

    const result: PermissionRequestResult = {
      granted: false,
      state: ClipboardPermissionState.UNKNOWN,
      fallbackAvailable: this.options.enableFallback
    };

    try {
      // 首先检查当前权限状态
      const currentState = operation === 'read' 
        ? await this.checkReadPermission()
        : await this.checkWritePermission();

      // 缓存权限状态
      this.permissionCache.set(cacheKey, currentState);

      if (currentState === ClipboardPermissionState.GRANTED) {
        result.granted = true;
        result.state = currentState;
        return result;
      }

      // 如果权限被拒绝且不允许自动请求，直接返回
      if (currentState === ClipboardPermissionState.DENIED && !this.options.autoRequestPermissions) {
        result.state = currentState;
        result.error = this.errorHandler.createError(
          ErrorType.PERMISSION_ERROR,
          `Clipboard ${operation} permission denied and auto-request disabled`,
          { 
            context: { method: 'requestPermissionSmart', extra: { operation } },
            recoverable: this.options.enableFallback
          }
        );
        return result;
      }

      // 尝试通过实际操作来触发权限请求
      if (operation === 'write') {
        await this.triggerWritePermissionRequest();
      } else {
        await this.triggerReadPermissionRequest();
      }

      // 重新检查权限状态
      const newState = operation === 'read' 
        ? await this.checkReadPermission()
        : await this.checkWritePermission();

      // 更新缓存
      this.permissionCache.set(cacheKey, newState);

      result.granted = newState === ClipboardPermissionState.GRANTED;
      result.state = newState;

      if (!result.granted) {
        result.error = this.errorHandler.createError(
          ErrorType.PERMISSION_ERROR,
          this.getPermissionErrorMessage(operation, newState),
          { 
            context: { method: 'requestPermissionSmart', extra: { operation, state: newState } },
            recoverable: this.options.enableFallback
          }
        );
      }

    } catch (error) {
      const processedError = this.handleError(error as Error, 'requestPermissionSmart');
      result.error = processedError.originalError;
    }

    return result;
  }

  /**
   * 初始化数据转换器
   */
  private initializeDataConverters(): void {
    // 注册内置数据转换器
    this.registerDataConverter(new TextToHtmlConverter());
    this.registerDataConverter(new HtmlToTextConverter());
    this.registerDataConverter(new TextToRtfConverter());
    this.registerDataConverter(new RtfToTextConverter());
    this.registerDataConverter(new ImageToBase64Converter());
    this.registerDataConverter(new Base64ToImageConverter());
  }

  /**
   * 注册数据转换器
   * @param converter 数据转换器
   */
  private registerDataConverter(converter: DataConverter): void {
    const key = `${converter.fromType}-to-${converter.toType}`;
    this.dataConverters.set(key, converter);
    this.logger.debug(`Registered data converter: ${key}`);
  }

  /**
   * 初始化默认验证规则
   */
  private initializeValidationRules(): void {
    const processor = DataProcessor.getInstance();

    // 文本数据验证规则
    processor.addValidationRule('text', {
      name: 'textLength',
      validate: (data: string) => {
        if (data.length > 1000000) { // 1MB
          return 'Text data is very large and may impact performance';
        }
        return true;
      },
      errorMessage: 'Text data size validation failed'
    });

    processor.addValidationRule('text', {
      name: 'textEncoding',
      validate: (data: string) => {
        try {
          // 检查是否包含无效字符
          encodeURIComponent(data);
          return true;
        } catch {
          return 'Text contains invalid characters';
        }
      },
      errorMessage: 'Text encoding validation failed'
    });

    // HTML数据验证规则
    processor.addValidationRule('html', {
      name: 'htmlStructure',
      validate: (data: string) => {
        // 简单的HTML结构检查
        const openTags = (data.match(/<[^\/][^>]*>/g) || []).length;
        const closeTags = (data.match(/<\/[^>]*>/g) || []).length;
        
        if (Math.abs(openTags - closeTags) > 10) {
          return 'HTML structure appears to be malformed';
        }
        return true;
      },
      errorMessage: 'HTML structure validation failed'
    });

    // 文件数据验证规则
    processor.addValidationRule('files', {
      name: 'fileTypes',
      validate: (data: File[]) => {
        const suspiciousTypes = ['.exe', '.bat', '.cmd', '.scr', '.vbs'];
        for (const file of data) {
          if (suspiciousTypes.some(type => file.name.toLowerCase().endsWith(type))) {
            return `Potentially dangerous file type detected: ${file.name}`;
          }
        }
        return true;
      },
      errorMessage: 'File type security validation failed'
    });

    processor.addValidationRule('files', {
      name: 'fileSizeDistribution',
      validate: (data: File[]) => {
        const totalSize = data.reduce((sum, file) => sum + file.size, 0);
        const largeFiles = data.filter(file => file.size > totalSize * 0.8);
        
        if (largeFiles.length > 0) {
          return `Large files detected that may impact performance: ${largeFiles.map(f => f.name).join(', ')}`;
        }
        return true;
      },
      errorMessage: 'File size distribution validation failed'
    });

    this.logger.debug('Default validation rules initialized');
  }

  /**
   * 增强的数据转换方法
   * @param data 原始数据
   * @param from 源格式
   * @param to 目标格式
   * @param options 处理选项
   * @returns 转换后的数据
   */
  private async convertData(
    data: any, 
    from: ClipboardDataType, 
    to: ClipboardDataType,
    options: DataProcessingOptions = {}
  ): Promise<any> {
    if (from === to) {
      return data;
    }

    const cacheKey = `convert_${from}_${to}_${this.hashString(JSON.stringify(data))}`;
    
    // 检查缓存
    if (options.enableCaching !== false && this.options.cache) {
      const cached = this.getCached(cacheKey);
      if (cached !== undefined) {
        this.logger.debug(`Using cached conversion result for ${from} to ${to}`);
        return cached;
      }
    }

    const converterKey = `${from}-to-${to}`;
    const converter = this.dataConverters.get(converterKey);
    
    if (!converter || !converter.canConvert(from, to)) {
      this.logger.warn(`No converter available for ${from} to ${to}`);
      return data;
    }

    try {
      const startTime = Date.now();
      let result: any;

      // 对于大数据，使用专门的处理逻辑
      if (converter.supportsBigData && this.isLargeData(data)) {
        this.logger.debug(`Processing large data conversion: ${from} to ${to}`);
        const processor = DataProcessor.getInstance();
        const processingResult = await processor.processLargeData(
          data,
          async (chunk) => await converter.convert(chunk, from, to),
          options
        );
        result = processingResult.data.join('');
      } else {
        result = await converter.convert(data, from, to);
      }

      const processingTime = Date.now() - startTime;
      this.logger.debug(`Data conversion completed in ${processingTime}ms`);

      // 缓存结果
      if (options.enableCaching !== false && this.options.cache) {
        this.setCached(cacheKey, result, options.cacheExpiry || this.options.cacheTTL);
      }

      return result;
    } catch (error) {
      this.logger.error(`Data conversion failed (${from} to ${to}):`, error);
      throw this.errorHandler.createError(
        ErrorType.INTERNAL_ERROR,
        `Failed to convert data from ${from} to ${to}: ${(error as Error).message}`,
        { context: { method: 'convertData', extra: { from, to } }, cause: error as Error }
      );
    }
  }

  /**
   * 检查是否为大数据
   */
  private isLargeData(data: any): boolean {
    const threshold = 100 * 1024; // 100KB
    
    if (typeof data === 'string') {
      return data.length > threshold;
    }
    if (data instanceof Blob) {
      return data.size > threshold;
    }
    if (Array.isArray(data)) {
      return data.reduce((total, item) => {
        if (item instanceof File) return total + item.size;
        if (typeof item === 'string') return total + item.length;
        return total + JSON.stringify(item).length;
      }, 0) > threshold;
    }
    
    return JSON.stringify(data).length > threshold;
  }

  /**
   * 增强的剪贴板数据验证
   * @param data 数据
   * @param type 数据类型
   * @param options 验证选项
   */
  private validateClipboardData(
    data: any, 
    type: ClipboardDataType, 
    options: { strict?: boolean } = {}
  ): DataValidationResult {
    const processor = DataProcessor.getInstance();
    
    // 自动检测数据类型（如果未指定）
    const detectedType = type || processor.detectDataType(data);
    
    // 执行统一验证
    const validationResult = processor.validateData(data, detectedType, options);
    
    // 执行内置验证规则
    this.performBuiltInValidation(data, detectedType, validationResult);
    
    // 如果验证失败，抛出错误
    if (!validationResult.valid) {
      throw this.errorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        `Data validation failed: ${validationResult.errors.join(', ')}`,
        { 
          context: { 
            method: 'validateClipboardData', 
            extra: { 
              type: detectedType,
              errors: validationResult.errors,
              warnings: validationResult.warnings
            }
          } 
        }
      );
    }

    // 记录警告
    if (validationResult.warnings.length > 0) {
      this.logger.warn('Data validation warnings:', validationResult.warnings);
    }

    return validationResult;
  }

  /**
   * 执行内置验证规则
   */
  private performBuiltInValidation(
    data: any, 
    type: ClipboardDataType, 
    result: DataValidationResult
  ): void {
    switch (type) {
      case 'text':
        if (typeof data !== 'string') {
          result.valid = false;
          result.errors.push('Text data must be a string');
        } else if (data.length > this.options.maxDataSize) {
          result.valid = false;
          result.errors.push(`Text data exceeds maximum size limit (${this.options.maxDataSize} characters)`);
        } else if (data.length === 0) {
          result.warnings.push('Empty text data provided');
        }
        break;
      
      case 'html':
        if (typeof data !== 'string') {
          result.valid = false;
          result.errors.push('HTML data must be a string');
        } else {
          if (data.length > this.options.maxDataSize) {
            result.valid = false;
            result.errors.push(`HTML data exceeds maximum size limit (${this.options.maxDataSize} characters)`);
          }
          
          // HTML安全性检查
          if (this.options.enableHtmlSanitization) {
            const dangerousPatterns = [
              /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
              /javascript:/gi,
              /on\w+\s*=/gi
            ];
            
            for (const pattern of dangerousPatterns) {
              if (pattern.test(data)) {
                result.warnings.push('Potentially dangerous HTML content detected');
                break;
              }
            }
          }
        }
        break;
      
      case 'files':
        if (!Array.isArray(data)) {
          result.valid = false;
          result.errors.push('Files data must be an array');
        } else {
          if (data.length > this.options.maxFileCount) {
            result.valid = false;
            result.errors.push(`File count exceeds maximum limit (${this.options.maxFileCount})`);
          }
          
          let totalSize = 0;
          for (const file of data) {
            if (!(file instanceof File)) {
              result.valid = false;
              result.errors.push('Invalid file object in clipboard data');
              continue;
            }
            
            totalSize += file.size;
            
            if (file.size > this.options.maxDataSize) {
              result.valid = false;
              result.errors.push(`File "${file.name}" exceeds maximum size limit`);
            }
            
            if (!this.isFileTypeAllowed(file.type)) {
              result.valid = false;
              result.errors.push(`File type "${file.type}" is not allowed`);
            }
          }
          
          if (totalSize > this.options.maxDataSize) {
            result.valid = false;
            result.errors.push(`Total file size exceeds maximum limit (${this.options.maxDataSize} bytes)`);
          }
        }
        break;
        
      case 'image':
        if (!(data instanceof Blob) || !data.type.startsWith('image/')) {
          result.valid = false;
          result.errors.push('Image data must be a Blob with image MIME type');
        } else if (data.size > this.options.maxDataSize) {
          result.valid = false;
          result.errors.push(`Image size exceeds maximum limit (${this.options.maxDataSize} bytes)`);
        }
        break;
        
      case 'rtf':
        if (typeof data !== 'string') {
          result.valid = false;
          result.errors.push('RTF data must be a string');
        } else if (!data.startsWith('{\\rtf')) {
          result.valid = false;
          result.errors.push('Invalid RTF format');
        } else if (data.length > this.options.maxDataSize) {
          result.valid = false;
          result.errors.push(`RTF data exceeds maximum size limit (${this.options.maxDataSize} characters)`);
        }
        break;
    }
  }





  /**
   * 触发写入权限请求
   */
  private async triggerWritePermissionRequest(): Promise<void> {
    if (this.canWrite) {
      try {
        // 尝试写入一个空字符串来触发权限请求
        await navigator.clipboard.writeText('');
      } catch (error) {
        // 权限被拒绝或其他错误，这是预期的
        this.logger.debug('Write permission request triggered:', error);
      }
    }
  }

  /**
   * 触发读取权限请求
   */
  private async triggerReadPermissionRequest(): Promise<void> {
    if (this.canRead) {
      try {
        // 尝试读取剪贴板来触发权限请求
        await navigator.clipboard.readText();
      } catch (error) {
        // 权限被拒绝或其他错误，这是预期的
        this.logger.debug('Read permission request triggered:', error);
      }
    }
  }

  /**
   * 获取权限错误消息
   */
  private getPermissionErrorMessage(operation: 'read' | 'write', state: ClipboardPermissionState): string {
    const baseMessages = {
      read: '剪贴板读取',
      write: '剪贴板写入'
    };

    // 类型安全的权限状态消息映射，包含所有枚举值
    const stateMessages: Record<ClipboardPermissionState, string> = {
      [ClipboardPermissionState.GRANTED]: '权限已授予。',
      [ClipboardPermissionState.DENIED]: '权限被拒绝。请在浏览器设置中允许剪贴板访问权限，或使用HTTPS协议。',
      [ClipboardPermissionState.PROMPT]: '需要用户授权。请在浏览器弹出的权限请求中点击"允许"。',
      [ClipboardPermissionState.UNKNOWN]: '权限状态未知。可能是浏览器不支持权限API或运行在不安全的上下文中。'
    };

    const fallbackMessage = this.options.enableFallback 
      ? ' 系统将尝试使用降级方案。' 
      : ' 请启用降级处理或使用支持的浏览器。';

    // 使用类型安全的索引访问，TypeScript现在可以确保所有枚举值都有对应的消息
    return `${baseMessages[operation]}${stateMessages[state]}${fallbackMessage}`;
  }



  /**
   * 验证HTML安全性
   */
  private validateHtmlSafety(html: string): void {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>/gi,
      /<input\b[^>]*>/gi,
      /<meta\b[^>]*>/gi,
      /<link\b[^>]*>/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        this.logger.warn('Potentially dangerous HTML content detected and will be sanitized');
        break;
      }
    }
  }

  /**
   * 清理HTML内容
   */
  private sanitizeHtml(html: string): string {
    if (!this.options.enableHtmlSanitization) {
      return html;
    }

    // 移除危险的标签和属性
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
      .replace(/<iframe\b[^>]*>/gi, '')
      .replace(/<object\b[^>]*>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<form\b[^>]*>/gi, '')
      .replace(/<input\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '')
      .replace(/<link\b[^>]*>/gi, '');

    this.logger.debug('HTML content sanitized');
    return sanitized;
  }

  /**
   * 检查文件类型是否被允许
   */
  private isFileTypeAllowed(mimeType: string): boolean {
    if (!this.options.allowedFileTypes.length) {
      return true; // 如果没有限制，允许所有类型
    }

    return this.options.allowedFileTypes.some(allowedType => {
      if (allowedType.includes('*')) {
        // 处理通配符类型，如 "image/*"
        const baseType = allowedType.split('/')[0];
        return mimeType.startsWith(baseType + '/');
      } else if (allowedType.startsWith('.')) {
        // 处理文件扩展名（这里需要文件名，但我们只有MIME类型）
        // 这种情况在实际使用中需要额外的文件名信息
        return false;
      } else {
        // 精确匹配MIME类型
        return mimeType === allowedType;
      }
    });
  }





  /**
   * 生成字符串哈希
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (typeof document === 'undefined') {
      return;
    }

    // 监听系统剪贴板事件
    document.addEventListener('copy', this.handleCopyEvent.bind(this));
    document.addEventListener('paste', this.handlePasteEvent.bind(this));
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.removeEventListener('copy', this.handleCopyEvent.bind(this));
    document.removeEventListener('paste', this.handlePasteEvent.bind(this));
  }

  /**
   * 处理复制事件
   */
  private handleCopyEvent(event: ClipboardEvent): void {
    this.emit('systemCopy', event);
  }

  /**
   * 处理粘贴事件
   */
  private handlePasteEvent(event: ClipboardEvent): void {
    this.emit('systemPaste', event);
  }

  /**
   * 智能降级复制文本方法
   */
  private async fallbackCopyText(text: string): Promise<boolean> {
    const strategies = this.options.fallbackStrategies;
    
    for (const strategy of strategies) {
      try {
        const result = await this.executeFallbackStrategy(strategy, 'copy', text);
        if (result) {
          this.logger.debug(`Fallback text copy successful using ${strategy} strategy`);
          return true;
        }
      } catch (error) {
        this.logger.warn(`Fallback strategy ${strategy} failed:`, error);
        continue;
      }
    }

    throw this.errorHandler.createError(
      ErrorType.SYSTEM_ERROR,
      'All fallback clipboard copy strategies failed',
      { 
        context: { method: 'fallbackCopyText', extra: { strategies } },
        recoverable: false
      }
    );
  }

  /**
   * 执行降级策略
   */
  private async executeFallbackStrategy(
    strategy: string, 
    operation: 'copy' | 'read', 
    data?: any
  ): Promise<boolean | string> {
    if (typeof document === 'undefined') {
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Document not available for fallback operations',
        { context: { method: 'executeFallbackStrategy', extra: { strategy } } }
      );
    }

    switch (strategy) {
      case 'execCommand':
        return this.execCommandFallback(operation, data);
      
      case 'selection':
        return this.selectionApiFallback(operation, data);
      
      case 'input':
        return this.inputElementFallback(operation, data);
      
      case 'textarea':
        return this.textareaElementFallback(operation, data);
      
      default:
        throw this.errorHandler.createError(
          ErrorType.CONFIG_ERROR,
          `Unknown fallback strategy: ${strategy}`,
          { context: { method: 'executeFallbackStrategy', extra: { strategy } } }
        );
    }
  }

  /**
   * execCommand降级策略
   */
  private async execCommandFallback(operation: 'copy' | 'read', data?: string): Promise<boolean | string> {
    if (operation === 'read') {
      // execCommand不支持读取操作
      return false;
    }

    if (!document.execCommand) {
      return false;
    }

    const textArea = document.createElement('textarea');
    textArea.value = data || '';
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    try {
      textArea.focus();
      textArea.select();
      
      // 确保文本被选中
      textArea.setSelectionRange(0, textArea.value.length);
      
      const successful = document.execCommand('copy');
      return successful;
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Selection API降级策略
   */
  private async selectionApiFallback(operation: 'copy' | 'read', data?: string): Promise<boolean | string> {
    if (operation === 'read' || typeof window === 'undefined') {
      return false;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    // 创建临时元素
    const tempDiv = document.createElement('div');
    tempDiv.textContent = data || '';
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-999999px';
    tempDiv.style.top = '-999999px';
    tempDiv.style.opacity = '0';
    
    document.body.appendChild(tempDiv);
    
    try {
      // 选择文本
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      // 尝试复制
      const successful = document.execCommand('copy');
      selection.removeAllRanges();
      
      return successful;
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Input元素降级策略
   */
  private async inputElementFallback(operation: 'copy' | 'read', data?: string): Promise<boolean | string> {
    if (operation === 'read') {
      return false;
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.value = data || '';
    input.style.position = 'fixed';
    input.style.left = '-999999px';
    input.style.top = '-999999px';
    input.style.opacity = '0';
    input.setAttribute('readonly', '');
    
    document.body.appendChild(input);
    
    try {
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
      
      const successful = document.execCommand('copy');
      return successful;
    } finally {
      document.body.removeChild(input);
    }
  }

  /**
   * Textarea元素降级策略
   */
  private async textareaElementFallback(operation: 'copy' | 'read', data?: string): Promise<boolean | string> {
    if (operation === 'read') {
      return false;
    }

    const textarea = document.createElement('textarea');
    textarea.value = data || '';
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    textarea.style.opacity = '0';
    textarea.style.resize = 'none';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    try {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      
      const successful = document.execCommand('copy');
      return successful;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  /**
   * 智能降级复制HTML方法
   */
  private async fallbackCopyHTML(html: string): Promise<boolean> {
    // 对于HTML，我们首先尝试选择API，然后是其他策略
    const htmlStrategies = ['selection', 'execCommand'];
    
    for (const strategy of htmlStrategies) {
      try {
        const result = await this.executeHtmlFallbackStrategy(strategy, html);
        if (result) {
          this.logger.debug(`Fallback HTML copy successful using ${strategy} strategy`);
          return true;
        }
      } catch (error) {
        this.logger.warn(`HTML fallback strategy ${strategy} failed:`, error);
        continue;
      }
    }

    // 如果HTML特定策略都失败，尝试转换为文本后使用文本策略
    try {
      const converter = new HtmlToTextConverter();
      const textContent = await converter.convert(html);
      const result = await this.fallbackCopyText(textContent);
      if (result) {
        this.logger.debug('Fallback HTML copy successful using text conversion');
        return true;
      }
    } catch (error) {
      this.logger.warn('HTML to text fallback failed:', error);
    }

    throw this.errorHandler.createError(
      ErrorType.SYSTEM_ERROR,
      'All fallback HTML copy strategies failed',
      { 
        context: { method: 'fallbackCopyHTML', extra: { strategies: htmlStrategies } },
        recoverable: false
      }
    );
  }

  /**
   * 执行HTML降级策略
   */
  private async executeHtmlFallbackStrategy(strategy: string, html: string): Promise<boolean> {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Document/Window not available for HTML fallback operations',
        { context: { method: 'executeHtmlFallbackStrategy', extra: { strategy } } }
      );
    }

    switch (strategy) {
      case 'selection':
        return this.selectionHtmlFallback(html);
      
      case 'execCommand':
        return this.execCommandHtmlFallback(html);
      
      default:
        throw this.errorHandler.createError(
          ErrorType.CONFIG_ERROR,
          `Unknown HTML fallback strategy: ${strategy}`,
          { context: { method: 'executeHtmlFallbackStrategy', extra: { strategy } } }
        );
    }
  }

  /**
   * 选择API HTML降级策略
   */
  private async selectionHtmlFallback(html: string): Promise<boolean> {
    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    // 创建临时div来渲染HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-999999px';
    tempDiv.style.top = '-999999px';
    tempDiv.style.opacity = '0';
    tempDiv.style.pointerEvents = 'none';
    
    document.body.appendChild(tempDiv);
    
    try {
      // 选择HTML内容
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      // 尝试复制
      const successful = document.execCommand('copy');
      selection.removeAllRanges();
      
      return successful;
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * execCommand HTML降级策略
   */
  private async execCommandHtmlFallback(html: string): Promise<boolean> {
    if (!document.execCommand) {
      return false;
    }

    // 创建可编辑的div
    const editableDiv = document.createElement('div');
    editableDiv.contentEditable = 'true';
    editableDiv.innerHTML = html;
    editableDiv.style.position = 'fixed';
    editableDiv.style.left = '-999999px';
    editableDiv.style.top = '-999999px';
    editableDiv.style.opacity = '0';
    editableDiv.style.pointerEvents = 'none';
    
    document.body.appendChild(editableDiv);
    
    try {
      editableDiv.focus();
      
      // 选择所有内容
      const range = document.createRange();
      range.selectNodeContents(editableDiv);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        const successful = document.execCommand('copy');
        selection.removeAllRanges();
        
        return successful;
      }
      
      return false;
    } finally {
      document.body.removeChild(editableDiv);
    }
  }

  /**
   * 降级复制元素方法
   */
  private async fallbackCopyElement(element: Element, format: ClipboardDataType): Promise<boolean> {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Document/Window not available for fallback element copy',
        { context: { method: 'fallbackCopyElement' } }
      );
    }

    try {
      const range = document.createRange();
      range.selectNodeContents(element);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        const successful = document.execCommand('copy');
        selection.removeAllRanges();
        
        if (successful) {
          this.logger.debug(`Fallback element copy successful (${format})`);
        } else {
          this.logger.warn(`Fallback element copy failed (${format})`);
        }
        
        return successful;
      }
      
      return false;
    } catch (error) {
      this.logger.error('Fallback element copy failed:', error);
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Fallback clipboard element copy failed',
        { context: { method: 'fallbackCopyElement', extra: { format } }, cause: error as Error }
      );
    }
  }

  /**
   * 降级读取方法
   */
  private async fallbackRead(format: ClipboardDataType): Promise<ClipboardData> {
    // 降级读取通常不可行，因为安全限制
    throw this.errorHandler.createError(
      ErrorType.SYSTEM_ERROR,
      `Fallback reading for ${format} is not supported due to security restrictions`,
      { context: { method: 'fallbackRead', extra: { format } } }
    );
  }

  /**
   * 监听剪贴板复制事件
   * @param callback 回调函数
   */
  onCopy(callback: (data: ClipboardData) => void): void {
    this.on('copy', callback);
  }

  /**
   * 监听剪贴板读取事件
   */
  onRead(callback: (data: ClipboardData) => void): void {
    this.on('read', callback);
  }

  /**
   * 监听系统剪贴板复制事件
   */
  onSystemCopy(callback: (event: ClipboardEvent) => void): void {
    this.on('systemCopy', callback);
  }

  /**
   * 监听系统剪贴板粘贴事件
   */
  onSystemPaste(callback: (event: ClipboardEvent) => void): void {
    this.on('systemPaste', callback);
  }

  /**
   * 监听粘贴事件（向后兼容）
   */
  onPaste(callback: (data: ClipboardData) => void): void {
    if (typeof document === 'undefined') {
      this.logger.warn('Document not available for paste event listener');
      return;
    }

    const pasteHandler = (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (clipboardData) {
        try {
          if (clipboardData.types.includes('text/html')) {
            const html = clipboardData.getData('text/html');
            callback({ 
              type: 'html', 
              data: html, 
              size: html.length,
              timestamp: Date.now()
            });
          } else if (clipboardData.types.includes('text/plain')) {
            const text = clipboardData.getData('text/plain');
            callback({ 
              type: 'text', 
              data: text, 
              size: text.length,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          this.handleError(error as Error, 'onPaste');
        }
      }
    };

    document.addEventListener('paste', pasteHandler);
    
    // 提供移除监听器的方法
    this.once('beforeDestroy', () => {
      document.removeEventListener('paste', pasteHandler);
    });
  }

  /**
   * 获取剪贴板权限状态
   */
  async getPermissionStatus(): Promise<{
    write: ClipboardPermissionState;
    read: ClipboardPermissionState;
  }> {
    await this.ensureInitialized();
    
    const writePermission = await this.checkWritePermission();
    const readPermission = await this.checkReadPermission();
    
    return { write: writePermission, read: readPermission };
  }

  /**
   * 请求剪贴板权限
   */
  async requestPermissions(): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      // 使用智能权限请求
      const writeResult = await this.requestPermissionSmart('write');
      const readResult = await this.requestPermissionSmart('read');
      
      this.logger.debug('Permission request results:', {
        write: writeResult.state,
        read: readResult.state
      });
      
      // 至少需要写入权限
      return writeResult.granted;
    } catch (error) {
      this.handleError(error as Error, 'requestPermissions');
      return false;
    }
  }

  /**
   * 清空剪贴板（如果支持）
   */
  async clear(): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      try {
        await this.copyText('');
        this.logger.debug('Clipboard cleared');
        this.emit('cleared');
        return true;
      } catch (error) {
        this.logger.warn('Failed to clear clipboard:', error);
        return false;
      }
    }, 'clear');
  }

  /**
   * 添加自定义数据验证规则
   * @param type 数据类型
   * @param rule 验证规则
   */
  addValidationRule(type: ClipboardDataType, rule: DataValidationRule): void {
    const processor = DataProcessor.getInstance();
    processor.addValidationRule(type, rule);
    this.logger.debug(`Added custom validation rule for ${type}: ${rule.name}`);
  }

  /**
   * 注册自定义数据转换器
   * @param converter 数据转换器
   */
  addDataConverter(converter: DataConverter): void {
    this.registerDataConverter(converter);
    this.logger.debug(`Added custom data converter: ${converter.name}`);
  }

  /**
   * 检测数据类型
   * @param data 数据
   * @returns 检测到的数据类型
   */
  detectDataType(data: any): ClipboardDataType {
    const processor = DataProcessor.getInstance();
    return processor.detectDataType(data);
  }

  /**
   * 验证数据
   * @param data 数据
   * @param type 数据类型
   * @param options 验证选项
   * @returns 验证结果
   */
  validateData(data: any, type: ClipboardDataType, options?: { strict?: boolean }): DataValidationResult {
    return this.validateClipboardData(data, type, options);
  }

  /**
   * 转换数据格式
   * @param data 原始数据
   * @param from 源格式
   * @param to 目标格式
   * @param options 处理选项
   * @returns 转换后的数据
   */
  async convertDataFormat(
    data: any,
    from: ClipboardDataType,
    to: ClipboardDataType,
    options?: DataProcessingOptions
  ): Promise<any> {
    await this.ensureInitialized();
    return this.convertData(data, from, to, options);
  }

  /**
   * 获取数据处理统计信息
   */
  getProcessingStats(): {
    converters: number;
    validationRules: number;
    cacheSize: number;
  } {
    const processor = DataProcessor.getInstance();
    return {
      converters: this.dataConverters.size,
      validationRules: processor['validationRules']?.size || 0,
      cacheSize: this.cache?.size() || 0
    };
  }
}

/**
 * 抽象数据转换器基类
 */
abstract class BaseDataConverter implements DataConverter {
  abstract readonly fromType: ClipboardDataType;
  abstract readonly toType: ClipboardDataType;
  abstract readonly name: string;
  readonly supportsBigData: boolean = false;

  canConvert(from: ClipboardDataType, to: ClipboardDataType): boolean {
    return from === this.fromType && to === this.toType;
  }

  abstract convert(data: any, from: ClipboardDataType, to: ClipboardDataType): Promise<any>;

  validateInput(data: any): boolean {
    return data !== null && data !== undefined;
  }

  getOptions(): Record<string, any> {
    return {};
  }

  /**
   * 处理大数据的分块转换
   */
  protected async processInChunks<T>(
    data: string,
    processor: (chunk: string) => T,
    chunkSize: number = 64 * 1024
  ): Promise<T[]> {
    const chunks: T[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      chunks.push(processor(chunk));
    }
    return chunks;
  }
}

/**
 * 文本到HTML转换器
 */
class TextToHtmlConverter extends BaseDataConverter {
  readonly fromType: ClipboardDataType = 'text';
  readonly toType: ClipboardDataType = 'html';
  readonly name = 'TextToHtmlConverter';
  readonly supportsBigData = true;

  async convert(data: string): Promise<string> {
    if (!this.validateInput(data) || typeof data !== 'string') {
      throw new Error('Invalid text data for HTML conversion');
    }

    // 对于大数据，使用分块处理
    if (data.length > 100000) {
      const chunks = await this.processInChunks(data, this.convertTextChunk.bind(this));
      return chunks.join('');
    }

    return this.convertTextChunk(data);
  }

  private convertTextChunk(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      .replace(/  /g, '&nbsp;&nbsp;');
  }

  validateInput(data: any): boolean {
    return typeof data === 'string';
  }
}

/**
 * HTML到文本转换器
 */
class HtmlToTextConverter extends BaseDataConverter {
  readonly fromType: ClipboardDataType = 'html';
  readonly toType: ClipboardDataType = 'text';
  readonly name = 'HtmlToTextConverter';
  readonly supportsBigData = true;

  async convert(data: string): Promise<string> {
    if (!this.validateInput(data) || typeof data !== 'string') {
      throw new Error('Invalid HTML data for text conversion');
    }

    // 对于大数据，使用分块处理
    if (data.length > 100000) {
      const chunks = await this.processInChunks(data, this.convertHtmlChunk.bind(this));
      return chunks.join('');
    }

    return this.convertHtmlChunk(data);
  }

  private convertHtmlChunk(html: string): string {
    if (typeof document !== 'undefined') {
      // 浏览器环境：使用DOM解析
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    } else {
      // Node.js环境：使用正则表达式
      return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n/g, '\n')
        .trim();
    }
  }

  validateInput(data: any): boolean {
    return typeof data === 'string';
  }
}

/**
 * 文本到RTF转换器
 */
class TextToRtfConverter extends BaseDataConverter {
  readonly fromType: ClipboardDataType = 'text';
  readonly toType: ClipboardDataType = 'rtf';
  readonly name = 'TextToRtfConverter';

  async convert(data: string): Promise<string> {
    if (!this.validateInput(data) || typeof data !== 'string') {
      throw new Error('Invalid text data for RTF conversion');
    }

    // RTF头部
    const rtfHeader = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
    
    // 转义特殊字符
    const escapedText = data
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/\n/g, '\\par ')
      .replace(/\t/g, '\\tab ');

    return `${rtfHeader}\\f0\\fs24 ${escapedText}}`;
  }

  validateInput(data: any): boolean {
    return typeof data === 'string';
  }
}

/**
 * RTF到文本转换器
 */
class RtfToTextConverter extends BaseDataConverter {
  readonly fromType: ClipboardDataType = 'rtf';
  readonly toType: ClipboardDataType = 'text';
  readonly name = 'RtfToTextConverter';

  async convert(data: string): Promise<string> {
    if (!this.validateInput(data) || typeof data !== 'string') {
      throw new Error('Invalid RTF data for text conversion');
    }

    // 简单的RTF到文本转换
    return data
      .replace(/\\par\s*/g, '\n')
      .replace(/\\tab\s*/g, '\t')
      .replace(/\\[a-z]+\d*\s*/g, '') // 移除RTF控制字
      .replace(/{[^}]*}/g, '') // 移除RTF组
      .replace(/\\\\/g, '\\')
      .replace(/\\{/g, '{')
      .replace(/\\}/g, '}')
      .trim();
  }

  validateInput(data: any): boolean {
    return typeof data === 'string' && data.startsWith('{\\rtf');
  }
}

/**
 * 图像到Base64转换器
 */
class ImageToBase64Converter extends BaseDataConverter {
  readonly fromType: ClipboardDataType = 'image';
  readonly toType: ClipboardDataType = 'text';
  readonly name = 'ImageToBase64Converter';

  async convert(data: Blob): Promise<string> {
    if (!this.validateInput(data)) {
      throw new Error('Invalid image data for Base64 conversion');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image data'));
      reader.readAsDataURL(data);
    });
  }

  validateInput(data: any): boolean {
    return data instanceof Blob && data.type.startsWith('image/');
  }
}

/**
 * Base64到图像转换器
 */
class Base64ToImageConverter extends BaseDataConverter {
  readonly fromType: ClipboardDataType = 'text';
  readonly toType: ClipboardDataType = 'image';
  readonly name = 'Base64ToImageConverter';

  async convert(data: string): Promise<Blob> {
    if (!this.validateInput(data)) {
      throw new Error('Invalid Base64 data for image conversion');
    }

    // 提取MIME类型和数据
    const matches = data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid Base64 data URL format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // 转换为二进制数据
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
  }

  validateInput(data: any): boolean {
    return typeof data === 'string' && 
           data.startsWith('data:image/') && 
           data.includes(';base64,');
  }
}

/**
 * 数据处理工具类
 */
class DataProcessor {
  private static instance: DataProcessor;
  private validationRules: Map<string, DataValidationRule[]> = new Map();

  static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  /**
   * 添加验证规则
   */
  addValidationRule(type: ClipboardDataType, rule: DataValidationRule): void {
    const rules = this.validationRules.get(type) || [];
    rules.push(rule);
    this.validationRules.set(type, rules);
  }

  /**
   * 统一数据验证
   */
  validateData(data: any, type: ClipboardDataType, options?: { strict?: boolean }): DataValidationResult {
    const result: DataValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    const rules = this.validationRules.get(type) || [];
    
    for (const rule of rules) {
      try {
        const validationResult = rule.validate(data, type);
        
        if (validationResult === false) {
          result.valid = false;
          result.errors.push(rule.errorMessage || `Validation failed for rule: ${rule.name}`);
        } else if (typeof validationResult === 'string') {
          if (rule.required || options?.strict) {
            result.valid = false;
            result.errors.push(validationResult);
          } else {
            result.warnings.push(validationResult);
          }
        }
      } catch (error) {
        result.valid = false;
        result.errors.push(`Validation rule '${rule.name}' threw an error: ${(error as Error).message}`);
      }
    }

    return result;
  }

  /**
   * 数据类型检测
   */
  detectDataType(data: any): ClipboardDataType {
    if (typeof data === 'string') {
      // 检测HTML
      if (data.trim().startsWith('<') && data.trim().endsWith('>')) {
        return 'html';
      }
      // 检测RTF
      if (data.startsWith('{\\rtf')) {
        return 'rtf';
      }
      // 默认为文本
      return 'text';
    }
    
    if (data instanceof Blob || data instanceof File) {
      if (data.type.startsWith('image/')) {
        return 'image';
      }
      return 'files';
    }
    
    if (Array.isArray(data) && data.every(item => item instanceof File)) {
      return 'files';
    }

    // 默认返回文本类型
    return 'text';
  }

  /**
   * 处理大数据
   */
  async processLargeData<T>(
    data: any,
    processor: (chunk: any) => Promise<T>,
    options: DataProcessingOptions = {}
  ): Promise<DataProcessingResult<T[]>> {
    const startTime = Date.now();
    const originalSize = this.getDataSize(data);
    
    const {
      enableChunking = true,
      chunkSize = 64 * 1024,
      maxProcessingTime = 30000
    } = options;

    const results: T[] = [];
    const steps: string[] = ['Started large data processing'];

    if (enableChunking && typeof data === 'string' && data.length > chunkSize) {
      steps.push('Processing data in chunks');
      
      for (let i = 0; i < data.length; i += chunkSize) {
        // 检查超时
        if (Date.now() - startTime > maxProcessingTime) {
          throw new Error('Data processing timeout exceeded');
        }

        const chunk = data.slice(i, i + chunkSize);
        const result = await processor(chunk);
        results.push(result);
      }
    } else {
      steps.push('Processing data as single unit');
      const result = await processor(data);
      results.push(result);
    }

    const processingTime = Date.now() - startTime;
    steps.push(`Completed in ${processingTime}ms`);

    return {
      data: results,
      originalSize,
      processedSize: this.getDataSize(results),
      processingTime,
      fromCache: false,
      compressed: false,
      steps
    };
  }

  /**
   * 获取数据大小（字节）
   */
  private getDataSize(data: any): number {
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    if (data instanceof Blob) {
      return data.size;
    }
    if (Array.isArray(data)) {
      return data.reduce((total, item) => total + this.getDataSize(item), 0);
    }
    return JSON.stringify(data).length;
  }
}

// 创建单例实例（自动初始化已在构造函数中处理）
const clipboard = new ClipboardManager();

export default clipboard; 