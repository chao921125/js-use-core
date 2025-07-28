/**
 * UA 解析器
 */

import type {
  ParsedUA,
  BrowserInfo,
  EngineInfo,
  OSInfo,
  UADeviceInfo,
  CPUInfo,
} from "./types";

/**
 * 解析版本号 - 改进版本
 */
function parseVersion(versionStr: string): {
  major: number;
  minor: number;
  patch: number;
  version: string;
} {
  if (!versionStr || typeof versionStr !== 'string') {
    return { major: NaN, minor: NaN, patch: NaN, version: "" };
  }

  try {
    // 清理版本字符串，移除多余信息
    let cleanVersion = versionStr
      .replace(/\s*\(.*?\)\s*/g, "") // 移除括号内容
      .replace(/[^\d.]/g, "") // 只保留数字和点
      .trim();

    // 处理连续的点
    cleanVersion = cleanVersion.replace(/\.+/g, '.');
    
    // 移除开头和结尾的点
    cleanVersion = cleanVersion.replace(/^\.+|\.+$/g, '');

    if (!cleanVersion) {
      return { major: NaN, minor: NaN, patch: NaN, version: "" };
    }

    const parts = cleanVersion.split(".");

    const major = parts[0] ? parseInt(parts[0], 10) : NaN;
    const minor = parts[1] ? parseInt(parts[1], 10) : NaN;
    const patch = parts[2] ? parseInt(parts[2], 10) : NaN;

    // 验证解析结果
    if (isNaN(major) && process.env.NODE_ENV !== "production") {
      console.warn(`Failed to parse version: ${versionStr} -> ${cleanVersion}`);
    }

    return { 
      major: isNaN(major) ? NaN : major, 
      minor: isNaN(minor) ? NaN : minor, 
      patch: isNaN(patch) ? NaN : patch, 
      version: cleanVersion 
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error parsing version: ${versionStr}`, error);
    }
    return { major: NaN, minor: NaN, patch: NaN, version: "" };
  }
}

/**
 * 解析浏览器信息 - 改进版本
 */
function parseBrowser(ua: string): BrowserInfo {
  if (!ua || typeof ua !== 'string') {
    return {
      name: "Unknown",
      version: "",
      major: NaN,
      minor: NaN,
      patch: NaN,
    };
  }

  try {
    // Edge (基于 Chromium) - 需要在 Chrome 之前检测
    if (/Edg\/|EdgA\/|EdgDev\/|EdgiOS\//.test(ua)) {
      let match = ua.match(/Edg\/([\d.]+)/);
      let channel: BrowserInfo["channel"] = "stable";

      if (/EdgA\//.test(ua)) {
        match = ua.match(/EdgA\/([\d.]+)/);
        channel = "beta";
      } else if (/EdgDev\//.test(ua)) {
        match = ua.match(/EdgDev\/([\d.]+)/);
        channel = "dev";
      } else if (/EdgiOS\//.test(ua)) {
        match = ua.match(/EdgiOS\/([\d.]+)/);
      }

      const versionInfo = parseVersion(match?.[1] || "");

      return {
        name: "Edge",
        channel,
        ...versionInfo,
      };
    }

    // Samsung Internet (需要在 Chrome 之前检测)
    if (/SamsungBrowser\//.test(ua)) {
      const match = ua.match(/SamsungBrowser\/([\d.]+)/);
      const versionInfo = parseVersion(match?.[1] || "");

      return {
        name: "Samsung",
        ...versionInfo,
      };
    }

    // Opera (需要在 Chrome 之前检测，因为新版 Opera 也包含 Chrome)
    if (/OPR\/|Opera\//.test(ua)) {
      let match = ua.match(/OPR\/([\d.]+)/);
      if (!match) {
        match = ua.match(/Opera\/([\d.]+)/);
      }
      const versionInfo = parseVersion(match?.[1] || "");

      return {
        name: "Opera",
        ...versionInfo,
      };
    }

    // Chrome 及其衍生版本
    if (/Chrome\//.test(ua) && !/Edg\/|EdgA\/|EdgDev\/|OPR\/|SamsungBrowser\//.test(ua)) {
      const match = ua.match(/Chrome\/([\d.]+)/);
      const versionInfo = parseVersion(match?.[1] || "");
      let channel: BrowserInfo["channel"] = "stable";

      // 检测 Chrome 渠道
      if (/Chrome\/.*?beta/i.test(ua)) channel = "beta";
      else if (/Chrome\/.*?dev/i.test(ua)) channel = "dev";
      else if (/Chrome\/.*?canary/i.test(ua)) channel = "canary";

      return {
        name: "Chrome",
        channel,
        ...versionInfo,
      };
    }

    // Firefox
    if (/Firefox\//.test(ua)) {
      const match = ua.match(/Firefox\/([\d.]+)/);
      const versionInfo = parseVersion(match?.[1] || "");
      let channel: BrowserInfo["channel"] = "stable";

      // 检测 Firefox 渠道
      if (/Firefox\/.*?beta/i.test(ua)) channel = "beta";
      else if (/Firefox\/.*?nightly/i.test(ua)) channel = "nightly";
      else if (/Firefox\/.*?esr/i.test(ua)) channel = "esr" as any;

      return {
        name: "Firefox",
        channel,
        ...versionInfo,
      };
    }

    // Safari (需要在 Chrome 检测之后，因为 Chrome 也包含 Safari)
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
      const match = ua.match(/Version\/([\d.]+).*?Safari/);
      const versionInfo = parseVersion(match?.[1] || "");

      return {
        name: "Safari",
        ...versionInfo,
      };
    }

    // Internet Explorer
    if (/MSIE|Trident\//.test(ua)) {
      let match = ua.match(/MSIE ([\d.]+)/);
      if (!match) {
        match = ua.match(/rv:([\d.]+).*?Trident/);
      }
      const versionInfo = parseVersion(match?.[1] || "");

      return {
        name: "IE",
        ...versionInfo,
      };
    }

    // QQ 浏览器
    if (/QQBrowser\//.test(ua)) {
      const match = ua.match(/QQBrowser\/([\d.]+)/);
      const versionInfo = parseVersion(match?.[1] || "");

      return {
        name: "QQ",
        ...versionInfo,
      };
    }

    // UC 浏览器
    if (/UCBrowser\//.test(ua)) {
      const match = ua.match(/UCBrowser\/([\d.]+)/);
      const versionInfo = parseVersion(match?.[1] || "");

      return {
        name: "UC",
        ...versionInfo,
      };
    }

    // 360 浏览器
    if (/360SE|360EE/.test(ua)) {
      return {
        name: "360",
        version: "",
        major: NaN,
        minor: NaN,
        patch: NaN,
      };
    }

    // 搜狗浏览器
    if (/SE\s[\d.X]+|SogouMobileBrowser/.test(ua)) {
      const match = ua.match(/SE\s([\d.X]+)|SogouMobileBrowser\/([\d.]+)/);
      const versionInfo = parseVersion(match?.[1] || match?.[2] || "");

      return {
        name: "Sogou",
        ...versionInfo,
      };
    }

    return {
      name: "Unknown",
      version: "",
      major: NaN,
      minor: NaN,
      patch: NaN,
    };

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error parsing browser from UA: ${ua}`, error);
    }
    return {
      name: "Unknown",
      version: "",
      major: NaN,
      minor: NaN,
      patch: NaN,
    };
  }
}

