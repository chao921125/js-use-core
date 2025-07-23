/**
 * 全屏管理器模块
 * 
 * @description 提供统一的全屏API，支持浏览器兼容性处理、错误处理和性能监控
 * @author js-use-core
 * @date 2024-07-20
 */

import { BaseManager } from '../core/BaseManager';
import { BaseOptions, ErrorType } from '../core/types';
import { BrowserAdapter } from '../utils/browser';
import { isElement } from '../utils/dom';

/**
 * 全屏管理器配置选项
 */
export interface FullscreenOptions extends BaseOptions {
  /** 导航UI显示模式 */
  navigationUI?: 'auto' | 'hide' | 'show';
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean;
  /** 全屏请求超时时间（毫秒） */
  requestTimeout?: number;
  /** 是否启用键盘输入（WebKit） */
  allowKeyboardInput?: boolean;
}

/**
 * 全屏事件类型
 */
export type FullscreenEventType = 'change' | 'error' | 'request' | 'exit';

/**
 * 全屏状态信息
 */
export interface FullscreenState {
  /** 是否处于全屏状态 */
  isFullscreen: boolean;
  /** 当前全屏元素 */
  element: Element | null;
  /** 全屏开始时间 */
  startTime?: number;
  /** 全屏持续时间 */
  duration?: number;
}

/**
 * 性能监控数据
 */
export interface FullscreenPerformanceMetrics {
  /** 进入全屏耗时 */
  enterTime: number;
  /** 退出全屏耗时 */
  exitTime: number;
  /** 全屏持续时间 */
  duration: number;
  /** 错误次数 */
  errorCount: number;
  /** 成功次数 */
  successCount: number;
}

/**
 * 全屏管理器类
 * 继承BaseManager，提供统一的全屏管理功能
 */
export class FullscreenManager extends BaseManager<FullscreenOptions> {
  private browserAdapter: BrowserAdapter;
  private removeChangeListener?: () => void;
  private removeErrorListener?: () => void;
  private currentState: FullscreenState;
  private performanceMetrics: FullscreenPerformanceMetrics;
  private requestStartTime: number = 0;

  constructor(options?: FullscreenOptions) {
    super(options, 'FullscreenManager');
    
    this.browserAdapter = new BrowserAdapter({
      enableCache: this.options.cache,
      debug: this.options.debug
    });

    this.currentState = {
      isFullscreen: false,
      element: null
    };

    this.performanceMetrics = {
      enterTime: 0,
      exitTime: 0,
      duration: 0,
      errorCount: 0,
      successCount: 0
    };
  }

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<FullscreenOptions> {
    return {
      debug: false,
      timeout: 5000,
      retries: 2,
      cache: true,
      navigationUI: 'auto',
      enablePerformanceMonitoring: false,
      requestTimeout: 3000,
      allowKeyboardInput: true
    };
  }

  /**
   * 初始化全屏管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 初始化事件监听器（即使不支持全屏也要初始化）
      this.initEventListeners();

      // 初始化状态
      this.updateCurrentState();

      this.initialized = true;
      this.logger.info('FullscreenManager initialized successfully', {
        supported: this.isSupported,
        enabled: this.isEnabled
      });
      this.emit('initialized');

    } catch (error) {
      const processedError = this.handleError(error as Error, 'initialize');
      throw processedError;
    }
  }

  /**
   * 销毁全屏管理器
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      // 如果当前处于全屏状态，先退出
      if (this.currentState.isFullscreen) {
        this.exit().catch(() => {
          // 忽略退出错误，因为正在销毁
        });
      }

      // 移除事件监听器
      this.removeEventListeners();

      // 销毁浏览器适配器
      this.browserAdapter.destroy();

      // 调用基类销毁方法
      this.baseDestroy();

      this.logger.info('FullscreenManager destroyed successfully');

    } catch (error) {
      this.handleError(error as Error, 'destroy');
    }
  }

  // ============================================================================
  // 公共属性和状态检查
  // ============================================================================

  /**
   * 检查是否支持全屏API
   */
  get isSupported(): boolean {
    const cacheKey = 'fullscreen_support';
    const cached = this.getCached<boolean>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // 检查各种浏览器的全屏支持
    const supported = !!(
      'fullscreenEnabled' in document ||
      'webkitFullscreenEnabled' in document ||
      'mozFullScreenEnabled' in document ||
      'msFullscreenEnabled' in document ||
      'requestFullscreen' in document.documentElement ||
      'webkitRequestFullscreen' in document.documentElement ||
      'mozRequestFullScreen' in document.documentElement ||
      'msRequestFullscreen' in document.documentElement
    );

    this.setCached(cacheKey, supported, 60000); // 缓存1分钟
    return supported;
  }

