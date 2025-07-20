/**
 * User Agent 解析模块测试
 */

import { 
  UA, 
  parseUserAgent, 
  getCurrentUA, 
  isCompatible,
  parseUA,
  generateUA,
  satisfies,
  isModern
} from '../src/ua';

describe('User Agent 解析模块测试', () => {
  
  describe('基础解析功能', () => {
    test('应该正确解析 Chrome 124 Win11 x64', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Chrome');
      expect(result.browser.major).toBe(124);
      expect(result.browser.version).toBe('124.0.0.0');
      expect(result.browser.channel).toBe('stable');
      expect(result.engine.name).toBe('Blink');
      expect(result.os.name).toBe('Windows');
      expect(result.os.version).toBe('10');
      expect(result.device.type).toBe('desktop');
      expect(result.cpu.architecture).toBe('amd64');
      expect(result.isBot).toBe(false);
      expect(result.isWebView).toBe(false);
      expect(result.isHeadless).toBe(false);
    });

    test('应该正确解析 iPhone 13 iOS 17 Safari', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Safari');
      expect(result.browser.version).toBe('17.0');
      expect(result.engine.name).toBe('WebKit');
      expect(result.os.name).toBe('iOS');
      expect(result.os.version).toBe('17.0');
      expect(result.device.type).toBe('mobile');
      expect(result.device.vendor).toBe('Apple');
      expect(result.device.model).toBe('iPhone');
    });

    test('应该正确解析微信 WebView Android 14', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.42.2340(0x28002A37) Process/tools WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Chrome');
      expect(result.os.name).toBe('Android');
      expect(result.os.version).toBe('14');
      expect(result.device.type).toBe('mobile');
      expect(result.isWebView).toBe(true);
      expect(result.cpu.architecture).toBe('arm64');
    });

    test('应该正确解析 Edge 123 Beta macOS', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 EdgA/123.0.2420.65';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Edge');
      expect(result.browser.major).toBe(123);
      expect(result.browser.channel).toBe('beta');
      expect(result.os.name).toBe('macOS');
      expect(result.os.version).toBe('10.15.7');
    });

    test('应该正确解析 Samsung Internet 23 Android', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Samsung');
      expect(result.browser.major).toBe(23);
      expect(result.os.name).toBe('Android');
      expect(result.device.type).toBe('mobile');
    });

    test('应该正确解析 HeadlessChrome 120', () => {
      const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Chrome');
      expect(result.isHeadless).toBe(true);
      expect(result.os.name).toBe('Linux');
      expect(result.cpu.architecture).toBe('amd64'); // x86_64 应该被识别为 amd64
    });

    test('应该正确解析 Googlebot 2.1', () => {
      const ua = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
      const result = parseUserAgent(ua);
      
      expect(result.isBot).toBe(true);
    });

    test('应该正确解析 Firefox 115 ESR Linux ARM64', () => {
      const ua = 'Mozilla/5.0 (X11; Linux aarch64; rv:115.0) Gecko/20100101 Firefox/115.0';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Firefox');
      expect(result.browser.major).toBe(115);
      expect(result.engine.name).toBe('Gecko');
      expect(result.os.name).toBe('Linux');
      expect(result.cpu.architecture).toBe('arm64');
    });

    test('应该正确解析 Electron 28.1.0', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Electron/28.1.0 Safari/537.36';
      const result = parseUserAgent(ua);
      
      expect(result.browser.name).toBe('Chrome');
      expect(result.isWebView).toBe(true);
    });

    test('应该处理非法 UA 字符串', () => {
      const result = parseUA(''); // 直接使用 parseUA 而不是 parseUserAgent
      
      expect(result.browser.name).toBe('Unknown');
      expect(result.engine.name).toBe('Unknown');
      expect(result.os.name).toBe('Unknown');
      expect(result.device.type).toBe('desktop');
      expect(result.cpu.architecture).toBe('unknown');
      expect(result.isBot).toBe(false);
      expect(result.isWebView).toBe(false);
      expect(result.isHeadless).toBe(false);
      expect(result.source).toBe('');
    });
  });

  describe('版本比较功能', () => {
    test('应该正确比较 Chrome 版本', () => {
      expect(satisfies('Chrome/124.0.0.0', 'Chrome >= 100')).toBe(true);
      expect(satisfies('Chrome/99.0.0.0', 'Chrome >= 100')).toBe(false);
      expect(satisfies('Chrome/124.0.0.0', 'Chrome === 124')).toBe(true);
      expect(satisfies('Chrome/124.0.0.0', 'Chrome < 125')).toBe(true);
    });

    test('应该正确比较 Firefox 版本', () => {
      expect(satisfies('Firefox/115.0', 'Firefox >= 100')).toBe(true);
      expect(satisfies('Firefox/115.0', 'Firefox === 115')).toBe(true);
      expect(satisfies('Firefox/115.0', 'Firefox !== 116')).toBe(true);
    });

    test('应该正确比较 Safari 版本', () => {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      expect(satisfies(safariUA, 'Safari >= 15')).toBe(true);
      
      const oldSafariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15';
      expect(satisfies(oldSafariUA, 'Safari < 15')).toBe(true);
    });

    test('应该处理不匹配的浏览器', () => {
      expect(satisfies('Chrome/124.0.0.0', 'Firefox >= 100')).toBe(false);
    });

    test('应该处理无效的版本范围', () => {
      expect(satisfies('Chrome/124.0.0.0', 'invalid range')).toBe(false);
    });
  });

  describe('现代浏览器检测', () => {
    test('应该正确识别现代 Chrome', () => {
      const parsed = parseUserAgent('Chrome/120.0.0.0');
      expect(isModern(parsed)).toBe(true);
      expect(isModern(parsed, { es2020: true })).toBe(true);
      expect(isModern(parsed, { webgl2: true })).toBe(true);
    });

    test('应该正确识别旧版浏览器', () => {
      const parsed = parseUserAgent('Chrome/50.0.0.0');
      expect(isModern(parsed)).toBe(false);
    });

    test('应该根据特性要求检测', () => {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15';
      const parsed = parseUserAgent(safariUA);
      
      // Safari 15 应该被认为是现代浏览器
      expect(parsed.browser.name).toBe('Safari');
      expect(parsed.browser.version).toBe('15.0');
      expect(isModern(parsed)).toBe(true);
      expect(isModern(parsed, { webgl2: true })).toBe(true); // Safari 15 支持 WebGL2
    });
  });

  describe('UA 生成功能', () => {
    test('应该生成 Chrome Windows UA', () => {
      const ua = generateUA({
        browser: { name: 'Chrome', version: '120.0.0.0' },
        os: { name: 'Windows', version: '11' },
        cpu: { architecture: 'amd64' }
      });
      
      expect(ua).toContain('Chrome/120.0.0.0');
      expect(ua).toContain('Windows NT 10.0');
      expect(ua).toContain('Win64; x64');
    });

    test('应该生成 Safari iOS UA', () => {
      const ua = generateUA({
        browser: { name: 'Safari', version: '17.0' },
        os: { name: 'iOS', version: '17.0' },
        device: { type: 'mobile' }
      });
      
      expect(ua).toContain('iPhone');
      expect(ua).toContain('OS 17_0');
      expect(ua).toContain('Version/17.0');
    });

    test('应该生成 Firefox Linux UA', () => {
      const ua = generateUA({
        browser: { name: 'Firefox', version: '120.0' },
        os: { name: 'Linux' },
        cpu: { architecture: 'amd64' }
      });
      
      expect(ua).toContain('Firefox/120.0');
      expect(ua).toContain('X11; Linux x86_64');
      expect(ua).toContain('Gecko/20100101');
    });
  });

  describe('缓存机制', () => {
    beforeEach(() => {
      UA.clearCache();
    });

    test('应该缓存解析结果', () => {
      const ua = 'Chrome/120.0.0.0';
      const result1 = UA.parse(ua);
      const result2 = UA.parse(ua);
      
      expect(result1).toBe(result2); // 同一个对象引用
      expect(UA.getCacheSize()).toBe(1);
    });

    test('应该返回不可变对象', () => {
      const result = UA.parse('Chrome/120.0.0.0');
      
      expect(() => {
        (result as any).browser.name = 'Firefox';
      }).toThrow();
    });

    test('应该正确清除缓存', () => {
      UA.parse('Chrome/120.0.0.0');
      expect(UA.getCacheSize()).toBe(1);
      
      UA.clearCache();
      expect(UA.getCacheSize()).toBe(0);
    });
  });

  describe('插件系统', () => {
    beforeEach(() => {
      UA.clearCache();
    });

    test('应该支持自定义插件', () => {
      const dingTalkPlugin = {
        test: (ua: string) => /DingTalk/i.test(ua),
        parse: (ua: string) => {
          const match = ua.match(/DingTalk\/([\d.]+)/);
          return {
            browser: {
              name: 'DingTalk',
              version: match?.[1] || '',
              major: parseInt(match?.[1] || '0') || NaN,
              minor: 0,
              patch: 0
            },
            isWebView: true
          };
        }
      };

      UA.use(dingTalkPlugin);
      
      const result = UA.parse('DingTalk/7.0.15');
      expect(result.browser.name).toBe('DingTalk');
      expect(result.browser.version).toBe('7.0.15');
      expect(result.browser.major).toBe(7);
      expect(result.isWebView).toBe(true);
    });
  });

  describe('便捷函数', () => {
    test('getCurrentUA 应该返回当前环境 UA', () => {
      const current = getCurrentUA();
      expect(current).toBeDefined();
      expect(current.browser).toBeDefined();
      expect(current.os).toBeDefined();
    });

    test('isCompatible 应该检查兼容性', () => {
      // 注意：在测试环境中可能没有 navigator.userAgent
      const result = isCompatible('Chrome >= 1', 'Chrome/120.0.0.0');
      expect(result).toBe(true);
    });
  });

  describe('边界情况处理', () => {
    test('应该处理 null 和 undefined', () => {
      expect(parseUA(null as any).browser.name).toBe('Unknown');
      expect(parseUA(undefined as any).browser.name).toBe('Unknown');
    });

    test('应该处理非字符串输入', () => {
      expect(parseUA(123 as any).browser.name).toBe('Unknown');
      expect(parseUA({} as any).browser.name).toBe('Unknown');
    });

    test('应该处理不规则版本号', () => {
      const result = parseUA('Chrome/124.0.6367.60 (Official Build) (64-bit)');
      expect(result.browser.name).toBe('Chrome');
      expect(result.browser.major).toBe(124);
    });

    test('应该处理缺失版本信息', () => {
      const result = parseUA('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/ Safari/537.36');
      expect(result.browser.name).toBe('Chrome');
      expect(isNaN(result.browser.major)).toBe(true);
    });
  });

});