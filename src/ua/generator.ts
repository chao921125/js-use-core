/**
 * UA 生成器
 */

import type { UAGenerateSpec } from './types';

/**
 * 生成 UA 字符串
 */
export function generateUA(spec: UAGenerateSpec): string {
  const {
    browser = { name: 'Chrome', version: '120.0.0.0', major: 120 },
    engine = { name: 'Blink', version: '120.0.0.0' },
    os = { name: 'Windows', version: '10' },
    device = { type: 'desktop' },
    cpu = { architecture: 'amd64' }
  } = spec;

  // 构建基础 UA 模板
  let ua = '';
  
  // Mozilla 前缀（几乎所有现代浏览器都有）
  ua += 'Mozilla/5.0 ';
  
  // 系统信息部分
  if (os.name === 'Windows') {
    const ntVersion = os.version === '11' ? '10.0' : os.version === '10' ? '10.0' : '6.1';
    const arch = cpu.architecture === 'amd64' ? 'Win64; x64' : 'Win32';
    ua += `(Windows NT ${ntVersion}; ${arch}) `;
  } else if (os.name === 'macOS') {
    const macVersion = os.version?.replace(/\./g, '_') || '10_15_7';
    ua += `(Macintosh; Intel Mac OS X ${macVersion}) `;
  } else if (os.name === 'Linux') {
    const arch = cpu.architecture === 'amd64' ? 'x86_64' : cpu.architecture;
    ua += `(X11; Linux ${arch}) `;
  } else if (os.name === 'iOS') {
    const iosVersion = os.version?.replace(/\./g, '_') || '17_0';
    if (device.type === 'mobile') {
      ua += `(iPhone; CPU iPhone OS ${iosVersion} like Mac OS X) `;
    } else {
      ua += `(iPad; CPU OS ${iosVersion} like Mac OS X) `;
    }
  } else if (os.name === 'Android') {
    const androidVersion = os.version || '14';
    if (device.type === 'mobile') {
      ua += `(Linux; Android ${androidVersion}; ${device.model || 'SM-G991B'}) `;
    } else {
      ua += `(Linux; Android ${androidVersion}; ${device.model || 'SM-T870'}) `;
    }
  }
  
  // WebKit 版本（大多数浏览器都包含）
  ua += 'AppleWebKit/537.36 (KHTML, like Gecko) ';
  
  // 浏览器信息
  if (browser.name === 'Chrome') {
    ua += `Chrome/${browser.version || '120.0.0.0'} `;
    ua += 'Safari/537.36';
  } else if (browser.name === 'Edge') {
    ua += `Chrome/${browser.version || '120.0.0.0'} `;
    ua += 'Safari/537.36 ';
    ua += `Edg/${browser.version || '120.0.0.0'}`;
  } else if (browser.name === 'Firefox') {
    // Firefox 有不同的 UA 格式
    ua = ua.replace('AppleWebKit/537.36 (KHTML, like Gecko) ', '');
    ua += `Gecko/20100101 Firefox/${browser.version || '120.0'}`;
  } else if (browser.name === 'Safari') {
    ua += `Version/${browser.version || '17.0'} Safari/537.36`;
  } else if (browser.name === 'Opera') {
    ua += `Chrome/${browser.version || '120.0.0.0'} `;
    ua += 'Safari/537.36 ';
    ua += `OPR/${browser.version || '106.0.0.0'}`;
  } else if (browser.name === 'Samsung') {
    ua += `Chrome/${browser.version || '120.0.0.0'} `;
    ua += 'Mobile Safari/537.36 ';
    ua += `SamsungBrowser/${browser.version || '23.0'}`;
  }
  
  return ua.trim();
}

/**
 * 预定义的常用 UA 模板
 */
export const UATemplates = {
  // Chrome Windows
  chromeWindows: (): string => generateUA({
    browser: { name: 'Chrome', version: '120.0.0.0' },
    os: { name: 'Windows', version: '10' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Chrome macOS
  chromeMac: (): string => generateUA({
    browser: { name: 'Chrome', version: '120.0.0.0' },
    os: { name: 'macOS', version: '10.15.7' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Safari iOS
  safariIOS: (): string => generateUA({
    browser: { name: 'Safari', version: '17.0' },
    os: { name: 'iOS', version: '17.0' },
    device: { type: 'mobile', vendor: 'Apple', model: 'iPhone' }
  }),
  
  // Chrome Android
  chromeAndroid: (): string => generateUA({
    browser: { name: 'Chrome', version: '120.0.0.0' },
    os: { name: 'Android', version: '14' },
    device: { type: 'mobile', vendor: 'Samsung', model: 'SM-G991B' }
  }),
  
  // Edge Windows
  edgeWindows: (): string => generateUA({
    browser: { name: 'Edge', version: '120.0.0.0' },
    os: { name: 'Windows', version: '11' },
    cpu: { architecture: 'amd64' }
  }),
  
  // Firefox Linux
  firefoxLinux: (): string => generateUA({
    browser: { name: 'Firefox', version: '120.0' },
    os: { name: 'Linux', version: '' },
    cpu: { architecture: 'amd64' }
  })
};