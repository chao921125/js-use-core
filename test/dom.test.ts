/**
 * DOM 工具函数测试
 */

import {
  // 元素检测和获取
  isElement,
  isHTMLElement,
  isDocument,
  getElement,
  getElements,
  
  // 浏览器兼容性检测
  checkBrowserSupport,
  getPrefixedCSSProperty,
  supportsCSSFeature,
  supportsHTML5Feature,
  isSupported,
  getPrefixedProperty,
  
  // 事件处理
  addEventListener,
  removeEventListener,
  removeAllEventListeners,
  createCustomEvent,
  dispatchCustomEvent,
  delegate,
  
  // 性能优化DOM操作
  batchDOMOperations,
  createDocumentFragment,
  appendElements,
  setStyles,
  setAttributes,
  measureElement,
  isElementInViewport,
  
  // 便捷方法
  ready,
  waitForElement,
  flushBatchedOperations
} from '../src/utils/dom';

// Mock DOM APIs for testing
const mockElement = {
  nodeType: Node.ELEMENT_NODE,
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  appendChild: jest.fn(),
  setAttribute: jest.fn(),
  getBoundingClientRect: jest.fn(),
  contains: jest.fn(),
  closest: jest.fn(),
  style: {},
  innerHTML: ''
};



// Setup global mocks
(global as any).Node = {
  ELEMENT_NODE: 1,
  DOCUMENT_NODE: 9
};

(global as any).CustomEvent = jest.fn().mockImplementation((type, options) => ({
  type,
  ...options
}));

(global as any).MutationObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}));

(global as any).requestAnimationFrame = jest.fn().mockImplementation((callback) => {
  setTimeout(callback, 16);
  return 1;
});

(global as any).cancelAnimationFrame = jest.fn();

// Mock document and window
Object.defineProperty(document, 'readyState', {
  writable: true,
  value: 'complete'
});