  /**
   * 检查全屏功能是否启用
   */
  get isEnabled(): boolean {
    const cacheKey = 'fullscreen_enabled';
    const cached = this.getCached<boolean>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // 检查各种浏览器的全屏启用属性
    const enabled = !!(
      (document as any).fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );

    this.setCached(cacheKey, enabled, 60000); // 缓存1分钟
    return enabled;
  }

  /**
   * 检查是否处于全屏状态
   */
  get isFullscreen(): boolean {
    this.updateCurrentState();
    return this.currentState.isFullscreen;
  }

  /**
   * 获取当前全屏元素
   */
  get element(): Element | null {
    this.updateCurrentState();
    return this.currentState.element;
  }

  /**
   * 获取全屏状态信息
   */
  get state(): FullscreenState {
    return { ...this.currentState };
  }

  /**
   * 获取性能监控数据
   */
  get performanceData(): FullscreenPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // ============================================================================
  // 核心全屏操作方法
  // ============================================================================

  /**
   * 请求进入全屏
   * @param element 要全屏的元素，默认为document.documentElement
   * @param requestOptions 全屏请求选项
   */
  async request(element?: Element, requestOptions?: { navigationUI?: 'auto' | 'hide' | 'show' }): Promise<void> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      // 验证输入参数
      const targetElement = element || document.documentElement;
      if (!this.validateInput(targetElement, { type: 'object', required: true })) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Invalid element provided for fullscreen request',
          { context: { method: 'request', module: 'FullscreenManager' } }
        );
      }

      if (!isElement(targetElement)) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Provided element is not a valid DOM element',
          { context: { method: 'request', module: 'FullscreenManager' } }
        );
      }

      // 检查支持性
      if (!this.isSupported) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'Fullscreen is not supported in this browser',
          { context: { method: 'request', module: 'FullscreenManager' } }
        );
      }

      if (!this.isEnabled) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'Fullscreen is not enabled in this browser',
          { context: { method: 'request', module: 'FullscreenManager' } }
        );
      }

      // 如果已经是全屏状态，直接返回
      if (this.currentState.isFullscreen && this.currentState.element === targetElement) {
        this.logger.debug('Element is already in fullscreen mode');
        return;
      }

      // 开始性能监控
      this.requestStartTime = this.options.enablePerformanceMonitoring ? performance.now() : 0;

      // 触发请求前事件
      this.emit('request', { element: targetElement, options: requestOptions });

      // 准备请求选项
      const fullOptions = {
        navigationUI: requestOptions?.navigationUI || this.options.navigationUI,
        ...requestOptions
      };

      // 执行全屏请求
      try {
        const methodName = this.getRequestMethodName();
        
        if (!methodName || !(methodName in targetElement)) {
          throw new Error('Fullscreen request method not supported');
        }
        
        if (methodName === 'webkitRequestFullscreen') {
          // WebKit特殊处理
          const webkitOptions = this.options.allowKeyboardInput ? 
            (Element as any).ALLOW_KEYBOARD_INPUT : undefined;
          await (targetElement as any)[methodName](webkitOptions);
        } else {
          await (targetElement as any)[methodName](fullOptions);
        }

        // 更新性能指标
        if (this.options.enablePerformanceMonitoring && this.requestStartTime > 0) {
          this.performanceMetrics.enterTime = performance.now() - this.requestStartTime;
          this.performanceMetrics.successCount++;
        }

        this.logger.info('Fullscreen request successful', { element: targetElement.tagName });

      } catch (error) {
        // 更新错误指标
        if (this.options.enablePerformanceMonitoring) {
          this.performanceMetrics.errorCount++;
        }

        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          `Failed to enter fullscreen: ${(error as Error).message}`,
          { 
            context: { method: 'request', module: 'FullscreenManager' },
            cause: error as Error
          }
        );
      }
    }, 'request', this.options.retries);
  }

  /**
   * 退出全屏
   */
  async exit(): Promise<void> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      // 如果不在全屏状态，直接返回
      if (!this.currentState.isFullscreen) {
        this.logger.debug('Not in fullscreen mode, exit request ignored');
        return;
      }

      // 开始性能监控
      const exitStartTime = this.options.enablePerformanceMonitoring ? performance.now() : 0;

      // 触发退出前事件
      this.emit('exit', { element: this.currentState.element });

      try {
        const methodName = this.getExitMethodName();
        
        if (!methodName || !(methodName in document)) {
          throw new Error('Fullscreen exit method not supported');
        }
        
        await (document as any)[methodName]();

        // 更新性能指标
        if (this.options.enablePerformanceMonitoring && exitStartTime > 0) {
          this.performanceMetrics.exitTime = performance.now() - exitStartTime;
          this.performanceMetrics.successCount++;
        }

        this.logger.info('Fullscreen exit successful');

      } catch (error) {
        // 更新错误指标
        if (this.options.enablePerformanceMonitoring) {
          this.performanceMetrics.errorCount++;
        }

        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          `Failed to exit fullscreen: ${(error as Error).message}`,
          { 
            context: { method: 'exit' },
            cause: error as Error
          }
        );
      }
    }, 'exit', this.options.retries);
  }

  /**
   * 切换全屏状态
   * @param element 要全屏的元素（仅在进入全屏时使用）
   * @param options 全屏选项（仅在进入全屏时使用）
   */
  async toggle(element?: Element, options?: { navigationUI?: 'auto' | 'hide' | 'show' }): Promise<void> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    if (this.currentState.isFullscreen) {
      await this.exit();
    } else {
      await this.request(element, options);
    }
  }

  // ============================================================================
  // 私有辅助方法
  // ============================================================================

  /**
   * 初始化事件监听器
   */
  private initEventListeners(): void {
    try {
      // 使用 BrowserAdapter 检测支持的事件名
      const changeEventName = this.detectChangeEventName();
      const errorEventName = this.detectErrorEventName();

      if (changeEventName) {
        this.removeChangeListener = this.browserAdapter.addEventListenerCompat(
          document,
          changeEventName,
          this.handleFullscreenChange.bind(this)
        );
        this.logger.debug(`Listening for fullscreen change event: ${changeEventName}`);
      }

      if (errorEventName) {
        this.removeErrorListener = this.browserAdapter.addEventListenerCompat(
          document,
          errorEventName,
          this.handleFullscreenError.bind(this)
        );
        this.logger.debug(`Listening for fullscreen error event: ${errorEventName}`);
      }

    } catch (error) {
      this.handleError(error as Error, 'initEventListeners');
    }
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    try {
      if (this.removeChangeListener) {
        this.removeChangeListener();
        this.removeChangeListener = undefined;
      }

      if (this.removeErrorListener) {
        this.removeErrorListener();
        this.removeErrorListener = undefined;
      }

      this.logger.debug('Fullscreen event listeners removed');

    } catch (error) {
      this.handleError(error as Error, 'removeEventListeners');
    }
  }

  /**
   * 处理全屏状态变化事件
   */
  private handleFullscreenChange(event: Event): void {
    try {
      const wasFullscreen = this.currentState.isFullscreen;
      this.updateCurrentState();

      // 计算持续时间
      if (wasFullscreen && !this.currentState.isFullscreen && this.currentState.startTime) {
        const duration = Date.now() - this.currentState.startTime;
        this.currentState.duration = duration;
        
        if (this.options.enablePerformanceMonitoring) {
          this.performanceMetrics.duration = duration;
        }
      }

      this.logger.debug('Fullscreen state changed', {
        isFullscreen: this.currentState.isFullscreen,
        element: this.currentState.element?.tagName
      });

      // 触发变化事件
      this.emit('change', {
        isFullscreen: this.currentState.isFullscreen,
        element: this.currentState.element,
        event
      });

    } catch (error) {
      this.handleError(error as Error, 'handleFullscreenChange');
    }
  }

  /**
   * 处理全屏错误事件
   */
  private handleFullscreenError(event: Event): void {
    try {
      // 更新错误指标
      if (this.options.enablePerformanceMonitoring) {
        this.performanceMetrics.errorCount++;
      }

      const error = this.errorHandler.createError(
        ErrorType.SYSTEM_ERROR,
        'Fullscreen operation failed',
        { context: { method: 'handleFullscreenError' } }
      );

      this.logger.error('Fullscreen error occurred', { event });

      // 触发错误事件
      this.emit('error', { error, event });

    } catch (err) {
      this.handleError(err as Error, 'handleFullscreenError');
    }
  }

  /**
   * 更新当前状态
   */
  private updateCurrentState(): void {
    // 检查各种浏览器的全屏元素属性
    const currentElement = (document as any).fullscreenElement ||
                          (document as any).webkitFullscreenElement ||
                          (document as any).mozFullScreenElement ||
                          (document as any).msFullscreenElement ||
                          null;
    
    const isCurrentlyFullscreen = !!currentElement;

    // 如果状态发生变化
    if (isCurrentlyFullscreen !== this.currentState.isFullscreen) {
      if (isCurrentlyFullscreen) {
        // 进入全屏
        this.currentState = {
          isFullscreen: true,
          element: currentElement,
          startTime: Date.now()
        };
      } else {
        // 退出全屏
        this.currentState = {
          isFullscreen: false,
          element: null,
          duration: this.currentState.startTime ? Date.now() - this.currentState.startTime : undefined
        };
      }
    }
  }

  /**
   * 检测全屏变化事件名（使用 BrowserAdapter）
   */
  private detectChangeEventName(): string | null {
    const cacheKey = 'fullscreen_change_event';
    const cached = this.getCached<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const eventNames = [
      'fullscreenchange',
      'webkitfullscreenchange', 
      'mozfullscreenchange',
      'msfullscreenchange'
    ];

    for (const eventName of eventNames) {
      const result = this.browserAdapter.detectFeature(`on${eventName}`, 'property', document);
      if (result.supported) {
        this.setCached(cacheKey, eventName, 300000); // 缓存5分钟
        return eventName;
      }
    }

    return null;
  }

  /**
   * 检测全屏错误事件名（使用 BrowserAdapter）
   */
  private detectErrorEventName(): string | null {
    const cacheKey = 'fullscreen_error_event';
    const cached = this.getCached<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const eventNames = [
      'fullscreenerror',
      'webkitfullscreenerror',
      'mozfullscreenerror', 
      'msfullscreenerror'
    ];

    for (const eventName of eventNames) {
      const result = this.browserAdapter.detectFeature(`on${eventName}`, 'property', document);
      if (result.supported) {
        this.setCached(cacheKey, eventName, 300000); // 缓存5分钟
        return eventName;
      }
    }

    return null;
  }

  /**
   * 获取请求全屏方法名（使用 BrowserAdapter 和缓存）
   */
  private getRequestMethodName(): string {
    const cacheKey = 'fullscreen_request_method';
    const cached = this.getCached<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const methodNames = [
      'requestFullscreen',
      'webkitRequestFullscreen',
      'mozRequestFullScreen',
      'msRequestFullscreen'
    ];

    for (const methodName of methodNames) {
      const result = this.browserAdapter.detectFeature(methodName, 'method', document.documentElement);
      if (result.supported) {
        const actualMethodName = result.prefixedName || methodName;
        this.setCached(cacheKey, actualMethodName, 300000); // 缓存5分钟
        return actualMethodName;
      }
    }

    // 如果没有找到支持的方法，返回标准方法名
    this.setCached(cacheKey, 'requestFullscreen', 300000);
    return 'requestFullscreen';
  }

  /**
   * 获取退出全屏方法名（使用 BrowserAdapter 和缓存）
   */
  private getExitMethodName(): string {
    const cacheKey = 'fullscreen_exit_method';
    const cached = this.getCached<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const methodNames = [
      'exitFullscreen',
      'webkitExitFullscreen',
      'mozCancelFullScreen',
      'msExitFullscreen'
    ];

    for (const methodName of methodNames) {
      const result = this.browserAdapter.detectFeature(methodName, 'method', document);
      if (result.supported) {
        const actualMethodName = result.prefixedName || methodName;
        this.setCached(cacheKey, actualMethodName, 300000); // 缓存5分钟
        return actualMethodName;
      }
    }

    // 如果没有找到支持的方法，返回标准方法名
    this.setCached(cacheKey, 'exitFullscreen', 300000);
    return 'exitFullscreen';
  }
}