/**
 * 解析引擎信息
 */
function parseEngine(ua: string): EngineInfo {
  if (!ua) {
    return {
      name: "Unknown",
      version: "",
    };
  }

  // Blink (Chrome, Edge, Opera)
  if (/Chrome\//.test(ua) || /Edg\/|EdgA\/|EdgDev\//.test(ua) || /OPR\//.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    return {
      name: "Blink",
      version: match?.[1] || "",
    };
  }

  // WebKit (Safari)
  if (/WebKit\//.test(ua) && !/Chrome\//.test(ua)) {
    const match = ua.match(/WebKit\/([\d.]+)/);
    return {
      name: "WebKit",
      version: match?.[1] || "",
    };
  }

  // Gecko (Firefox)
  if (/Gecko\//.test(ua) && /Firefox\//.test(ua)) {
    const match = ua.match(/rv:([\d.]+)/);
    return {
      name: "Gecko",
      version: match?.[1] || "",
    };
  }

  // Trident (IE)
  if (/Trident\//.test(ua)) {
    const match = ua.match(/Trident\/([\d.]+)/);
    return {
      name: "Trident",
      version: match?.[1] || "",
    };
  }

  // Presto (Old Opera)
  if (/Presto\//.test(ua)) {
    const match = ua.match(/Presto\/([\d.]+)/);
    return {
      name: "Presto",
      version: match?.[1] || "",
    };
  }

  return {
    name: "Unknown",
    version: "",
  };
}

