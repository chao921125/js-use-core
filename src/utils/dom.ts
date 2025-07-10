/**
 * DOM 相关工具方法
 */

/**
 * 检查是否为有效的 DOM 元素
 */
export function isElement(element: any): element is Element {
  return element && element.nodeType === Node.ELEMENT_NODE;
}

/**
 * 检查是否为有效的 HTMLElement
 */
export function isHTMLElement(element: any): element is HTMLElement {
  return isElement(element) && element instanceof HTMLElement;
}

/**
 * 获取元素，支持选择器字符串或 DOM 元素
 */
export function getElement(selector: string | Element): Element | null {
  if (isElement(selector)) {
    return selector;
  }
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  }
  return null;
}

/**
 * 检查浏览器是否支持指定特性
 */
export function isSupported(feature: string): boolean {
  return feature in document || feature in window;
}

/**
 * 获取带前缀的属性名
 */
export function getPrefixedProperty(property: string): string | null {
  const prefixes = ['', 'webkit', 'moz', 'ms'];
  
  for (const prefix of prefixes) {
    const prefixedProperty = prefix ? `${prefix}${property.charAt(0).toUpperCase()}${property.slice(1)}` : property;
    if (prefixedProperty in document || prefixedProperty in window) {
      return prefixedProperty;
    }
  }
  
  return null;
}

/**
 * 绑定事件监听器
 */
export function addEventListener(
  element: Element | Document | Window,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): void {
  element.addEventListener(event, handler, options);
}

/**
 * 移除事件监听器
 */
export function removeEventListener(
  element: Element | Document | Window,
  event: string,
  handler: EventListener,
  options?: boolean | EventListenerOptions
): void {
  element.removeEventListener(event, handler, options);
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
  element: Element,
  type: string,
  detail?: any,
  options?: CustomEventInit
): boolean {
  const event = createCustomEvent(type, detail, options);
  return element.dispatchEvent(event);
} 