// ============================================================================
// 导出和单例实例
// ============================================================================

// 创建单例实例
let defaultFullscreenManager: FullscreenManager | null = null;

/**
 * 获取默认全屏管理器实例
 * @param options 配置选项
 * @returns 全屏管理器实例
 */
export function getFullscreenManager(options?: FullscreenOptions): FullscreenManager {
  if (!defaultFullscreenManager) {
    defaultFullscreenManager = new FullscreenManager(options);
    // 自动初始化
    defaultFullscreenManager.initialize().catch((error) => {
      console.warn('Failed to initialize default fullscreen manager:', error);
    });
  }
  return defaultFullscreenManager;
}

/**
 * 重置默认全屏管理器实例
 */
export function resetFullscreenManager(): void {
  if (defaultFullscreenManager) {
    defaultFullscreenManager.destroy();
    defaultFullscreenManager = null;
  }
}

// 创建默认实例并导出
const fullscreen = getFullscreenManager();

export default fullscreen;
export { FullscreenManager };

// ============================================================================
// 便捷函数导出
// ============================================================================

/**
 * 请求进入全屏（便捷函数）
 */
export async function requestFullscreen(element?: Element, options?: { navigationUI?: 'auto' | 'hide' | 'show' }): Promise<void> {
  return fullscreen.request(element, options);
}

