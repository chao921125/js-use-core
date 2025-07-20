/**
 * 设备相关工具函数
 */

import { ScreenOrientation, NetworkType } from './types';

/**
 * 获取屏幕尺寸信息
 * @returns 屏幕尺寸对象
 */
export function getScreenSize() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, pixelRatio: 1 };
  }
  
  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1
  };
}

/**
 * 获取视口尺寸
 * @returns 视口尺寸对象
 */
export function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
  };
}

/**
 * 获取屏幕方向
 * @returns 屏幕方向
 */
export function getScreenOrientation(): ScreenOrientation {
  if (typeof window === 'undefined') {
    return ScreenOrientation.PORTRAIT;
  }
  
  const { width, height } = getViewportSize();
  return width > height ? ScreenOrientation.LANDSCAPE : ScreenOrientation.PORTRAIT;
}

/**
 * 监听屏幕方向变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function onOrientationChange(callback: (orientation: ScreenOrientation) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const handler = () => {
    callback(getScreenOrientation());
  };
  
  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
}

/**
 * 获取网络连接类型
 * @returns 网络类型
 */
export function getNetworkType(): NetworkType {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return NetworkType.UNKNOWN;
  }
  
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return NetworkType.UNKNOWN;
  
  const type = connection.type || connection.effectiveType;
  
  if (type === 'wifi') return NetworkType.WIFI;
  if (type === 'cellular' || /^[2-4]g$/.test(type)) return NetworkType.CELLULAR;
  if (type === 'ethernet') return NetworkType.ETHERNET;
  
  return NetworkType.UNKNOWN;
}

/**
 * 获取网络连接速度
 * @returns 网络速度信息
 */
export function getNetworkSpeed() {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return { downlink: 0, rtt: 0, effectiveType: 'unknown' };
  }
  
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return { downlink: 0, rtt: 0, effectiveType: 'unknown' };
  }
  
  return {
    downlink: connection.downlink || 0, // Mbps
    rtt: connection.rtt || 0, // ms
    effectiveType: connection.effectiveType || 'unknown'
  };
}

/**
 * 检测是否在线
 * @returns 是否在线
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * 监听网络状态变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const onlineHandler = () => callback(true);
  const offlineHandler = () => callback(false);
  
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  
  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  };
}

/**
 * 获取电池信息
 * @returns Promise<BatteryManager | null> 电池信息
 */
export async function getBatteryInfo(): Promise<any> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null;
  }
  
  try {
    // @ts-ignore
    const battery = await navigator.getBattery();
    return {
      charging: battery.charging,
      level: battery.level,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    };
  } catch {
    return null;
  }
}

/**
 * 获取内存信息
 * @returns 内存信息
 */
export function getMemoryInfo() {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
  }
  
  return null;
}

/**
 * 检测是否支持 Service Worker
 * @returns 是否支持 Service Worker
 */
export function supportsServiceWorker(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * 检测是否支持 Web Workers
 * @returns 是否支持 Web Workers
 */
export function supportsWebWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * 检测是否支持 WebAssembly
 * @returns 是否支持 WebAssembly
 */
export function supportsWebAssembly(): boolean {
  return typeof WebAssembly !== 'undefined';
}

/**
 * 检测是否支持 WebGL
 * @returns 是否支持 WebGL
 */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/**
 * 检测是否支持 WebGL2
 * @returns 是否支持 WebGL2
 */
export function supportsWebGL2(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

/**
 * 获取 GPU 信息
 * @returns GPU 信息
 */
export function getGPUInfo() {
  if (typeof window === 'undefined') return null;
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;
    
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    
    return {
      vendor: (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    };
  } catch {
    return null;
  }
}