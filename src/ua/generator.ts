/**
 * UA 生成器 - 重构版本
 */

import type { UAGenerateSpec } from './types';

/**
 * UA 组件构建器接口
 */
interface UABuilder {
  buildSystemInfo(): string;
  buildWebKitInfo(): string;
  buildBrowserInfo(): string;
}

/**
 * 默认版本映射
 */
const DEFAULT_VERSIONS = {
  chrome: '120.0.0.0',
  firefox: '120.0',
  safari: '17.0',
  edge: '120.0.0.0',
  opera: '106.0.0.0',
  samsung: '23.0',
  webkit: '537.36',
  gecko: '20100101'
};

/**
 * Windows UA 构建器
 */
class WindowsUABuilder implements UABuilder {
  constructor(private spec: Required<UAGenerateSpec>) {}

  buildSystemInfo(): string {
    const { os, cpu } = this.spec;
    let ntVersion = '10.0';
    
    // Windows 版本映射
    switch (os.version) {
      case '11':
        ntVersion = '10.0'; // Windows 11 仍使用 NT 10.0
        break;
      case '10':
        ntVersion = '10.0';
        break;
      case '8.1':
        ntVersion = '6.3';
        break;
      case '8':
        ntVersion = '6.2';
        break;
      case '7':
        ntVersion = '6.1';
        break;
      default:
        ntVersion = '10.0';
    }

    const arch = cpu.architecture === 'amd64' ? 'Win64; x64' : 
                 cpu.architecture === 'arm64' ? 'ARM64' : 'Win32';
    
    return `(Windows NT ${ntVersion}; ${arch})`;
  }

  buildWebKitInfo(): string {
    return 'AppleWebKit/537.36 (KHTML, like Gecko)';
  }

  buildBrowserInfo(): string {
    const { browser } = this.spec;
    const version = browser.version || DEFAULT_VERSIONS.chrome;

    switch (browser.name?.toLowerCase()) {
      case 'chrome':
        return `Chrome/${version} Safari/537.36`;
      case 'edge':
        return `Chrome/${version} Safari/537.36 Edg/${version}`;
      case 'firefox':
        return `Gecko/20100101 Firefox/${version}`;
      case 'opera':
        return `Chrome/${version} Safari/537.36 OPR/${version}`;
      default:
        return `Chrome/${version} Safari/537.36`;
    }
  }
}

/**
 * macOS UA 构建器
 */
class MacOSUABuilder implements UABuilder {
  constructor(private spec: Required<UAGenerateSpec>) {}

  buildSystemInfo(): string {
    const { os, cpu } = this.spec;
    const macVersion = os.version?.replace(/\./g, '_') || '10_15_7';
    const arch = cpu.architecture === 'arm64' ? 'ARM64' : 'Intel';
    
    return `(Macintosh; ${arch} Mac OS X ${macVersion})`;
  }

  buildWebKitInfo(): string {
    return 'AppleWebKit/537.36 (KHTML, like Gecko)';
  }

  buildBrowserInfo(): string {
    const { browser } = this.spec;
    const version = browser.version || DEFAULT_VERSIONS.chrome;

    switch (browser.name?.toLowerCase()) {
      case 'chrome':
        return `Chrome/${version} Safari/537.36`;
      case 'edge':
        return `Chrome/${version} Safari/537.36 Edg/${version}`;
      case 'firefox':
        return `Gecko/20100101 Firefox/${version}`;
      case 'safari':
        return `Version/${version} Safari/605.1.15`;
      case 'opera':
        return `Chrome/${version} Safari/537.36 OPR/${version}`;
      default:
        return `Chrome/${version} Safari/537.36`;
    }
  }
}

/**
 * Linux UA 构建器
 */
class LinuxUABuilder implements UABuilder {
  constructor(private spec: Required<UAGenerateSpec>) {}

  buildSystemInfo(): string {
    const { cpu } = this.spec;
    const arch = cpu.architecture === 'amd64' ? 'x86_64' : 
                 cpu.architecture === 'arm64' ? 'aarch64' : 
                 cpu.architecture || 'x86_64';
    
    return `(X11; Linux ${arch})`;
  }

