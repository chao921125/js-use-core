/**
 * 浏览器适配器测试
 */

import {
  BrowserAdapter,
  getBrowserAdapter,
  isFeatureSupported,
  getPrefixedProperty,
  getPrefixedMethod,
  getPrefixedCSSProperty,
  getBrowserInfo,
  addEventListenerCompat,
  FeatureDetection,
  type BrowserAdapterConfig,
  type FeatureDetectionResult,
  type BrowserInfo
} from '../src/utils/browser';

describe('BrowserAdapter', () => {
  let adapter: BrowserAdapter;

  beforeEach(() => {
    adapter = new BrowserAdapter({
      enableCache: true,
      debug: false
    });
  });

  afterEach(() => {
    adapter.destroy();
  });

  describe('构造函数和配置', () => {
    it('应该使用默认配置创建适配器', () => {
      const defaultAdapter = new BrowserAdapter();
      expect(defaultAdapter).toBeInstanceOf(BrowserAdapter);
      defaultAdapter.destroy();
    });

    it('应该使用自定义配置创建适配器', () => {
      const config: BrowserAdapterConfig = {
        enableCache: false,
        cacheTimeout: 10000,
        debug: true,
        customPrefixes: ['custom']
      };
      
      const customAdapter = new BrowserAdapter(config);
      expect(customAdapter).toBeInstanceOf(BrowserAdapter);
      customAdapter.destroy();
    });
  });

  describe('特征检测', () => {
    it('应该检测已知支持的特性', () => {
      // 测试已知存在的特性
      expect(adapter.isSupported('document')).toBe(true);
      expect(adapter.isSupported('window')).toBe(true);
      expect(adapter.isSupported('navigator')).toBe(true);
    });

    it('应该检测不支持的特性', () => {
      expect(adapter.isSupported('nonExistentFeature123')).toBe(false);
    });

    it('应该返回详细的检测结果', () => {
      const result = adapter.detectFeature('document');
      
      expect(result).toHaveProperty('supported');
      expect(result).toHaveProperty('method');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.supported).toBe('boolean');
      expect(typeof result.timestamp).toBe('number');
    });

    it('应该检测CSS属性支持', () => {
      const result = adapter.detectFeature('display', 'css');
      expect(result.supported).toBe(true);
      expect(result.method).toBe('css');
    });

    it('应该检测方法支持', () => {
      const result = adapter.detectFeature('querySelector', 'method', document);
      expect(result.supported).toBe(true);
      expect(result.method).toBe('method');
    });

    it('应该检测API支持', () => {
      const result = adapter.detectFeature('fetch', 'api');
      expect(result.method).toBe('api');
      // fetch可能支持也可能不支持，取决于测试环境
    });
  });

  describe('前缀处理', () => {
    it('应该获取CSS属性的前缀版本', () => {
      // 测试已知的CSS属性
      const display = adapter.getPrefixedCSSProperty('display');
      expect(display).toBe('display');
    });

    it('应该获取属性的前缀版本', () => {
      const prop = adapter.getPrefixedProperty('document');
      expect(prop).toBe('document');
    });

    it('应该获取方法的前缀版本', () => {
      const method = adapter.getPrefixedMethod('querySelector', document);
      expect(typeof method).toBe('function');
    });

    it('对于不存在的属性应该返回null', () => {
      const prop = adapter.getPrefixedProperty('nonExistentProperty123');
      expect(prop).toBeNull();
    });

    it('对于不存在的方法应该返回null', () => {
      const method = adapter.getPrefixedMethod('nonExistentMethod123');
      expect(method).toBeNull();
    });
  });

  describe('浏览器信息检测', () => {
    it('应该获取浏览器信息', () => {
      const info = adapter.getBrowserInfo();
      
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('engine');
      expect(info).toHaveProperty('mobile');
      expect(info).toHaveProperty('os');
      
      expect(typeof info.name).toBe('string');
      expect(typeof info.version).toBe('string');
      expect(typeof info.engine).toBe('string');
      expect(typeof info.mobile).toBe('boolean');
      expect(typeof info.os).toBe('string');
    });

    it('应该缓存浏览器信息', () => {
      const info1 = adapter.getBrowserInfo();
      const info2 = adapter.getBrowserInfo();
      
      expect(info1).toBe(info2); // 应该是同一个对象引用
    });
  });

  describe('事件监听器兼容性', () => {
    it('应该添加事件监听器', () => {
      const element = document.createElement('div');
      const handler = jest.fn();
      
      const removeListener = adapter.addEventListenerCompat(element, 'click', handler);
      
      expect(typeof removeListener).toBe('function');
      
      // 触发事件
      const event = new Event('click');
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
      
      // 移除监听器
      removeListener();
    });

    it('应该支持事件选项', () => {
      const element = document.createElement('div');
      const handler = jest.fn();
      
      const removeListener = adapter.addEventListenerCompat(
        element, 
        'click', 
        handler, 
        { once: true }
      );
      
      // 触发事件两次
      element.dispatchEvent(new Event('click'));
      element.dispatchEvent(new Event('click'));
      
      // 由于设置了once: true，应该只被调用一次
      expect(handler).toHaveBeenCalledTimes(1);
      
      removeListener();
    });
  });

  describe('缓存机制', () => {
    it('应该缓存检测结果', () => {
      const feature = 'testFeature123';
      
      // 第一次检测
      const result1 = adapter.detectFeature(feature);
      
      // 第二次检测应该从缓存获取
      const result2 = adapter.detectFeature(feature);
      
      expect(result1.timestamp).toBe(result2.timestamp);
    });

    it('应该能够清除缓存', () => {
      adapter.detectFeature('testFeature');
      
      const statsBefore = adapter.getCacheStats();
      expect(statsBefore.size).toBeGreaterThan(0);
      
      adapter.clearCache();
      
      const statsAfter = adapter.getCacheStats();
      expect(statsAfter.size).toBe(0);
    });

    it('应该提供缓存统计信息', () => {
      const stats = adapter.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('maxSize');
      
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.maxSize).toBe('number');
    });
  });

  describe('错误处理', () => {
    it('应该优雅地处理检测错误', () => {
      // 使用可能导致错误的检测方法
      const result = adapter.detectFeature('', 'custom', null);
      
      expect(result.supported).toBe(false);
      expect(result.method).toBe('custom');
    });

    it('应该处理无效的目标对象', () => {
      const result = adapter.detectFeature('test', 'method', null);
      
      expect(result.supported).toBe(false);
    });
  });
});

