/**
 * 设备检测主要功能类
 */

import type { DeviceInfo, MobileDetectOptions } from './types';
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

/**
 * 设备检测管理类
 */
export class DeviceDetector {
  private _deviceInfo: DeviceInfo | null = null;
  private _options: MobileDetectOptions;

  constructor(options: MobileDetectOptions = {}) {
    this._options = options;
  }

  /**
   * 获取完整的设备信息
   */
  getDeviceInfo(): DeviceInfo {
    if (!this._deviceInfo) {
      this._deviceInfo = this._detectDevice();
    }
    return this._deviceInfo;
  }

  /**
   * 刷新设备信息
   */
  refresh(): DeviceInfo {
    this._deviceInfo = null;
    return this.getDeviceInfo();
  }

  /**
   * 检测设备信息
   */
  private _detectDevice(): DeviceInfo {
    const userAgent = this._getUserAgent();
    const screen = getScreenSize();
    
    return {
      type: getDeviceType(this._options),
      os: detectOS(userAgent),
      browser: detectBrowser(userAgent),
      isMobile: isMobile(this._options),
      isTablet: isTablet(this._options),
      isDesktop: isDesktop(this._options),
      isTouchDevice: isTouchDevice(),
      userAgent,
      screen
    };
  }

  /**
   * 获取用户代理字符串
   */
  private _getUserAgent(): string {
    if (this._options.ua) {
      if (typeof this._options.ua === 'string') {
        return this._options.ua;
      }
      if (this._options.ua.headers && this._options.ua.headers['user-agent']) {
        return this._options.ua.headers['user-agent'];
      }
    }
    
    return typeof navigator !== 'undefined' ? navigator.userAgent : '';
  }

  /**
   * 更新检测选项
   */
  setOptions(options: MobileDetectOptions): this {
    this._options = { ...this._options, ...options };
    this._deviceInfo = null; // 清除缓存，强制重新检测
    return this;
  }

  /**
   * 获取当前选项
   */
  getOptions(): MobileDetectOptions {
    return { ...this._options };
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