/**
 * 解析操作系统信息 - 改进版本
 */
function parseOS(ua: string): OSInfo {
  if (!ua || typeof ua !== 'string') {
    return {
      name: "Unknown",
      version: "",
    };
  }

  try {
    // iOS (iPhone, iPad, iPod)
    if (/iPhone|iPad|iPod/.test(ua)) {
      const match = ua.match(/OS ([\d_]+)/);
      const version = match?.[1]?.replace(/_/g, ".") || "";
      return {
        name: "iOS",
        version,
      };
    }

    // HarmonyOS (需要在 Android 之前检测)
    if (/HarmonyOS/.test(ua)) {
      const match = ua.match(/HarmonyOS ([\d.]+)/);
      return {
        name: "HarmonyOS",
        version: match?.[1] || "",
      };
    }

    // Android
    if (/Android/.test(ua)) {
      const match = ua.match(/Android ([\d.]+)/);
      return {
        name: "Android",
        version: match?.[1] || "",
      };
    }

    // Windows
    if (/Windows/.test(ua)) {
      let version = "";
      
      if (/Windows NT 10\.0/.test(ua)) {
        // 检查是否为 Windows 11 (通过构建号判断)
        if (/Windows NT 10\.0.*?(?:22000|22621|22631|23000)/.test(ua)) {
          version = "11";
        } else {
          version = "10";
        }
      } else if (/Windows NT 6\.3/.test(ua)) {
        version = "8.1";
      } else if (/Windows NT 6\.2/.test(ua)) {
        version = "8";
      } else if (/Windows NT 6\.1/.test(ua)) {
        version = "7";
      } else if (/Windows NT 6\.0/.test(ua)) {
        version = "Vista";
      } else if (/Windows NT 5\.2/.test(ua)) {
        version = "XP";
      } else if (/Windows NT 5\.1/.test(ua)) {
        version = "XP";
      } else if (/Windows NT 5\.0/.test(ua)) {
        version = "2000";
      } else {
        const match = ua.match(/Windows NT ([\d.]+)/);
        version = match?.[1] || "";
      }

      return {
        name: "Windows",
        version,
      };
    }

    // macOS
    if (/Mac OS X|macOS/.test(ua)) {
      const match = ua.match(/Mac OS X ([\d_]+)/);
      let version = match?.[1]?.replace(/_/g, ".") || "";
      
      // 处理 macOS 版本名称映射
      if (version.startsWith("10.16") || version.startsWith("11.")) {
        // macOS Big Sur 及以后
        const majorMatch = version.match(/^(\d+)/);
        if (majorMatch && parseInt(majorMatch[1]) >= 11) {
          // 保持原版本号
        } else if (version.startsWith("10.16")) {
          version = "11.0"; // 10.16 实际上是 Big Sur 11.0
        }
      }

      return {
        name: "macOS",
        version,
      };
    }

    // Linux (需要在 Android 之后检测)
    if (/Linux/.test(ua) && !/Android/.test(ua) && !/HarmonyOS/.test(ua)) {
      // 尝试检测具体的 Linux 发行版
      if (/Ubuntu/.test(ua)) {
        const match = ua.match(/Ubuntu\/([\d.]+)/);
        return {
          name: "Ubuntu",
          version: match?.[1] || "",
        };
      }
      
      if (/CentOS/.test(ua)) {
        return {
          name: "CentOS",
          version: "",
        };
      }

      return {
        name: "Linux",
        version: "",
      };
    }

    // Chrome OS
    if (/CrOS/.test(ua)) {
      const match = ua.match(/CrOS [\w]+ ([\d.]+)/);
      return {
        name: "Chrome OS",
        version: match?.[1] || "",
      };
    }

    // FreeBSD
    if (/FreeBSD/.test(ua)) {
      const match = ua.match(/FreeBSD ([\d.]+)/);
      return {
        name: "FreeBSD",
        version: match?.[1] || "",
      };
    }

    return {
      name: "Unknown",
      version: "",
    };

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error parsing OS from UA: ${ua}`, error);
    }
    return {
      name: "Unknown",
      version: "",
    };
  }
}

/**
 * 解析设备信息 - 改进版本
 */
function parseDevice(ua: string): UADeviceInfo {
  if (!ua || typeof ua !== 'string') {
    return {
      type: "desktop",
    };
  }

  try {
    // TV 设备
    if (/TV|SmartTV|SMART-TV|GoogleTV|AppleTV|Roku|WebOS|Tizen.*TV/.test(ua)) {
      let vendor = "";
      let model = "";

      if (/AppleTV/.test(ua)) {
        vendor = "Apple";
        model = "Apple TV";
      } else if (/GoogleTV/.test(ua)) {
        vendor = "Google";
        model = "Google TV";
      } else if (/WebOS/.test(ua)) {
        vendor = "LG";
        model = "WebOS TV";
      } else if (/Tizen.*TV/.test(ua)) {
        vendor = "Samsung";
        model = "Tizen TV";
      }

      return {
        type: "tv",
        vendor: vendor || undefined,
        model: model || undefined,
      };
    }

    // 可穿戴设备
    if (/Watch|wearable|WearOS/i.test(ua)) {
      let vendor = "";
      let model = "";

      if (/Apple.*Watch/.test(ua)) {
        vendor = "Apple";
        model = "Apple Watch";
      } else if (/WearOS/.test(ua)) {
        vendor = "Google";
        model = "Wear OS";
      }

      return {
        type: "wearable",
        vendor: vendor || undefined,
        model: model || undefined,
      };
    }

    // 平板设备
    if (/iPad/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua) && !/TV/.test(ua))) {
      let vendor = "";
      let model = "";

      if (/iPad/.test(ua)) {
        vendor = "Apple";
        model = "iPad";
        
        // 尝试识别具体的 iPad 型号
        if (/iPad.*Pro/.test(ua)) {
          model = "iPad Pro";
        } else if (/iPad.*Air/.test(ua)) {
          model = "iPad Air";
        } else if (/iPad.*Mini/.test(ua)) {
          model = "iPad Mini";
        }
      } else if (/SM-T/.test(ua)) {
        vendor = "Samsung";
        const match = ua.match(/SM-T[\w]+/);
        model = match?.[0] || "";
      } else if (/Pixel.*Tablet/.test(ua)) {
        vendor = "Google";
        model = "Pixel Tablet";
      }

      return {
        type: "tablet",
        vendor: vendor || undefined,
        model: model || undefined,
      };
    }

    // 移动设备
    if (/Mobile|iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera.*Mini/.test(ua)) {
      let vendor = "";
      let model = "";

      if (/iPhone/.test(ua)) {
        vendor = "Apple";
        model = "iPhone";
        
        // 尝试识别具体的 iPhone 型号
        const iphoneMatch = ua.match(/iPhone(\d+,\d+)/);
        if (iphoneMatch) {
          model = `iPhone ${iphoneMatch[1]}`;
        }
      } else if (/iPod/.test(ua)) {
        vendor = "Apple";
        model = "iPod";
      } else if (/SM-/.test(ua)) {
        vendor = "Samsung";
        const match = ua.match(/SM-[\w]+/);
        model = match?.[0] || "";
      } else if (/Pixel/.test(ua)) {
        vendor = "Google";
        const match = ua.match(/Pixel( \d+)?( Pro| XL)?/);
        model = match?.[0] || "Pixel";
      } else if (/MI\s/.test(ua) || /Redmi/.test(ua)) {
        vendor = "Xiaomi";
        const match = ua.match(/(MI \w+|Redmi \w+)/);
        model = match?.[0] || "";
      } else if (/HUAWEI|Honor/.test(ua)) {
        vendor = "Huawei";
        const match = ua.match(/(HUAWEI [\w-]+|Honor [\w-]+)/);
        model = match?.[0] || "";
      } else if (/OPPO/.test(ua)) {
        vendor = "OPPO";
        const match = ua.match(/OPPO ([\w-]+)/);
        model = match?.[1] || "";
      } else if (/vivo/.test(ua)) {
        vendor = "Vivo";
        const match = ua.match(/vivo ([\w-]+)/);
        model = match?.[1] || "";
      } else if (/OnePlus/.test(ua)) {
        vendor = "OnePlus";
        const match = ua.match(/OnePlus ([\w-]+)/);
        model = match?.[1] || "";
      }

      return {
        type: "mobile",
        vendor: vendor || undefined,
        model: model || undefined,
      };
    }

    // 桌面设备 (默认)
    return {
      type: "desktop",
    };

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error parsing device from UA: ${ua}`, error);
    }
    return {
      type: "desktop",
    };
  }
}