  buildWebKitInfo(): string {
    return 'AppleWebKit/537.36 (KHTML, like Gecko)';
  }

  buildBrowserInfo(): string {
    const { browser } = this.spec;
    const version = browser.version || DEFAULT_VERSIONS.chrome;

    switch (browser.name?.toLowerCase()) {
      case 'chrome':
        return `Chrome/${version} Safari/537.36`;
      case 'firefox':
        return `Gecko/20100101 Firefox/${version}`;
      case 'opera':
        return `Chrome/${version} Safari/537.36 OPR/${version}`;
      default:
        return `Chrome/${version} Safari/537.36`;
    }
  }
}

/**
 * iOS UA 构建器
 */
class IOSUABuilder implements UABuilder {
  constructor(private spec: Required<UAGenerateSpec>) {}

  buildSystemInfo(): string {
    const { os, device } = this.spec;
    const iosVersion = os.version?.replace(/\./g, '_') || '17_0';
    
    if (device.type === 'tablet') {
      return `(iPad; CPU OS ${iosVersion} like Mac OS X)`;
    } else {
      return `(iPhone; CPU iPhone OS ${iosVersion} like Mac OS X)`;
    }
  }

  buildWebKitInfo(): string {
    return 'AppleWebKit/605.1.15 (KHTML, like Gecko)';
  }

  buildBrowserInfo(): string {
    const { browser } = this.spec;
    const version = browser.version || DEFAULT_VERSIONS.safari;
    
    return `Version/${version} Mobile/15E148 Safari/604.1`;
  }
}

/**
 * Android UA 构建器
 */
class AndroidUABuilder implements UABuilder {
  constructor(private spec: Required<UAGenerateSpec>) {}

  buildSystemInfo(): string {
    const { os, device } = this.spec;
    const androidVersion = os.version || '14';
    const model = device.model || (device.type === 'tablet' ? 'SM-T870' : 'SM-G991B');
    
    return `(Linux; Android ${androidVersion}; ${model})`;
  }

  buildWebKitInfo(): string {
    return 'AppleWebKit/537.36 (KHTML, like Gecko)';
  }

  buildBrowserInfo(): string {
    const { browser, device } = this.spec;
    const version = browser.version || DEFAULT_VERSIONS.chrome;
    const mobile = device.type === 'mobile' ? 'Mobile ' : '';

    switch (browser.name?.toLowerCase()) {
      case 'chrome':
        return `Chrome/${version} ${mobile}Safari/537.36`;
      case 'samsung':
        return `Chrome/${version} ${mobile}Safari/537.36 SamsungBrowser/${browser.version || DEFAULT_VERSIONS.samsung}`;
      default:
        return `Chrome/${version} ${mobile}Safari/537.36`;
    }
  }
}

/**
 * 获取 UA 构建器
 * @param spec UA 生成规格
 * @returns UA 构建器实例
 */
function getUABuilder(spec: Required<UAGenerateSpec>): UABuilder {
  switch (spec.os.name?.toLowerCase()) {
    case 'windows':
      return new WindowsUABuilder(spec);
    case 'macos':
      return new MacOSUABuilder(spec);
    case 'linux':
      return new LinuxUABuilder(spec);
    case 'ios':
      return new IOSUABuilder(spec);
    case 'android':
      return new AndroidUABuilder(spec);
    default:
      return new WindowsUABuilder(spec);
  }
}

/**
 * 填充默认值
 * @param spec 用户提供的规格
 * @returns 完整的规格
 */
function fillDefaults(spec: UAGenerateSpec): Required<UAGenerateSpec> {
  return {
    browser: {
      name: 'Chrome',
      version: DEFAULT_VERSIONS.chrome,
      major: 120,
      minor: 0,
      patch: 0,
      ...spec.browser
    },
    engine: {
      name: 'Blink',
      version: DEFAULT_VERSIONS.webkit,
      ...spec.engine
    },
    os: {
      name: 'Windows',
      version: '10',
      ...spec.os
    },
    device: {
      type: 'desktop',
      ...spec.device
    },
    cpu: {
      architecture: 'amd64',
      ...spec.cpu
    }
  };
}

