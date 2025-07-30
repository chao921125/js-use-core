/**
 * 浏览器适配器工具
 * 
 * @description 提供统一的浏览器API差异处理、特征检测和兼容性缓存机制
 * @author js-use-core
 * @date 2024-07-20
 */

import { Cache } from '../core/Cache';
import { Logger } from '../core/Logger';
import { ErrorHandler } from '../core/ErrorHandler';
import { ErrorType, type ErrorContext } from '../core/types';

/**
 * 浏览器特征检测结果
 */
export interface FeatureDetectionResult {
  /** 是否支持该特性 */
  supported: boolean;
  /** 带前缀的属性名（如果需要） */
  prefixedName?: string;
  /** 检测到的前缀 */
  prefix?: string;
  /** 检测方法 */
  method: 'property' | 'method' | 'css' | 'api' | 'custom';
  /** 检测时间戳 */
  timestamp: number;
}

/**
 * 浏览器适配器配置
 */
export interface BrowserAdapterConfig {
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 缓存过期时间（毫秒） */
  cacheTimeout?: number;
  /** 是否启用调试日志 */
  debug?: boolean;
  /** 自定义前缀列表 */
  customPrefixes?: string[];
}

/**
 * 前缀方法映射
 */
export interface PrefixedMethodMap {
  /** 原始方法名 */
  original: string;
  /** 带前缀的方法名 */
  prefixed: string;
  /** 前缀 */
  prefix: string;
}

/**
 * 浏览器信息
 */
export interface BrowserInfo {
  /** 浏览器名称 */
  name: string;
  /** 浏览器版本 */
  version: string;
  /** 渲染引擎 */
  engine: string;
  /** 是否为移动端 */
  mobile: boolean;
  /** 操作系统 */
  os: string;
}

/**
 * 浏览器适配器类
 * 处理浏览器API差异，提供统一的接口
 */
export class BrowserAdapter {
  private cache: Cache<FeatureDetectionResult>;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private config: Required<BrowserAdapterConfig>;
  
  /** 浏览器前缀列表 */
  private readonly VENDOR_PREFIXES = ['', 'webkit', 'moz', 'ms', 'o'] as const;
  
  /** CSS前缀列表 */
  private readonly CSS_PREFIXES = ['', '-webkit-', '-moz-', '-ms-', '-o-'] as const;
  
  /** 浏览器信息缓存 */
  private browserInfo: BrowserInfo | null = null;

  constructor(config: BrowserAdapterConfig = {}) {
    this.config = {
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5分钟
      debug: false,
      customPrefixes: [],
      ...config
    };

    this.cache = new Cache<FeatureDetectionResult>({
      maxSize: 200,
      defaultTTL: this.config.cacheTimeout,
      enableLRU: true
    });

    this.logger = new Logger('BrowserAdapter', {
      level: this.config.debug ? 0 : 2,
      enableConsole: this.config.debug
    });

    this.errorHandler = new ErrorHandler();
  }

  // ============================================================================
  // 特征检测核心方法
  // ============================================================================

  /**
   * 检查浏览器是否支持指定特性
   */
  isSupported(feature: string): boolean {
    const result = this.detectFeature(feature);
    return result.supported;
  }

  /**
   * 获取带前缀的属性名
   */
  getPrefixedProperty(property: string): string | null {
    const result = this.detectFeature(property, 'property');
    return result.supported ? (result.prefixedName || property) : null;
  }

  /**
   * 获取带前缀的方法
   */
  getPrefixedMethod(methodName: string, target: any = window): Function | null {
    const result = this.detectFeature(methodName, 'method', target);
    if (!result.supported) return null;

    const actualMethodName = result.prefixedName || methodName;
    return target[actualMethodName] || null;
  }

  /**
   * 获取带前缀的CSS属性名
   */
  getPrefixedCSSProperty(property: string): string | null {
    const result = this.detectFeature(property, 'css');
    return result.supported ? (result.prefixedName || property) : null;
  }

