/**
 * UA 相关类型定义
 */

/**
 * 浏览器信息
 */
export interface BrowserInfo {
  readonly name: 'Chrome' | 'Edge' | 'Firefox' | 'Safari' | 'Opera' | 'IE' | 'Samsung' | string;
  readonly version: string;        // 原始版本串 "124.0.6367.60"
  readonly major: number;          // 124
  readonly minor: number;
  readonly patch: number;
  readonly channel?: 'stable' | 'beta' | 'dev' | 'canary' | 'nightly';
}

/**
 * 引擎信息
 */
export interface EngineInfo {
  readonly name: 'Blink' | 'WebKit' | 'Gecko' | 'Trident' | 'Presto' | string;
  readonly version: string;
}

/**
 * 操作系统信息
 */
export interface OSInfo {
  readonly name: 'Windows' | 'macOS' | 'iOS' | 'Android' | 'Linux' | 'HarmonyOS' | string;
  readonly version: string;
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  readonly type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'wearable';
  readonly vendor?: string;
  readonly model?: string;
}

/**
 * CPU 信息
 */
export interface CPUInfo {
  readonly architecture: 'amd64' | 'arm64' | 'arm' | 'ia32' | 'loongarch64' | 'riscv64' | string;
}

/**
 * 解析后的 UA 信息
 */
export interface ParsedUA {
  readonly browser: BrowserInfo;
  readonly engine: EngineInfo;
  readonly os: OSInfo;
  readonly device: DeviceInfo;
  readonly cpu: CPUInfo;
  readonly isBot: boolean;
  readonly isWebView: boolean;
  readonly isHeadless: boolean;
  readonly source: string;   // 原始 UA
}

/**
 * UA 解析器插件接口
 */
export interface UAParserPlugin {
  test: (ua: string) => boolean;
  parse: (ua: string) => Partial<ParsedUA>;
}

/**
 * 现代浏览器检测选项
 */
export interface ModernBrowserOptions {
  es2020?: boolean;
  webgl2?: boolean;
  webassembly?: boolean;
  serviceWorker?: boolean;
}

/**
 * UA 生成规格
 */
export interface UAGenerateSpec {
  browser?: Partial<BrowserInfo>;
  engine?: Partial<EngineInfo>;
  os?: Partial<OSInfo>;
  device?: Partial<DeviceInfo>;
  cpu?: Partial<CPUInfo>;
}

/**
 * 版本比较操作符
 */
export type VersionOperator = '>=' | '>' | '<=' | '<' | '===' | '!==';

/**
 * 版本范围规则
 */
export interface VersionRange {
  browser: string;
  operator: VersionOperator;
  version: string;
}