/**
 * 解析 CPU 架构
 */
function parseCPU(ua: string): CPUInfo {
  if (/WOW64|Win64|x64|amd64|x86_64/.test(ua)) {
    return { architecture: "amd64" };
  }

  if (/arm64|aarch64/.test(ua)) {
    return { architecture: "arm64" };
  }

  if (/arm/.test(ua)) {
    return { architecture: "arm" };
  }

  if (/loongarch64/.test(ua)) {
    return { architecture: "loongarch64" };
  }

  if (/riscv64/.test(ua)) {
    return { architecture: "riscv64" };
  }

  if (/i386|i686|x86/.test(ua)) {
    return { architecture: "ia32" };
  }

  return { architecture: "unknown" };
}

/**
 * 检测是否为爬虫 - 改进版本
 */
function isBot(ua: string): boolean {
  if (!ua || typeof ua !== 'string') {
    return false;
  }

  const botPatterns = [
    // 搜索引擎爬虫
    /googlebot/i,
    /bingbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /sogou.*spider/i,
    /360spider/i,
    /duckduckbot/i,
    /msnbot/i,
    /yahoo.*slurp/i,
    /applebot/i,
    
    // 社交媒体爬虫
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i,
    /slackbot/i,
    /discordbot/i,
    /skypebot/i,
    
    // 其他爬虫
    /crawler/i,
    /spider/i,
    /scraper/i,
    /fetcher/i,
    /monitor/i,
    /checker/i,
    /validator/i,
    
    // 通用 bot 标识
    /bot[\s\/]/i,
    /\sbot$/i,
    /^bot/i,
    
    // 特定服务
    /curl/i,
    /wget/i,
    /python-requests/i,
    /java\//i,
    /go-http-client/i,
    /okhttp/i,
    /axios/i,
    /node-fetch/i,
    
    // 监控服务
    /pingdom/i,
    /uptimerobot/i,
    /statuscake/i,
    /newrelic/i,
    /datadog/i,
  ];

  try {
    return botPatterns.some((pattern) => pattern.test(ua));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error detecting bot from UA: ${ua}`, error);
    }
    return false;
  }
}

/**
 * 检测是否为 WebView - 改进版本
 */
function isWebView(ua: string): boolean {
  if (!ua || typeof ua !== 'string') {
    return false;
  }

  try {
    // 中国常见应用 WebView
    if (/MicroMessenger/i.test(ua)) return true; // 微信
    if (/QQ\//i.test(ua)) return true; // QQ
    if (/Weibo/i.test(ua)) return true; // 微博
    if (/DingTalk/i.test(ua)) return true; // 钉钉
    if (/AlipayClient/i.test(ua)) return true; // 支付宝
    if (/Lark/i.test(ua)) return true; // 飞书
    if (/ByteDance/i.test(ua)) return true; // 字节跳动系应用
    if (/TikTok/i.test(ua)) return true; // TikTok
    if (/Douyin/i.test(ua)) return true; // 抖音
    if (/Taobao/i.test(ua)) return true; // 淘宝
    if (/Tmall/i.test(ua)) return true; // 天猫
    if (/JD/i.test(ua)) return true; // 京东
    if (/Meituan/i.test(ua)) return true; // 美团
    if (/Eleme/i.test(ua)) return true; // 饿了么

    // 国际应用 WebView
    if (/Instagram/i.test(ua)) return true; // Instagram
    if (/Facebook/i.test(ua)) return true; // Facebook
    if (/Twitter/i.test(ua)) return true; // Twitter
    if (/LinkedIn/i.test(ua)) return true; // LinkedIn
    if (/Pinterest/i.test(ua)) return true; // Pinterest
    if (/Snapchat/i.test(ua)) return true; // Snapchat
    if (/WhatsApp/i.test(ua)) return true; // WhatsApp
    if (/Telegram/i.test(ua)) return true; // Telegram
    if (/Line/i.test(ua)) return true; // Line

    // 开发框架 WebView
    if (/Electron/i.test(ua)) return true; // Electron
    if (/Tauri/i.test(ua)) return true; // Tauri
    if (/Cordova/i.test(ua)) return true; // Cordova
    if (/Capacitor/i.test(ua)) return true; // Capacitor
    if (/ReactNative/i.test(ua)) return true; // React Native
    if (/Flutter/i.test(ua)) return true; // Flutter
    if (/Xamarin/i.test(ua)) return true; // Xamarin
    if (/Ionic/i.test(ua)) return true; // Ionic

    // 通用 WebView 标识
    if (/wv\)|WebView/i.test(ua)) return true;
    if (/Version\/[\d.]+.*Mobile.*Safari/i.test(ua) && /wv/i.test(ua)) return true;

    // Android WebView 特征
    if (/Android.*Version\/[\d.]+.*Chrome\/[\d.]+.*Mobile.*Safari/i.test(ua) && !/Chrome\/[\d.]+\.0\.0\.0/i.test(ua)) {
      return true;
    }

    return false;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error detecting WebView from UA: ${ua}`, error);
    }
    return false;
  }
}

