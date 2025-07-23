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
 * 剪贴板管理器类
 */
class ClipboardManager extends BaseManager<ClipboardManagerOptions> {
  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options?: ClipboardManagerOptions) {
    super(options, 'ClipboardManager');
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
      permissionTimeout: 3000
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
    this.ensureInitialized();
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

      // 数据验证
      if (this.options.enableDataValidation) {
        this.validateClipboardData(text, 'text');
      }

      const cacheKey = `copy_text_${this.hashString(text)}`;
      
      // 尝试从缓存获取结果
      const cached = this.getCached<boolean>(cacheKey);
      if (cached !== undefined) {
        this.logger.debug('Using cached copy result');
        return cached;
      }

      let result = false;

      try {
        if (this.canWrite) {
          await navigator.clipboard.writeText(text);
          result = true;
          this.logger.debug('Text copied using modern API');
        } else if (options.fallback !== false && this.options.enableFallback) {
          result = await this.fallbackCopyText(text);
          this.logger.debug('Text copied using fallback method');
        } else {
          throw this.errorHandler.createError(
            ErrorType.SYSTEM_ERROR,
            'Clipboard API not supported and fallback disabled',
            { context: { method: 'copyText' } }
          );
        }
      } catch (error) {
        if (options.fallback !== false && this.options.enableFallback) {
          result = await this.fallbackCopyText(text);
          this.logger.warn('Fallback to execCommand after API failure');
        } else {
          throw error;
        }
      }

      // 缓存结果
      this.setCached(cacheKey, result, 5000); // 5秒缓存

      // 触发事件
      if (result) {
        this.emit('copy', { type: 'text', data: text, timestamp: Date.now() });
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
    this.ensureInitialized();
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

      // 数据验证
      if (this.options.enableDataValidation) {
        this.validateClipboardData(html, 'html');
      }

      const cacheKey = `copy_html_${this.hashString(html)}`;
      
      // 尝试从缓存获取结果
      const cached = this.getCached<boolean>(cacheKey);
      if (cached !== undefined) {
        this.logger.debug('Using cached HTML copy result');
        return cached;
      }

      let result = false;

      try {
        if (this.canWrite && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          const blob = new Blob([html], { type: 'text/html' });
          const data = [new ClipboardItem({ 'text/html': blob })];
          await (navigator.clipboard as any).write(data);
          result = true;
          this.logger.debug('HTML copied using modern API');
        } else if (options.fallback !== false && this.options.enableFallback) {
          result = await this.fallbackCopyHTML(html);
          this.logger.debug('HTML copied using fallback method');
        } else {
          throw this.errorHandler.createError(
            ErrorType.SYSTEM_ERROR,
            'Clipboard HTML API not supported and fallback disabled',
            { context: { method: 'copyHTML' } }
          );
        }
      } catch (error) {
        if (options.fallback !== false && this.options.enableFallback) {
          result = await this.fallbackCopyHTML(html);
          this.logger.warn('Fallback to execCommand after HTML API failure');
        } else {
          throw error;
        }
      }

      // 缓存结果
      this.setCached(cacheKey, result, 5000); // 5秒缓存

      // 触发事件
      if (result) {
        this.emit('copy', { type: 'html', data: html, timestamp: Date.now() });
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
    this.ensureInitialized();
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
    this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      if (!this.canRead) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'Clipboard reading not supported in this browser',
          { context: { method: 'readText' } }
        );
      }

      // 检查权限
      if (this.options.enablePermissionCheck) {
        const permission = await this.checkReadPermission();
        if (permission !== ClipboardPermissionState.GRANTED) {
          throw this.errorHandler.createError(
            ErrorType.PERMISSION_ERROR,
            'Clipboard read permission denied',
            { context: { method: 'readText', permission } }
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
          { context: { method: 'readText', size: text.length, maxSize: options.maxSize } }
        );
      }

      this.logger.debug(`Read ${text.length} characters from clipboard`);
      
      // 触发事件
      this.emit('read', { type: 'text', data: text, timestamp: Date.now() });

      return text;
    }, 'readText');
  }

  /**
   * 从剪贴板读取 HTML
   * @param options 读取选项
   * @returns 剪贴板中的HTML内容
   */
  async readHTML(options: PasteOptions = {}): Promise<string> {
    this.ensureInitialized();
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
            { context: { method: 'readHTML', permission } }
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
              { context: { method: 'readHTML', size: html.length, maxSize: options.maxSize } }
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
   * 从剪贴板读取数据
   * @param options 读取选项
   * @returns 剪贴板数据
   */
  async read(options: PasteOptions = {}): Promise<ClipboardData> {
    this.ensureInitialized();
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
              timestamp: Date.now()
            };
          case 'text':
          default:
            const text = await this.readText(options);
            return { 
              type: 'text', 
              data: text, 
              size: text.length,
              timestamp: Date.now()
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
        { context: { method: 'checkBrowserSupport', support } }
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
   * 验证剪贴板数据
   */
  private validateClipboardData(data: string, type: ClipboardDataType): void {
    if (!data) {
      throw this.errorHandler.createError(
        ErrorType.USER_ERROR,
        'Empty clipboard data provided',
        { context: { method: 'validateClipboardData', type } }
      );
    }

    if (data.length > this.options.maxDataSize) {
      throw this.errorHandler.createError(
        ErrorType.USER_ERROR,
        `Clipboard data exceeds maximum size limit (${this.options.maxDataSize} bytes)`,
        { context: { method: 'validateClipboardData', type, size: data.length } }
      );
    }

    // HTML特定验证
    if (type === 'html') {
      // 基本的HTML安全检查
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(data)) {
          this.logger.warn('Potentially dangerous HTML content detected');
          break;
        }
      }
    }
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
   * 降级复制文本方法
   */
  private async fallbackCopyText(text: string): Promise<boolean> {
    if (typeof document === 'undefined') {
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Document not available for fallback copy',
        { context: { method: 'fallbackCopyText' } }
      );
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        this.logger.debug('Fallback text copy successful');
      } else {
        this.logger.warn('Fallback text copy failed');
      }
      
      return successful;
    } catch (error) {
      this.logger.error('Fallback copy failed:', error);
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Fallback clipboard copy failed',
        { context: { method: 'fallbackCopyText' }, cause: error as Error }
      );
    }
  }

  /**
   * 降级复制 HTML 方法
   */
  private async fallbackCopyHTML(html: string): Promise<boolean> {
    if (typeof document === 'undefined') {
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Document not available for fallback HTML copy',
        { context: { method: 'fallbackCopyHTML' } }
      );
    }

    try {
      // 创建一个临时div来渲染HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-999999px';
      tempDiv.style.top = '-999999px';
      tempDiv.style.opacity = '0';
      
      document.body.appendChild(tempDiv);
      
      // 选择内容
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        const successful = document.execCommand('copy');
        selection.removeAllRanges();
        document.body.removeChild(tempDiv);
        
        if (successful) {
          this.logger.debug('Fallback HTML copy successful');
        } else {
          this.logger.warn('Fallback HTML copy failed');
        }
        
        return successful;
      }
      
      document.body.removeChild(tempDiv);
      return false;
    } catch (error) {
      this.logger.error('Fallback HTML copy failed:', error);
      throw this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Fallback clipboard HTML copy failed',
        { context: { method: 'fallbackCopyHTML' }, cause: error as Error }
      );
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
        { context: { method: 'fallbackCopyElement', format }, cause: error as Error }
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
      { context: { method: 'fallbackRead', format } }
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
    this.ensureInitialized();
    
    const writePermission = await this.checkWritePermission();
    const readPermission = await this.checkReadPermission();
    
    return { write: writePermission, read: readPermission };
  }

  /**
   * 请求剪贴板权限
   */
  async requestPermissions(): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      // 尝试写入一个空字符串来触发权限请求
      await this.copyText('');
      
      // 尝试读取来触发读取权限请求
      try {
        await this.readText();
      } catch (error) {
        // 读取权限可能被拒绝，但写入权限可能已获得
        this.logger.debug('Read permission request failed, but write permission may be granted');
      }
      
      const permissions = await this.getPermissionStatus();
      return permissions.write === ClipboardPermissionState.GRANTED;
    } catch (error) {
      this.handleError(error as Error, 'requestPermissions');
      return false;
    }
  }

  /**
   * 清空剪贴板（如果支持）
   */
  async clear(): Promise<boolean> {
    this.ensureInitialized();
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
}

// 创建单例实例
const clipboard = new ClipboardManager();

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
  clipboard.initialize().catch((error) => {
    console.warn('Failed to initialize clipboard manager:', error);
  });
}

export default clipboard;
export { 
  ClipboardManager, 
  ClipboardPermissionState,
  type ClipboardManagerOptions,
  type ClipboardData,
  type ClipboardDataType,
  type CopyOptions,
  type PasteOptions
}; 