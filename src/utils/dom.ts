/**
 * DOM 相关工具方法
 * 
 * @description 提供统一的DOM操作、事件处理和浏览器兼容性检测工具
 * @author js-use-core
 * @date 2024-07-20
 */

/**
 * DOM元素选择器类型
 */
export type ElementSelector = string | Element | null;

/**
 * 事件监听器配置选项
 */
export interface EventListenerOptions extends AddEventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean;
  /** 是否在捕获阶段执行 */
  capture?: boolean;
  /** 是否为被动监听器 */
  passive?: boolean;
}

/**
 * 浏览器兼容性检测结果
 */
export interface BrowserCompatibility {
  /** 是否支持该特性 */
  supported: boolean;
  /** 带前缀的属性名（如果需要） */
  prefixedName?: string;
  /** 检测到的前缀 */
  prefix?: string;
}

/**
 * DOM操作性能配置
 */
export interface DOMPerformanceConfig {
  /** 是否启用批量操作 */
  enableBatch?: boolean;
  /** 批量操作延迟时间（毫秒） */
  batchDelay?: number;
  /** 是否使用DocumentFragment */
  useFragment?: boolean;
}

// ============================================================================
// 元素检测和获取工具
// ============================================================================

/**
 * 检查是否为有效的 DOM 元素
 */
export function isElement(element: any): element is Element {
  return !!(element && 
         typeof element === 'object' && 
         element.nodeType === Node.ELEMENT_NODE);
}

/**
 * 检查是否为有效的 HTMLElement
 */
export function isHTMLElement(element: any): element is HTMLElement {
  return isElement(element) && element instanceof HTMLElement;
}

/**
 * 检查是否为有效的文档节点
 */
export function isDocument(element: any): element is Document {
  return element && element.nodeType === Node.DOCUMENT_NODE;
}

/**
 * 统一的元素获取方法，支持选择器字符串或 DOM 元素
 */
export function getElement(selector: ElementSelector): Element | null {
  if (!selector) return null;
  
  if (isElement(selector)) {
    return selector;
  }
  
  if (typeof selector === 'string') {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return null;
    }
  }
  
  return null;
}

/**
 * 获取多个元素
 */
export function getElements(selector: string): Element[] {
  try {
    return Array.from(document.querySelectorAll(selector));
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return [];
  }
}

// ============================================================================
// 浏览器兼容性检测工具
// ============================================================================

/**
 * 浏览器前缀列表
 */
const VENDOR_PREFIXES = ['', 'webkit', 'moz', 'ms', 'o'] as const;

/**
 * 检查浏览器是否支持指定特性
 */
export function checkBrowserSupport(feature: string): BrowserCompatibility {
  // 首先检查无前缀版本
  if (feature in document.documentElement.style || 
      feature in window || 
      feature in document) {
    return { supported: true };
  }
  
  // 检查带前缀的版本
  for (const prefix of VENDOR_PREFIXES.slice(1)) {
    const prefixedName = `${prefix}${feature.charAt(0).toUpperCase()}${feature.slice(1)}`;
    
    if (prefixedName in document.documentElement.style || 
        prefixedName in window || 
        prefixedName in document) {
      return {
        supported: true,
        prefixedName,
        prefix
      };
    }
  }
  
  return { supported: false };
}

/**
 * 获取带前缀的CSS属性名
 */
export function getPrefixedCSSProperty(property: string): string | null {
  const result = checkBrowserSupport(property);
  return result.supported ? (result.prefixedName || property) : null;
}

/**
 * 检查是否支持CSS特性
 */
export function supportsCSSFeature(property: string, value?: string): boolean {
  const element = document.createElement('div');
  const prefixedProperty = getPrefixedCSSProperty(property);
  
  if (!prefixedProperty) return false;
  
  try {
    element.style[prefixedProperty as any] = value || 'initial';
    return element.style[prefixedProperty as any] !== '';
  } catch {
    return false;
  }
}

/**
 * 检查是否支持HTML5特性
 */
export function supportsHTML5Feature(feature: string): boolean {
  const element = document.createElement('div');
  return feature in element;
}

/**
 * 检查浏览器是否支持指定特性（兼容旧版本API）
 */