/**
 * 退出全屏（便捷函数）
 */
export async function exitFullscreen(): Promise<void> {
  return fullscreen.exit();
}

/**
 * 切换全屏状态（便捷函数）
 */
export async function toggleFullscreen(element?: Element, options?: { navigationUI?: 'auto' | 'hide' | 'show' }): Promise<void> {
  return fullscreen.toggle(element, options);
}

/**
 * 检查是否支持全屏（便捷函数）
 */
export function isFullscreenSupported(): boolean {
  return fullscreen.isSupported;
}

/**
 * 检查是否启用全屏（便捷函数）
 */
export function isFullscreenEnabled(): boolean {
  return fullscreen.isEnabled;
}

/**
 * 检查是否处于全屏状态（便捷函数）
 */
export function isFullscreen(): boolean {
  return fullscreen.isFullscreen;
}

/**
 * 获取当前全屏元素（便捷函数）
 */
export function getFullscreenElement(): Element | null {
  return fullscreen.element;
}

/**
 * 获取全屏状态信息（便捷函数）
 */
export function getFullscreenState(): FullscreenState {
  return fullscreen.state;
}

/**
 * 添加全屏事件监听器（便捷函数）
 */
export function onFullscreenChange(listener: (data: any) => void): () => void {
  fullscreen.on('change', listener);
  return () => fullscreen.off('change', listener);
}

/**
 * 添加全屏错误事件监听器（便捷函数）
 */
export function onFullscreenError(listener: (data: any) => void): () => void {
  fullscreen.on('error', listener);
  return () => fullscreen.off('error', listener);
} 