  /**
   * 检测特性支持情况
   */
  detectFeature(
    feature: string,
    method: FeatureDetectionResult['method'] = 'property',
    target: any = null
  ): FeatureDetectionResult {
    const cacheKey = `${feature}_${method}_${target ? 'custom' : 'default'}`;
    
    // 尝试从缓存获取
    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug(`Feature detection cache hit: ${feature}`);
        return cached;
      }
    }

    let result: FeatureDetectionResult;

    try {
      switch (method) {
        case 'property':
          result = this.detectProperty(feature);
          break;
        case 'method':
          result = this.detectMethod(feature, target === null ? null : (target || window));
          break;
        case 'css':
          result = this.detectCSSProperty(feature);
          break;
        case 'api':
          result = this.detectAPI(feature);
          break;
        case 'custom':
          result = this.detectCustomFeature(feature, target);
          break;
        default:
          result = this.detectProperty(feature);
      }

      result.timestamp = Date.now();
      
      // 缓存结果
      if (this.config.enableCache) {
        this.cache.set(cacheKey, result);
      }

      this.logger.debug(`Feature detection result for ${feature}:`, result);
      return result;

    } catch (error) {
      const context: ErrorContext = {
        module: 'BrowserAdapter',
        method: 'detectFeature',
        input: { feature, method, target },
        timestamp: Date.now()
      };

      this.errorHandler.handleError(error as Error, context);
      
      return {
        supported: false,
        method,
        timestamp: Date.now()
      };
    }
  }

  // ============================================================================
  // 具体检测方法实现
  // ============================================================================

  /**
   * 检测属性支持
   */
  private detectProperty(property: string): FeatureDetectionResult {
    const targets = [
      document.documentElement.style,
      window,
      document,
      navigator
    ];

    // 检查无前缀版本
    for (const target of targets) {
      if (property in target) {
        return {
          supported: true,
          method: 'property',
          timestamp: Date.now()
        };
      }
    }

    // 检查带前缀版本
    const prefixes = [...this.VENDOR_PREFIXES.slice(1), ...this.config.customPrefixes];
    
    for (const prefix of prefixes) {
      const prefixedName = this.getPrefixedName(property, prefix);
      
      for (const target of targets) {
        if (prefixedName in target) {
          return {
            supported: true,
            prefixedName,
            prefix,
            method: 'property',
            timestamp: Date.now()
          };
        }
      }
    }

    return {
      supported: false,
      method: 'property',
      timestamp: Date.now()
    };
  }

  /**
   * 检测方法支持
   */
  private detectMethod(methodName: string, target: any): FeatureDetectionResult {
    // 如果目标对象无效，直接返回不支持
    if (!target || typeof target !== 'object') {
      return {
        supported: false,
        method: 'method',
        timestamp: Date.now()
      };
    }

    // 检查无前缀版本
    if (typeof target[methodName] === 'function') {
      return {
        supported: true,
        method: 'method',
        timestamp: Date.now()
      };
    }

    // 检查带前缀版本
    const prefixes = [...this.VENDOR_PREFIXES.slice(1), ...this.config.customPrefixes];
    
    for (const prefix of prefixes) {
      const prefixedName = this.getPrefixedName(methodName, prefix);
      
      if (typeof target[prefixedName] === 'function') {
        return {
          supported: true,
          prefixedName,
          prefix,
          method: 'method',
          timestamp: Date.now()
        };
      }
    }

    return {
      supported: false,
      method: 'method',
      timestamp: Date.now()
    };
  }

  /**
   * 检测CSS属性支持
   */
  private detectCSSProperty(property: string): FeatureDetectionResult {
    const testElement = document.createElement('div');
    const style = testElement.style;

    // 检查无前缀版本
    if (property in style) {
      return {
        supported: true,
        method: 'css',
        timestamp: Date.now()
      };
    }

    // 检查带前缀版本
    for (const prefix of this.CSS_PREFIXES.slice(1)) {
      const prefixedProperty = `${prefix}${property}`;
      
      if (prefixedProperty in style) {
        return {
          supported: true,
          prefixedName: prefixedProperty,
          prefix: prefix.replace(/-/g, ''),
          method: 'css',
          timestamp: Date.now()
        };
      }
    }

    // 尝试设置值检测
    try {
      style.setProperty(property, 'initial');
      if (style.getPropertyValue(property)) {
        return {
          supported: true,
          method: 'css',
          timestamp: Date.now()
        };
      }
    } catch {
      // 忽略错误，继续检测
    }

    return {
      supported: false,
      method: 'css',
      timestamp: Date.now()
    };
  }

  /**
   * 检测API支持
   */
  private detectAPI(apiName: string): FeatureDetectionResult {
    const apiPaths = [
      apiName,
      `window.${apiName}`,
      `navigator.${apiName}`,
      `document.${apiName}`
    ];

    for (const path of apiPaths) {
      try {
        const value = this.getNestedProperty(window, path);
        if (value !== undefined) {
          return {
            supported: true,
            method: 'api',
            timestamp: Date.now()
          };
        }
      } catch {
        continue;
      }
    }

    return {
      supported: false,
      method: 'api',
      timestamp: Date.now()
    };
  }

  /**
   * 自定义特征检测
   */
  private detectCustomFeature(feature: string, detector: any): FeatureDetectionResult {
    try {
      let supported = false;

      if (typeof detector === 'function') {
        supported = detector();
      } else if (typeof detector === 'boolean') {
        supported = detector;
      } else if (detector && typeof detector.test === 'function') {
        supported = detector.test();
      }

      return {
        supported,
        method: 'custom',
        timestamp: Date.now()
      };
    } catch {
      return {
        supported: false,
        method: 'custom',
        timestamp: Date.now()
      };
    }
  }

  // ============================================================================
  // 工具方法
  // ============================================================================

  /**
   * 生成带前缀的属性名
   */
  private getPrefixedName(name: string, prefix: string): string {
    if (!prefix) return name;
    return `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }

  /**
   * 获取嵌套属性值
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 获取浏览器信息
   */
  getBrowserInfo(): BrowserInfo {
    if (this.browserInfo) {
      return this.browserInfo;
    }

    const userAgent = navigator.userAgent;
    const info: BrowserInfo = {
      name: 'Unknown',
      version: '0.0.0',
      engine: 'Unknown',
      mobile: false,
      os: 'Unknown'
    };

    // 检测浏览器
    if (userAgent.includes('Chrome')) {
      info.name = 'Chrome';
      info.engine = 'Blink';
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      if (match) info.version = match[1];
    } else if (userAgent.includes('Firefox')) {
      info.name = 'Firefox';
      info.engine = 'Gecko';
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      if (match) info.version = match[1];
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      info.name = 'Safari';
      info.engine = 'WebKit';
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      if (match) info.version = match[1];
    } else if (userAgent.includes('Edge')) {
      info.name = 'Edge';
      info.engine = 'Blink';
      const match = userAgent.match(/Edge\/(\d+\.\d+)/);
      if (match) info.version = match[1];
    }

    // 检测移动端
    info.mobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

    // 检测操作系统
    if (userAgent.includes('Windows')) {
      info.os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      info.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      info.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      info.os = 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      info.os = 'iOS';
    }

    this.browserInfo = info;
    return info;
  }

  /**
   * 添加兼容的事件监听器
   */
  addEventListenerCompat(
    element: Element | Document | Window,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    // 现代浏览器
    if (element.addEventListener) {
      element.addEventListener(event, handler, options);
      return () => element.removeEventListener(event, handler, options);
    }

    // IE8及以下兼容
    const legacyElement = element as any;
    if (legacyElement.attachEvent) {
      const wrappedHandler = (e: Event) => {
        // 修正事件对象
        if (!e.target && (e as any).srcElement) {
          Object.defineProperty(e, 'target', {
            value: (e as any).srcElement,
            writable: false,
            enumerable: true,
            configurable: true
          });
        }
        e.preventDefault = e.preventDefault || (() => { e.returnValue = false; });
        e.stopPropagation = e.stopPropagation || (() => { e.cancelBubble = true; });
        handler.call(element, e);
      };

      legacyElement.attachEvent(`on${event}`, wrappedHandler);
      return () => legacyElement.detachEvent(`on${event}`, wrappedHandler);
    }

    // 最后的兼容方案
    const eventProperty = `on${event}` as keyof Element;
    const originalHandler = (element as any)[eventProperty];
    
    (element as any)[eventProperty] = (e: Event) => {
      if (originalHandler) originalHandler.call(element, e);
      handler.call(element, e);
    };

    return () => {
      (element as any)[eventProperty] = originalHandler;
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.browserInfo = null;
    this.logger.info('Browser adapter cache cleared');
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    const stats = this.cache.getStats();
    return {
      size: this.cache.size(),
      hitRate: stats.hitRate,
      maxSize: stats.maxSize
    };
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.clearCache();
    this.logger.info('Browser adapter destroyed');
  }
}

// ============================================================================
// 导出的便捷函数
// ============================================================================

// 默认适配器实例
let defaultAdapter: BrowserAdapter | null = null;

/**
 * 获取默认浏览器适配器实例
 */
export function getBrowserAdapter(config?: BrowserAdapterConfig): BrowserAdapter {
  if (!defaultAdapter) {
    defaultAdapter = new BrowserAdapter(config);
  }
  return defaultAdapter;
}

/**
 * 检查特性支持（便捷函数）
 */
export function isFeatureSupported(feature: string): boolean {
  return getBrowserAdapter().isSupported(feature);
}

/**
 * 获取带前缀的属性名（便捷函数）
 */
export function getPrefixedProperty(property: string): string | null {
  return getBrowserAdapter().getPrefixedProperty(property);
}

/**
 * 获取带前缀的方法（便捷函数）
 */
export function getPrefixedMethod(methodName: string, target?: any): Function | null {
  return getBrowserAdapter().getPrefixedMethod(methodName, target);
}

/**
 * 获取带前缀的CSS属性名（便捷函数）
 */
export function getPrefixedCSSProperty(property: string): string | null {
  return getBrowserAdapter().getPrefixedCSSProperty(property);
}

/**
 * 获取浏览器信息（便捷函数）
 */
export function getBrowserInfo(): BrowserInfo {
  return getBrowserAdapter().getBrowserInfo();
}

/**
 * 添加兼容的事件监听器（便捷函数）
 */
export function addEventListenerCompat(
  element: Element | Document | Window,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  return getBrowserAdapter().addEventListenerCompat(element, event, handler, options);
}

// ============================================================================
// 常用特征检测预设
// ============================================================================

/**
 * 常用特征检测结果缓存
 */
export const FeatureDetection = {
  // CSS特性
  get flexbox() { return isFeatureSupported('flex'); },
  get grid() { return isFeatureSupported('grid'); },
  get transforms() { return isFeatureSupported('transform'); },
  get transitions() { return isFeatureSupported('transition'); },
  get animations() { return isFeatureSupported('animation'); },
  
  // JavaScript API
  get fetch() { return isFeatureSupported('fetch'); },
  get promises() { return isFeatureSupported('Promise'); },
  get asyncAwait() { return isFeatureSupported('async'); },
  get webGL() { return isFeatureSupported('WebGLRenderingContext'); },
  get webWorkers() { return isFeatureSupported('Worker'); },
  get serviceWorkers() { return isFeatureSupported('serviceWorker'); },
  
  // HTML5特性
  get canvas() { return isFeatureSupported('HTMLCanvasElement'); },
  get video() { return isFeatureSupported('HTMLVideoElement'); },
  get audio() { return isFeatureSupported('HTMLAudioElement'); },
  get localStorage() { return isFeatureSupported('localStorage'); },
  get sessionStorage() { return isFeatureSupported('sessionStorage'); },
  
  // 设备API
  get geolocation() { return isFeatureSupported('geolocation'); },
  get deviceMotion() { return isFeatureSupported('DeviceMotionEvent'); },
  get deviceOrientation() { return isFeatureSupported('DeviceOrientationEvent'); },
  get vibration() { return isFeatureSupported('vibrate'); },
  
  // 媒体API
  get mediaDevices() { return isFeatureSupported('mediaDevices'); },
  get getUserMedia() { return isFeatureSupported('getUserMedia'); },
  get webRTC() { return isFeatureSupported('RTCPeerConnection'); }
};