export function isSupported(feature: string): boolean {
  return checkBrowserSupport(feature).supported;
}

/**
 * 获取带前缀的属性名（兼容旧版本API）
 */
export function getPrefixedProperty(property: string): string | null {
  return getPrefixedCSSProperty(property);
}

// ============================================================================
// 统一事件处理工具
// ============================================================================

/**
 * 事件监听器管理器
 */
class EventManager {
  private listeners = new WeakMap<Element | Document | Window, Map<string, Set<EventListener>>>();
  
  /**
   * 添加事件监听器
   */
  add(
    target: Element | Document | Window,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions
  ): () => void {
    target.addEventListener(event, handler, options);
    
    // 记录监听器以便后续管理
    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map());
    }
    
    const targetListeners = this.listeners.get(target)!;
    if (!targetListeners.has(event)) {
      targetListeners.set(event, new Set());
    }
    
    targetListeners.get(event)!.add(handler);
    
    // 返回移除函数
    return () => this.remove(target, event, handler, options);
  }
  
  /**
   * 移除事件监听器
   */
  remove(
    target: Element | Document | Window,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions
  ): void {
    target.removeEventListener(event, handler, options);
    
    const targetListeners = this.listeners.get(target);
    if (targetListeners) {
      const eventListeners = targetListeners.get(event);
      if (eventListeners) {
        eventListeners.delete(handler);
        if (eventListeners.size === 0) {
          targetListeners.delete(event);
        }
      }
    }
  }
  
  /**
   * 移除目标元素的所有监听器
   */
  removeAll(target: Element | Document | Window): void {
    const targetListeners = this.listeners.get(target);
    if (targetListeners) {
      for (const [event, handlers] of targetListeners) {
        for (const handler of handlers) {
          target.removeEventListener(event, handler);
        }
      }
      this.listeners.delete(target);
    }
  }
}

// 全局事件管理器实例
const eventManager = new EventManager();

/**
 * 统一的事件监听器添加方法
 */
export function addEventListener(
  target: ElementSelector | Document | Window,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
): () => void {
  const element = target instanceof Element ? target : getElement(target as ElementSelector);
  const actualTarget = element || (target as Document | Window);
  
  if (!actualTarget) {
    throw new Error('Invalid event target');
  }
  
  return eventManager.add(actualTarget, event, handler, options);
}

/**
 * 统一的事件监听器移除方法
 */
export function removeEventListener(
  target: ElementSelector | Document | Window,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
): void {
  const element = target instanceof Element ? target : getElement(target as ElementSelector);
  const actualTarget = element || (target as Document | Window);
  
  if (!actualTarget) {
    throw new Error('Invalid event target');
  }
  
  eventManager.remove(actualTarget, event, handler, options);
}

/**
 * 移除元素的所有事件监听器
 */
export function removeAllEventListeners(target: ElementSelector | Document | Window): void {
  const element = target instanceof Element ? target : getElement(target as ElementSelector);
  const actualTarget = element || (target as Document | Window);
  
  if (actualTarget) {
    eventManager.removeAll(actualTarget);
  }
}

/**
 * 创建自定义事件
 */
export function createCustomEvent(
  type: string,
  detail?: any,
  options?: CustomEventInit
): CustomEvent {
  return new CustomEvent(type, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options
  });
}

/**
 * 触发自定义事件
 */
export function dispatchCustomEvent(
  target: ElementSelector,
  type: string,
  detail?: any,
  options?: CustomEventInit
): boolean {
  const element = getElement(target);
  if (!element) {
    throw new Error('Invalid event target for dispatch');
  }
  
  const event = createCustomEvent(type, detail, options);
  return element.dispatchEvent(event);
}

/**
 * 事件委托处理
 */
export function delegate(
  container: ElementSelector,
  selector: string,
  event: string,
  handler: (event: Event, target: Element) => void,
  options?: EventListenerOptions
): () => void {
  const containerElement = getElement(container);
  if (!containerElement) {
    throw new Error('Invalid container for event delegation');
  }
  
  const delegateHandler = (e: Event) => {
    const target = e.target as Element;
    const matchedElement = target.closest(selector);
    
    if (matchedElement && containerElement.contains(matchedElement)) {
      handler(e, matchedElement);
    }
  };
  
  return addEventListener(containerElement, event, delegateHandler, options);
}

