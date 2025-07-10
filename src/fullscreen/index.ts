import { isElement, isHTMLElement, getPrefixedProperty, addEventListener, removeEventListener } from '../utils/dom';

/**
 * 全屏选项接口
 */
export interface FullscreenOptions {
  navigationUI?: 'auto' | 'hide' | 'show';
}

/**
 * 全屏事件类型
 */
export type FullscreenEventType = 'change' | 'error';

/**
 * 全屏事件监听器类型
 */
export type FullscreenEventListener = (event?: Event) => void;

/**
 * 全屏管理器类
 */
class FullscreenManager {
  private eventListeners: Map<FullscreenEventType, Set<FullscreenEventListener>> = new Map();
  private boundChangeHandler: (event: Event) => void;
  private boundErrorHandler: (event: Event) => void;

  constructor() {
    this.boundChangeHandler = this.handleChange.bind(this);
    this.boundErrorHandler = this.handleError.bind(this);
    this.initEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  private initEventListeners(): void {
    const changeEvent = this.getPrefixedEventName('fullscreenchange');
    const errorEvent = this.getPrefixedEventName('fullscreenerror');

    if (changeEvent) {
      addEventListener(document, changeEvent, this.boundChangeHandler);
    }
    if (errorEvent) {
      addEventListener(document, errorEvent, this.boundErrorHandler);
    }
  }

  /**
   * 获取带前缀的事件名
   */
  private getPrefixedEventName(eventName: string): string | null {
    const prefixes = ['', 'webkit', 'moz', 'ms'];
    
    for (const prefix of prefixes) {
      const prefixedEventName = prefix ? `${prefix}${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}` : eventName;
      if (prefixedEventName in document) {
        return prefixedEventName;
      }
    }
    
    return null;
  }

  /**
   * 获取带前缀的方法名
   */
  private getPrefixedMethodName(methodName: string): string | null {
    const prefixes = ['', 'webkit', 'moz', 'ms'];
    
    for (const prefix of prefixes) {
      const prefixedMethodName = prefix ? `${prefix}${methodName.charAt(0).toUpperCase()}${methodName.slice(1)}` : methodName;
      if (prefixedMethodName in document.documentElement) {
        return prefixedMethodName;
      }
    }
    
    return null;
  }

  /**
   * 处理全屏状态变化事件
   */
  private handleChange(event: Event): void {
    const listeners = this.eventListeners.get('change');
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * 处理全屏错误事件
   */
  private handleError(event: Event): void {
    const listeners = this.eventListeners.get('error');
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * 检查是否支持全屏
   */
  get isEnabled(): boolean {
    const enabledProperty = getPrefixedProperty('fullscreenEnabled');
    return enabledProperty ? (document as any)[enabledProperty] : false;
  }

  /**
   * 检查是否处于全屏状态
   */
  get isFullscreen(): boolean {
    const elementProperty = getPrefixedProperty('fullscreenElement');
    return elementProperty ? !!(document as any)[elementProperty] : false;
  }

  /**
   * 获取当前全屏元素
   */
  get element(): Element | undefined {
    const elementProperty = getPrefixedProperty('fullscreenElement');
    return elementProperty ? (document as any)[elementProperty] : undefined;
  }

  /**
   * 进入全屏
   */
  async request(element?: Element, options?: FullscreenOptions): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Fullscreen is not supported or not enabled');
    }

    const targetElement = element || document.documentElement;
    
    if (!isElement(targetElement)) {
      throw new Error('Invalid element provided');
    }

    const requestMethod = this.getPrefixedMethodName('requestFullscreen');
    if (!requestMethod) {
      throw new Error('Fullscreen request method not supported');
    }

    try {
      if (requestMethod === 'webkitRequestFullscreen') {
        // WebKit 需要特殊处理
        await (targetElement as any)[requestMethod]((Element as any).ALLOW_KEYBOARD_INPUT);
      } else {
        await (targetElement as any)[requestMethod](options);
      }
    } catch (error) {
      throw new Error(`Failed to enter fullscreen: ${error}`);
    }
  }

  /**
   * 退出全屏
   */
  async exit(): Promise<void> {
    if (!this.isFullscreen) {
      return;
    }

    const exitMethod = getPrefixedProperty('exitFullscreen');
    if (!exitMethod) {
      throw new Error('Fullscreen exit method not supported');
    }

    try {
      await (document as any)[exitMethod]();
    } catch (error) {
      throw new Error(`Failed to exit fullscreen: ${error}`);
    }
  }

  /**
   * 切换全屏状态
   */
  async toggle(element?: Element, options?: FullscreenOptions): Promise<void> {
    if (this.isFullscreen) {
      await this.exit();
    } else {
      await this.request(element, options);
    }
  }

  /**
   * 添加事件监听器
   */
  on(event: FullscreenEventType, listener: FullscreenEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: FullscreenEventType, listener: FullscreenEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 移除所有事件监听器
   */
  offAll(event?: FullscreenEventType): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    const changeEvent = this.getPrefixedEventName('fullscreenchange');
    const errorEvent = this.getPrefixedEventName('fullscreenerror');

    if (changeEvent) {
      removeEventListener(document, changeEvent, this.boundChangeHandler);
    }
    if (errorEvent) {
      removeEventListener(document, errorEvent, this.boundErrorHandler);
    }

    this.eventListeners.clear();
  }
}

// 创建单例实例
const fullscreen = new FullscreenManager();

export default fullscreen;
export { FullscreenManager }; 