Object.defineProperty(document, 'querySelector', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(document, 'querySelectorAll', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(document, 'createDocumentFragment', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(document, 'addEventListener', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    style: {},
    clientHeight: 768,
    clientWidth: 1024
  }
});

Object.defineProperty(document, 'body', {
  writable: true,
  value: mockElement
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024
});

describe('DOM 工具函数', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('元素检测和获取工具', () => {
    test('isElement 应该正确检测DOM元素', () => {
      expect(isElement(mockElement)).toBe(true);
      expect(isElement(null)).toBe(false);
      expect(isElement(undefined)).toBe(false);
      expect(isElement({})).toBe(false);
      expect(isElement('string')).toBe(false);
    });

    test('isHTMLElement 应该正确检测HTML元素', () => {
      const htmlElement = { ...mockElement };
      Object.setPrototypeOf(htmlElement, HTMLElement.prototype);
      
      expect(isHTMLElement(htmlElement)).toBe(true);
      expect(isHTMLElement(mockElement)).toBe(false);
      expect(isHTMLElement(null)).toBe(false);
    });

    test('isDocument 应该正确检测文档节点', () => {
      const mockDoc = { nodeType: Node.DOCUMENT_NODE };
      expect(isDocument(mockDoc)).toBe(true);
      expect(isDocument(mockElement)).toBe(false);
      expect(isDocument(null)).toBe(false);
    });

    test('getElement 应该正确获取元素', () => {
      (document.querySelector as jest.Mock).mockReturnValue(mockElement);
      
      // 测试传入元素直接返回
      expect(getElement(mockElement)).toBe(mockElement);
      
      // 测试传入选择器
      expect(getElement('#test')).toBe(mockElement);
      expect(document.querySelector).toHaveBeenCalledWith('#test');
      
      // 测试传入null
      expect(getElement(null)).toBe(null);
      
      // 测试无效选择器
      (document.querySelector as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid selector');
      });
      expect(getElement('invalid[[')).toBe(null);
    });

    test('getElements 应该正确获取多个元素', () => {
      const elements = [mockElement, { ...mockElement }];
      (document.querySelectorAll as jest.Mock).mockReturnValue(elements);
      
      expect(getElements('.test')).toEqual(elements);
      expect(document.querySelectorAll).toHaveBeenCalledWith('.test');
      
      // 测试无效选择器
      (document.querySelectorAll as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid selector');
      });
      expect(getElements('invalid[[')).toEqual([]);
    });
  });

  describe('浏览器兼容性检测工具', () => {
    test('checkBrowserSupport 应该正确检测浏览器支持', () => {
      // 测试支持的特性
      (document.documentElement.style as any).transform = '';
      const result1 = checkBrowserSupport('transform');
      expect(result1.supported).toBe(true);
      
      // 测试需要前缀的特性
      delete (document.documentElement.style as any).transform;
      (document.documentElement.style as any).webkitTransform = '';
      const result2 = checkBrowserSupport('transform');
      expect(result2.supported).toBe(true);
      expect(result2.prefixedName).toBe('webkitTransform');
      expect(result2.prefix).toBe('webkit');
      
      // 测试不支持的特性
      delete (document.documentElement.style as any).webkitTransform;
      const result3 = checkBrowserSupport('unsupportedFeature');
      expect(result3.supported).toBe(false);
    });

    test('getPrefixedCSSProperty 应该返回正确的CSS属性名', () => {
      (document.documentElement.style as any).transform = '';
      expect(getPrefixedCSSProperty('transform')).toBe('transform');
      
      delete (document.documentElement.style as any).transform;
      expect(getPrefixedCSSProperty('unsupportedFeature')).toBe(null);
    });

    test('supportsCSSFeature 应该正确检测CSS特性支持', () => {
      const mockDiv = {
        style: {
          transform: ''
        }
      };
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
      
      expect(supportsCSSFeature('transform', 'rotate(45deg)')).toBe(true);
      expect(supportsCSSFeature('unsupportedFeature')).toBe(false);
    });

    test('supportsHTML5Feature 应该正确检测HTML5特性', () => {
      const mockDiv = {
        placeholder: ''
      };
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
      
      expect(supportsHTML5Feature('placeholder')).toBe(true);
      expect(supportsHTML5Feature('unsupportedFeature')).toBe(false);
    });

    test('isSupported 应该是 checkBrowserSupport 的便捷方法', () => {
      (document.documentElement.style as any).transform = '';
      expect(isSupported('transform')).toBe(true);
      
      delete (document.documentElement.style as any).transform;
      expect(isSupported('unsupportedFeature')).toBe(false);
    });
  });

  describe('事件处理工具', () => {
    test('addEventListener 应该正确添加事件监听器', () => {
      const handler = jest.fn();
      const removeListener = addEventListener(mockElement, 'click', handler);
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, undefined);
      expect(typeof removeListener).toBe('function');
    });

    test('removeEventListener 应该正确移除事件监听器', () => {
      const handler = jest.fn();
      removeEventListener(mockElement, 'click', handler);
      
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', handler, undefined);
    });

    test('createCustomEvent 应该创建自定义事件', () => {
      const event = createCustomEvent('test', { data: 'test' });
      
      expect(CustomEvent).toHaveBeenCalledWith('test', {
        detail: { data: 'test' },
        bubbles: true,
        cancelable: true
      });
    });

    test('dispatchCustomEvent 应该触发自定义事件', () => {
      mockElement.dispatchEvent.mockReturnValue(true);
      
      const result = dispatchCustomEvent(mockElement, 'test', { data: 'test' });
      
      expect(result).toBe(true);
      expect(mockElement.dispatchEvent).toHaveBeenCalled();
    });

    test('delegate 应该正确设置事件委托', () => {
      const handler = jest.fn();
      const container = mockElement;
      const target = { ...mockElement };
      
      container.contains.mockReturnValue(true);
      target.closest.mockReturnValue(target);
      
      const removeDelegate = delegate(container, '.item', 'click', handler);
      
      expect(typeof removeDelegate).toBe('function');
      expect(container.addEventListener).toHaveBeenCalled();
    });
  });

  describe('性能优化DOM操作工具', () => {
    test('batchDOMOperations 应该批量执行操作', () => {
      const operations = [jest.fn(), jest.fn(), jest.fn()];
      
      batchDOMOperations(operations);
      
      // 由于使用了 requestAnimationFrame，需要等待执行
      setTimeout(() => {
        operations.forEach(op => {
          expect(op).toHaveBeenCalled();
        });
      }, 20);
    });

    test('createDocumentFragment 应该创建文档片段', () => {
      const fragment = {};
      (document.createDocumentFragment as jest.Mock).mockReturnValue(fragment);
      
      expect(createDocumentFragment()).toBe(fragment);
      expect(document.createDocumentFragment).toHaveBeenCalled();
    });

    test('appendElements 应该批量添加元素', () => {
      const container = mockElement;
      const fragment = { appendChild: jest.fn() };
      const elements = [mockElement, '<div>test</div>'];
      
      (document.createDocumentFragment as jest.Mock).mockReturnValue(fragment);
      (document.createElement as jest.Mock).mockReturnValue({
        innerHTML: '',
        firstChild: mockElement
      });
      
      appendElements(container, elements);
      
      expect(container.appendChild).toHaveBeenCalled();
    });

    test('setStyles 应该批量设置样式', () => {
      const element = { style: {} };
      const styles = { color: 'red', fontSize: '16px' };
      
      setStyles(element, styles);
      
      // 由于使用了批量操作，需要等待执行
      setTimeout(() => {
        expect(element.style.color).toBe('red');
        expect(element.style.fontSize).toBe('16px');
      }, 20);
    });

    test('setAttributes 应该批量设置属性', () => {
      const attributes = { id: 'test', class: 'test-class' };
      
      setAttributes(mockElement, attributes);
      
      // 由于使用了批量操作，需要等待执行
      setTimeout(() => {
        expect(mockElement.setAttribute).toHaveBeenCalledWith('id', 'test');
        expect(mockElement.setAttribute).toHaveBeenCalledWith('class', 'test-class');
      }, 20);
    });

    test('measureElement 应该测量元素尺寸', () => {
      const rect = { width: 100, height: 50, top: 10, left: 20 };
      mockElement.getBoundingClientRect.mockReturnValue(rect);
      
      expect(measureElement(mockElement)).toBe(rect);
      expect(mockElement.getBoundingClientRect).toHaveBeenCalled();
    });

    test('isElementInViewport 应该检查元素是否在视口中', () => {
      const rect = { top: 100, left: 100, bottom: 200, right: 200 };
      mockElement.getBoundingClientRect.mockReturnValue(rect);
      
      expect(isElementInViewport(mockElement)).toBe(true);
      
      // 测试元素在视口外
      const rectOutside = { top: -100, left: -100, bottom: -50, right: -50 };
      mockElement.getBoundingClientRect.mockReturnValue(rectOutside);
      
      expect(isElementInViewport(mockElement)).toBe(false);
    });
  });

  describe('便捷方法', () => {
    test('ready 应该在DOM准备就绪时执行回调', () => {
      const callback = jest.fn();
      
      // 测试DOM已准备就绪
      Object.defineProperty(document, 'readyState', { value: 'complete', writable: true });
      ready(callback);
      expect(callback).toHaveBeenCalled();
      
      // 测试DOM未准备就绪
      callback.mockClear();
      Object.defineProperty(document, 'readyState', { value: 'loading', writable: true });
      ready(callback);
      expect(document.addEventListener).toHaveBeenCalledWith(
        'DOMContentLoaded',
        callback,
        { once: true }
      );
    });

    test('waitForElement 应该等待元素出现', async () => {
      // 测试元素已存在
      (document.querySelector as jest.Mock).mockReturnValue(mockElement);
      const result = await waitForElement('#test');
      expect(result).toBe(mockElement);
      
      // 测试元素不存在但会出现
      (document.querySelector as jest.Mock).mockReturnValueOnce(null);
      const observer = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
      (MutationObserver as jest.Mock).mockImplementation((callback) => {
        // 模拟元素出现
        setTimeout(() => {
          (document.querySelector as jest.Mock).mockReturnValue(mockElement);
          callback();
        }, 10);
        return observer;
      });
      
      const result2 = await waitForElement('#test2');
      expect(result2).toBe(mockElement);
      expect(observer.observe).toHaveBeenCalled();
    });

    test('flushBatchedOperations 应该立即执行批量操作', () => {
      const operation = jest.fn();
      batchDOMOperations([operation]);
      
      flushBatchedOperations();
      
      expect(operation).toHaveBeenCalled();
    });
  });
});