describe('便捷函数', () => {
  afterEach(() => {
    // 清理默认适配器
    const adapter = getBrowserAdapter();
    adapter.clearCache();
  });

  describe('getBrowserAdapter', () => {
    it('应该返回单例适配器', () => {
      const adapter1 = getBrowserAdapter();
      const adapter2 = getBrowserAdapter();
      
      expect(adapter1).toBe(adapter2);
    });

    it('应该使用配置创建适配器', () => {
      const config: BrowserAdapterConfig = { debug: true };
      const adapter = getBrowserAdapter(config);
      
      expect(adapter).toBeInstanceOf(BrowserAdapter);
    });
  });

  describe('isFeatureSupported', () => {
    it('应该检测特性支持', () => {
      expect(typeof isFeatureSupported('document')).toBe('boolean');
      expect(isFeatureSupported('document')).toBe(true);
    });
  });

  describe('getPrefixedProperty', () => {
    it('应该获取前缀属性', () => {
      const prop = getPrefixedProperty('document');
      expect(prop).toBe('document');
    });
  });

  describe('getPrefixedMethod', () => {
    it('应该获取前缀方法', () => {
      const method = getPrefixedMethod('querySelector', document);
      expect(typeof method).toBe('function');
    });
  });

  describe('getPrefixedCSSProperty', () => {
    it('应该获取前缀CSS属性', () => {
      const prop = getPrefixedCSSProperty('display');
      expect(prop).toBe('display');
    });
  });

  describe('getBrowserInfo', () => {
    it('应该获取浏览器信息', () => {
      const info = getBrowserInfo();
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('version');
    });
  });

  describe('addEventListenerCompat', () => {
    it('应该添加兼容的事件监听器', () => {
      const element = document.createElement('div');
      const handler = jest.fn();
      
      const removeListener = addEventListenerCompat(element, 'click', handler);
      
      element.dispatchEvent(new Event('click'));
      expect(handler).toHaveBeenCalled();
      
      removeListener();
    });
  });
});

describe('FeatureDetection预设', () => {
  it('应该提供常用特征检测', () => {
    // 测试一些基本的特征检测
    expect(typeof FeatureDetection.canvas).toBe('boolean');
    expect(typeof FeatureDetection.localStorage).toBe('boolean');
    expect(typeof FeatureDetection.flexbox).toBe('boolean');
  });

  it('应该检测CSS特性', () => {
    expect(typeof FeatureDetection.transforms).toBe('boolean');
    expect(typeof FeatureDetection.transitions).toBe('boolean');
    expect(typeof FeatureDetection.animations).toBe('boolean');
  });

  it('应该检测JavaScript API', () => {
    expect(typeof FeatureDetection.promises).toBe('boolean');
    expect(typeof FeatureDetection.fetch).toBe('boolean');
  });

  it('应该检测HTML5特性', () => {
    expect(typeof FeatureDetection.video).toBe('boolean');
    expect(typeof FeatureDetection.audio).toBe('boolean');
    expect(typeof FeatureDetection.canvas).toBe('boolean');
  });
});

describe('集成测试', () => {
  it('应该能够检测真实的浏览器特性', () => {
    const adapter = new BrowserAdapter();
    
    // 测试一些在现代浏览器中应该支持的特性
    expect(adapter.isSupported('JSON')).toBe(true);
    expect(adapter.isSupported('Array')).toBe(true);
    expect(adapter.isSupported('Object')).toBe(true);
    
    // 测试CSS特性
    expect(adapter.getPrefixedCSSProperty('display')).toBe('display');
    expect(adapter.getPrefixedCSSProperty('position')).toBe('position');
    
    adapter.destroy();
  });

  it('应该能够处理复杂的检测场景', () => {
    const adapter = new BrowserAdapter({
      enableCache: true,
      debug: false
    });
    
    // 批量检测多个特性
    const features = [
      'document',
      'window',
      'navigator',
      'localStorage',
      'sessionStorage',
      'JSON',
      'Array',
      'Object'
    ];
    
    const results = features.map(feature => ({
      feature,
      supported: adapter.isSupported(feature)
    }));
    
    // 大部分基础特性应该被支持
    const supportedCount = results.filter(r => r.supported).length;
    expect(supportedCount).toBeGreaterThan(features.length / 2);
    
    adapter.destroy();
  });
});