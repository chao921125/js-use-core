/**
 * 设备检测模块测试
 */

import { 
  isMobile, 
  isTablet, 
  isDesktop, 
  getDeviceType,
  detectOS,
  detectBrowser,
  DeviceType,
  OSType,
  BrowserType
} from '../src/device';

describe('设备检测模块测试', () => {
  
  describe('基础设备检测', () => {
    test('isMobile 应该正确检测移动设备', () => {
      // 移动设备
      expect(isMobile({ 
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' 
      })).toBe(true);
      
      // Android 设备
      expect(isMobile({ 
        ua: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36' 
      })).toBe(true);
      
      // 桌面设备
      expect(isMobile({ 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      })).toBe(false);
    });

    test('isTablet 应该正确检测平板设备', () => {
      // iPad
      expect(isTablet({ 
        ua: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15' 
      })).toBe(true);
      
      // Android 平板
      expect(isTablet({ 
        ua: 'Mozilla/5.0 (Linux; Android 10; SM-T510) AppleWebKit/537.36' 
      })).toBe(true);
      
      // 桌面设备
      expect(isTablet({ 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      })).toBe(false);
    });

    test('isDesktop 应该正确检测桌面设备', () => {
      expect(isDesktop({ 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      })).toBe(true);
      
      expect(isDesktop({ 
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' 
      })).toBe(false);
    });

    test('getDeviceType 应该返回正确的设备类型', () => {
      expect(getDeviceType({ 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      })).toBe(DeviceType.DESKTOP);
      
      expect(getDeviceType({ 
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' 
      })).toBe(DeviceType.MOBILE);
      
      expect(getDeviceType({ 
        ua: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)' 
      })).toBe(DeviceType.TABLET);
    });
  });

  describe('操作系统和浏览器检测', () => {
    test('detectOS 应该正确检测操作系统', () => {
      expect(detectOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(OSType.WINDOWS);
      expect(detectOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(OSType.MACOS);
      expect(detectOS('Mozilla/5.0 (X11; Linux x86_64)')).toBe(OSType.LINUX);
      expect(detectOS('Mozilla/5.0 (Linux; Android 10; SM-G975F)')).toBe(OSType.ANDROID);
      expect(detectOS('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')).toBe(OSType.IOS);
      expect(detectOS('Unknown User Agent')).toBe(OSType.UNKNOWN);
    });

    test('detectBrowser 应该正确检测浏览器', () => {
      expect(detectBrowser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')).toBe(BrowserType.CHROME);
      expect(detectBrowser('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')).toBe(BrowserType.FIREFOX);
      expect(detectBrowser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15')).toBe(BrowserType.SAFARI);
      expect(detectBrowser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59')).toBe(BrowserType.EDGE);
    });
  });

});