/**
 * 检测是否为 Headless 浏览器 - 改进版本
 */
function isHeadless(ua: string): boolean {
  if (!ua || typeof ua !== 'string') {
    return false;
  }

  try {
    // Chrome Headless
    if (/HeadlessChrome/i.test(ua)) return true;
    
    // PhantomJS
    if (/PhantomJS/i.test(ua)) return true;
    
    // Puppeteer
    if (/Puppeteer/i.test(ua)) return true;
    
    // Playwright
    if (/Playwright/i.test(ua)) return true;
    
    // Selenium
    if (/Selenium/i.test(ua)) return true;
    
    // Chrome 无头模式的其他标识
    if (/Chrome.*--headless/i.test(ua)) return true;
    
    // Firefox 无头模式
    if (/Firefox.*Headless/i.test(ua)) return true;
    
    // 其他无头浏览器
    if (/SlimerJS/i.test(ua)) return true;
    if (/HtmlUnit/i.test(ua)) return true;
    if (/Zombie/i.test(ua)) return true;
    
    return false;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error detecting headless browser from UA: ${ua}`, error);
    }
    return false;
  }
}

/**
 * 解析 UA 字符串 - 改进版本
 */
export function parseUA(ua: string = ""): ParsedUA {
  // 默认返回值
  const defaultResult: ParsedUA = {
    browser: {
      name: "Unknown",
      version: "",
      major: NaN,
      minor: NaN,
      patch: NaN,
    },
    engine: { name: "Unknown", version: "" },
    os: { name: "Unknown", version: "" },
    device: { type: "desktop" },
    cpu: { architecture: "unknown" },
    isBot: false,
    isWebView: false,
    isHeadless: false,
    source: ua || "",
  };

  if (!ua || typeof ua !== "string") {
    return defaultResult;
  }

  try {
    // 预处理 UA 字符串
    const cleanUA = ua.trim();
    if (!cleanUA) {
      return defaultResult;
    }

    // 解析各个组件
    const browser = parseBrowser(cleanUA);
    const engine = parseEngine(cleanUA);
    const os = parseOS(cleanUA);
    const device = parseDevice(cleanUA);
    const cpu = parseCPU(cleanUA);
    const botDetection = isBot(cleanUA);
    const webViewDetection = isWebView(cleanUA);
    const headlessDetection = isHeadless(cleanUA);

    return {
      browser,
      engine,
      os,
      device,
      cpu,
      isBot: botDetection,
      isWebView: webViewDetection,
      isHeadless: headlessDetection,
      source: ua,
    };

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Error parsing UA: ${ua}`, error);
    }
    return {
      ...defaultResult,
      source: ua,
    };
  }
}