/**
 * 生成 UA 字符串 - 改进版本
 * @param spec UA 生成规格
 * @returns 生成的 UA 字符串
 */
export function generateUA(spec: UAGenerateSpec): string {
  try {
    const fullSpec = fillDefaults(spec);
    const builder = getUABuilder(fullSpec);

    // 构建 UA 字符串
    const parts = [
      'Mozilla/5.0',
      builder.buildSystemInfo(),
      builder.buildWebKitInfo(),
      builder.buildBrowserInfo()
    ];

    return parts.join(' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Error generating UA:', error);
    }
    // 返回默认的 Chrome UA
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }
}

/**
 * 检测 UA 是否可能是伪造的
 * @param ua UA 字符串
 * @returns 伪造检测结果
 */
export function detectFakeUA(ua: string): {
  isFake: boolean;
  confidence: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let suspiciousScore = 0;

  try {
    if (!ua || typeof ua !== 'string') {
      return { isFake: false, confidence: 0, reasons: [] };
    }

    // 检查常见的伪造特征
    
    // 1. 版本号不匹配
    if (/Chrome\/(\d+)/.test(ua) && /Safari\/(\d+)/.test(ua)) {
      const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
      const safariMatch = ua.match(/Safari\/([\d.]+)/);
      
      if (chromeMatch && safariMatch) {
        const chromeVersion = parseInt(chromeMatch[1]);
        const safariVersion = parseFloat(safariMatch[1]);
        
        // Chrome 和 Safari 版本应该有合理的对应关系
        if (chromeVersion > 100 && safariVersion < 500) {
          reasons.push('Chrome and Safari version mismatch');
          suspiciousScore += 30;
        }
      }
    }

    // 2. 操作系统和浏览器不匹配
    if (/iPhone|iPad/.test(ua) && !/Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua)) {
      reasons.push('iOS device without Safari-based browser');
      suspiciousScore += 40;
    }

    // 3. 不合理的版本组合
    if (/Windows NT 5\.1/.test(ua) && /Chrome\/1[0-9]{2}/.test(ua)) {
      reasons.push('Modern Chrome on Windows XP');
      suspiciousScore += 50;
    }

    // 4. 缺少必要组件
    if (/Chrome\//.test(ua) && !/AppleWebKit/.test(ua)) {
      reasons.push('Chrome without WebKit');
      suspiciousScore += 40;
    }

    // 5. 重复或矛盾的信息
    const browserMatches = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/g);
    if (browserMatches && browserMatches.length > 3) {
      reasons.push('Too many browser identifiers');
      suspiciousScore += 20;
    }

    // 6. 不常见的格式
    if (!/Mozilla\/5\.0/.test(ua)) {
      reasons.push('Missing or unusual Mozilla prefix');
      suspiciousScore += 10;
    }

    // 7. 过于简单或过于复杂
    if (ua.length < 50) {
      reasons.push('UA string too short');
      suspiciousScore += 20;
    } else if (ua.length > 500) {
      reasons.push('UA string too long');
      suspiciousScore += 10;
    }

    const confidence = Math.min(suspiciousScore, 100);
    const isFake = confidence > 50;

    return { isFake, confidence, reasons };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Error detecting fake UA:', error);
    }
    return { isFake: false, confidence: 0, reasons: [] };
  }
}

/**
 * 生成随机 UA 字符串
 * @param options 生成选项
 * @returns 随机 UA 字符串
 */
