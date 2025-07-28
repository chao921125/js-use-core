/**
 * 设备检测主要功能类
 */

import type { DeviceInfo, MobileDetectOptions, DeviceDetectorOptions } from './types';
import { 
  isMobile, 
  isTablet, 
  isDesktop, 
  getDeviceType, 
  detectOS, 
  detectBrowser, 
  isTouchDevice 
} from './detector';
import { getScreenSize } from './utils';
import { BaseManager } from '../core/BaseManager';

/**
 * 设备检测管理类
 * 继承 BaseManager，提供统一的生命周期管理和错误处理
 */
export class DeviceDetector extends BaseManager<DeviceDetectorOptions> {
  private _deviceInfo: DeviceInfo | null = null;
  private _detectionOptions: MobileDetectOptions;

  constructor(options: DeviceDetectorOptions = {}) {
    super(options, 'DeviceDetector');
    this._detectionOptions = {
      ua: options.ua,
      tablet: options.tablet,
      featureDetect: options.featureDetect
    };
  }

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<DeviceDetectorOptions> {
    return {
      debug: false,
      timeout: 5000,
      retries: 2,
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5分钟
      ua: undefined,
      tablet: false,
      featureDetect: true,
      enablePerformanceMonitoring: false
    };
  }

  /**
   * 初始化设备检测器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.logger.info('Initializing DeviceDetector');
      
      // 预检测设备信息以验证功能
      await this.safeExecute(async () => {
        this._detectDevice();
      }, 'initialize');

      this.initialized = true;
      this.emit('initialized');
      this.logger.info('DeviceDetector initialized successfully');
    } catch (error) {
      this.handleError(error as Error, 'initialize');
      throw error;
    }
  }

  /**
   * 销毁设备检测器
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.logger.info('Destroying DeviceDetector');
    
    // 清除缓存的设备信息
    this._deviceInfo = null;
    
    // 调用基类销毁方法
    this.baseDestroy();
    
    this.logger.info('DeviceDetector destroyed');
  }

  /**
   * 获取完整的设备信息
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    const cacheKey = 'device_info';
    
    // 尝试从缓存获取
    if (this.options.cache) {
      const cached = this.getCached<DeviceInfo>(cacheKey);
      if (cached) {
        this.logger.debug('Device info retrieved from cache');
        return cached;
      }
    }

    return this.safeExecute(async () => {
      const deviceInfo = this._detectDevice();
      
      // 缓存结果
      if (this.options.cache) {
        this.setCached(cacheKey, deviceInfo, this.options.cacheTTL);
      }
      
      this.emit('deviceInfoDetected', deviceInfo);
      return deviceInfo;
    }, 'getDeviceInfo');
  }

  /**
   * 刷新设备信息
   */
  async refresh(): Promise<DeviceInfo> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    this.logger.debug('Refreshing device info');
    
    // 清除缓存
    this._deviceInfo = null;
    if (this.cache) {
      this.cache.delete('device_info');
    }
    
    const deviceInfo = await this.getDeviceInfo();
    this.emit('deviceInfoRefreshed', deviceInfo);
    return deviceInfo;
  }

  /**
   * 检测设备信息
   */
  private _detectDevice(): DeviceInfo {
    const startTime = Date.now();
    
    try {
      const userAgent = this._getUserAgent();
      const screen = getScreenSize();
      
      const deviceInfo: DeviceInfo = {
        type: getDeviceType(this._detectionOptions),
        os: detectOS(userAgent),
        browser: detectBrowser(userAgent),
        isMobile: isMobile(this._detectionOptions),
        isTablet: isTablet(this._detectionOptions),
        isDesktop: isDesktop(this._detectionOptions),
        isTouchDevice: isTouchDevice(),
        userAgent,
        screen
      };

      // 性能监控
      if (this.options.enablePerformanceMonitoring) {
        const detectionTime = Date.now() - startTime;
        this.logger.debug(`Device detection completed in ${detectionTime}ms`);
        this.emit('performanceMetric', { operation: 'detection', time: detectionTime });
      }

      return deviceInfo;
    } catch (error) {
      throw this.handleError(error as Error, '_detectDevice');
    }
  }

  /**
   * 获取用户代理字符串
   */
  private _getUserAgent(): string {
    if (this._detectionOptions.ua) {
      if (typeof this._detectionOptions.ua === 'string') {
        return this._detectionOptions.ua;
      }
      if (this._detectionOptions.ua.headers && this._detectionOptions.ua.headers['user-agent']) {
        return this._detectionOptions.ua.headers['user-agent'];
      }
    }
    
    return typeof navigator !== 'undefined' ? navigator.userAgent : '';
  }

  /**
   * 更新检测选项
   */
  setDetectionOptions(options: Partial<MobileDetectOptions>): this {
    this.ensureNotDestroyed();
    
    this._detectionOptions = { ...this._detectionOptions, ...options };
    
    // 清除缓存，强制重新检测
    this._deviceInfo = null;
    if (this.cache) {
      this.cache.delete('device_info');
    }
    
    this.emit('detectionOptionsUpdated', this._detectionOptions);
    this.logger.debug('Detection options updated', this._detectionOptions);
    
    return this;
  }

  /**
   * 获取当前检测选项
   */
  getDetectionOptions(): MobileDetectOptions {
    return { ...this._detectionOptions };
  }

  /**
   * 检查特定设备类型
   */
  async checkDeviceType(type: 'mobile' | 'tablet' | 'desktop'): Promise<boolean> {
    const deviceInfo = await this.getDeviceInfo();
    
    switch (type) {
      case 'mobile':
        return deviceInfo.isMobile && !deviceInfo.isTablet;
      case 'tablet':
        return deviceInfo.isTablet;
      case 'desktop':
        return deviceInfo.isDesktop;
      default:
        throw this.errorHandler.createError(
          'USER_ERROR' as any,
          `Invalid device type: ${type}`,
          { context: { method: 'checkDeviceType' } }
        );
    }
  }

  /**
   * 检查操作系统
   */
  async checkOS(os: string): Promise<boolean> {
    const deviceInfo = await this.getDeviceInfo();
    return deviceInfo.os.toLowerCase() === os.toLowerCase();
  }

  /**
   * 检查浏览器
   */
  async checkBrowser(browser: string): Promise<boolean> {
    const deviceInfo = await this.getDeviceInfo();
    return deviceInfo.browser.toLowerCase() === browser.toLowerCase();
  }

  /**
   * 获取设备能力信息
   */
  async getDeviceCapabilities(): Promise<{
    touchSupport: boolean;
    screenSize: { width: number; height: number; pixelRatio: number };
    userAgent: string;
    online: boolean;
  }> {
    const deviceInfo = await this.getDeviceInfo();
    
    return {
      touchSupport: deviceInfo.isTouchDevice,
      screenSize: deviceInfo.screen,
      userAgent: deviceInfo.userAgent,
      online: typeof navigator !== 'undefined' ? navigator.onLine : true
    };
  }
}

/**
 * 获取设备信息
 * @param options 检测选项
 * @returns 设备信息对象
 */
export function getDeviceInfo(options?: MobileDetectOptions): DeviceInfo {
  const detector = new DeviceDetector(options);
  return detector.getDeviceInfo();
}

/**
 * 创建设备检测器实例
 * @param options 检测选项
 * @returns 设备检测器实例
 */
export function createDeviceDetector(options?: MobileDetectOptions): DeviceDetector {
  return new DeviceDetector(options);
}

// 默认导出
export default {
  DeviceDetector,
  getDeviceInfo,
  createDeviceDetector
};