// ============================================================================
// 性能优化的DOM操作工具
// ============================================================================

/**
 * 批量DOM操作管理器
 */
class BatchDOMManager {
  private operations: (() => void)[] = [];
  private rafId: number | null = null;
  
  /**
   * 添加操作到批次中
   */
  add(operation: () => void): void {
    this.operations.push(operation);
    this.schedule();
  }
  
  /**
   * 调度批量执行
   */
  private schedule(): void {
    if (this.rafId !== null) return;
    
    this.rafId = requestAnimationFrame(() => {
      this.flush();
    });
  }
  
  /**
   * 执行所有批量操作
   */
  private flush(): void {
    const operations = this.operations.splice(0);
    this.rafId = null;
    
    // 在单个重排/重绘周期内执行所有操作
    for (const operation of operations) {
      try {
        operation();
      } catch (error) {
        console.error('Batch DOM operation failed:', error);
      }
    }
  }
  
  /**
   * 立即执行所有待处理操作
   */
  flushSync(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.flush();
  }
}

// 全局批量操作管理器
const batchManager = new BatchDOMManager();

/**
 * 批量执行DOM操作以优化性能
 */
export function batchDOMOperations(operations: (() => void)[]): void {
  operations.forEach(op => batchManager.add(op));
}

/**
 * 使用DocumentFragment优化大量DOM插入
 */
export function createDocumentFragment(): DocumentFragment {
  return document.createDocumentFragment();
}

/**
 * 批量添加元素到容器
 */
export function appendElements(
  container: ElementSelector,
  elements: (Element | string)[],
  config: DOMPerformanceConfig = {}
): void {
  const containerElement = getElement(container);
  if (!containerElement) {
    throw new Error('Invalid container element');
  }
  
  const { useFragment = true } = config;
  
  if (useFragment && elements.length > 1) {
    const fragment = createDocumentFragment();
    
    elements.forEach(element => {
      if (typeof element === 'string') {
        const div = document.createElement('div');
        div.innerHTML = element;
        while (div.firstChild) {
          fragment.appendChild(div.firstChild);
        }
      } else {
        fragment.appendChild(element);
      }
    });
    
    containerElement.appendChild(fragment);
  } else {
    elements.forEach(element => {
      if (typeof element === 'string') {
        containerElement.insertAdjacentHTML('beforeend', element);
      } else {
        containerElement.appendChild(element);
      }
    });
  }
}

/**
 * 高性能的样式批量设置
 */
export function setStyles(
  target: ElementSelector,
  styles: Partial<CSSStyleDeclaration>
): void {
  const element = getElement(target) as HTMLElement;
  if (!element) {
    throw new Error('Invalid target element for style setting');
  }
  
  // 批量设置样式以减少重排
  batchManager.add(() => {
    Object.assign(element.style, styles);
  });
}

/**
 * 高性能的属性批量设置
 */
export function setAttributes(
  target: ElementSelector,
  attributes: Record<string, string>
): void {
  const element = getElement(target);
  if (!element) {
    throw new Error('Invalid target element for attribute setting');
  }
  
  batchManager.add(() => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  });
}

/**
 * 测量元素尺寸（避免强制重排）
 */
export function measureElement(target: ElementSelector): DOMRect | null {
  const element = getElement(target);
  if (!element) return null;
  
  return element.getBoundingClientRect();
}

/**
 * 检查元素是否在视口中
 */
export function isElementInViewport(
  target: ElementSelector,
  threshold = 0
): boolean {
  const element = getElement(target);
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= windowHeight + threshold &&
    rect.right <= windowWidth + threshold
  );
}

// ============================================================================
// 导出的便捷方法
// ============================================================================

/**
 * 等待DOM准备就绪
 */
export function ready(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

/**
 * 等待元素出现在DOM中
 */
export function waitForElement(
  selector: string,
  timeout = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = getElement(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = getElement(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });
    
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

/**
 * 立即执行所有待处理的批量DOM操作
 */
export function flushBatchedOperations(): void {
  batchManager.flushSync();
}