export function generateRandomUA(options: {
  browsers?: string[];
  os?: string[];
  devices?: string[];
} = {}): string {
  const {
    browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'],
    os = ['Windows', 'macOS', 'Linux'],
    devices = ['desktop']
  } = options;

  const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
  const randomOS = os[Math.floor(Math.random() * os.length)];
  const randomDevice = devices[Math.floor(Math.random() * devices.length)];

  // 生成随机版本号
  const majorVersion = Math.floor(Math.random() * 50) + 80; // 80-130
  const minorVersion = Math.floor(Math.random() * 10);
  const patchVersion = Math.floor(Math.random() * 100);

  const spec: UAGenerateSpec = {
    browser: {
      name: randomBrowser,
      version: `${majorVersion}.${minorVersion}.${patchVersion}.0`,
      major: majorVersion
    },
    os: {
      name: randomOS,
      version: randomOS === 'Windows' ? '10' : randomOS === 'macOS' ? '10.15.7' : ''
    },
    device: {
      type: randomDevice as any
    }
  };

  return generateUA(spec);
}

/**
 * 预定义的常用 UA 模板 - 改进版本
 */
export const UATemplates = {
  // Chrome Windows
  chromeWindows: (version = '120.0.0.0'): string => generateUA({
    browser: { name: 'Chrome', version },
    os: { name: 'Windows', version: '10' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Chrome macOS
  chromeMac: (version = '120.0.0.0'): string => generateUA({
    browser: { name: 'Chrome', version },
    os: { name: 'macOS', version: '10.15.7' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Chrome macOS ARM64
  chromeMacARM: (version = '120.0.0.0'): string => generateUA({
    browser: { name: 'Chrome', version },
    os: { name: 'macOS', version: '12.0.0' },
    cpu: { architecture: 'arm64' }
  }),
  
  // Safari iOS
  safariIOS: (version = '17.0'): string => generateUA({
    browser: { name: 'Safari', version },
    os: { name: 'iOS', version: '17.0' },
    device: { type: 'mobile', vendor: 'Apple', model: 'iPhone' }
  }),
  
  // Safari iPad
  safariIPad: (version = '17.0'): string => generateUA({
    browser: { name: 'Safari', version },
    os: { name: 'iOS', version: '17.0' },
    device: { type: 'tablet', vendor: 'Apple', model: 'iPad' }
  }),
  
  // Chrome Android
  chromeAndroid: (version = '120.0.0.0'): string => generateUA({
    browser: { name: 'Chrome', version },
    os: { name: 'Android', version: '14' },
    device: { type: 'mobile', vendor: 'Samsung', model: 'SM-G991B' }
  }),
  
  // Samsung Internet
  samsungInternet: (version = '23.0'): string => generateUA({
    browser: { name: 'Samsung', version },
    os: { name: 'Android', version: '14' },
    device: { type: 'mobile', vendor: 'Samsung', model: 'SM-G991B' }
  }),
  
  // Edge Windows
  edgeWindows: (version = '120.0.0.0'): string => generateUA({
    browser: { name: 'Edge', version },
    os: { name: 'Windows', version: '11' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Edge macOS
  edgeMac: (version = '120.0.0.0'): string => generateUA({
    browser: { name: 'Edge', version },
    os: { name: 'macOS', version: '10.15.7' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Firefox Windows
  firefoxWindows: (version = '120.0'): string => generateUA({
    browser: { name: 'Firefox', version },
    os: { name: 'Windows', version: '10' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Firefox macOS
  firefoxMac: (version = '120.0'): string => generateUA({
    browser: { name: 'Firefox', version },
    os: { name: 'macOS', version: '10.15.7' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Firefox Linux
  firefoxLinux: (version = '120.0'): string => generateUA({
    browser: { name: 'Firefox', version },
    os: { name: 'Linux', version: '' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Safari macOS
  safariMac: (version = '17.0'): string => generateUA({
    browser: { name: 'Safari', version },
    os: { name: 'macOS', version: '10.15.7' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Opera Windows
  operaWindows: (version = '106.0.0.0'): string => generateUA({
    browser: { name: 'Opera', version },
    os: { name: 'Windows', version: '10' },
    cpu: { architecture: 'amd64' }
  }),

  // 获取所有模板名称
  getTemplateNames: (): string[] => {
    return Object.keys(UATemplates).filter(key => key !== 'getTemplateNames');
  },

  // 获取随机模板
  getRandom: (): string => {
    const templates = UATemplates.getTemplateNames();
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    return (UATemplates as any)[randomTemplate]();
  }
};