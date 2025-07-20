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
 * 解析版本号
 */
function parseVersion(versionStr: string): {
  major: number;
  minor: number;
  patch: number;
  version: string;
} {
  if (!versionStr) {
    return { major: NaN, minor: NaN, patch: NaN, version: "" };
  }

  // 清理版本字符串，移除多余信息
  const cleanVersion = versionStr.replace(/\s*\(.*?\)\s*/g, "").trim();
  const parts = cleanVersion.split(".");

  const major = parseInt(parts[0]) || NaN;
  const minor = parseInt(parts[1]) || NaN;
  const patch = parseInt(parts[2]) || NaN;

  if (isNaN(major) && process.env.NODE_ENV !== "production") {
    console.warn(`Failed to parse version: ${versionStr}`);
  }

  return { major, minor, patch, version: cleanVersion };
}

/**
 * 解析浏览器信息
 */
function parseBrowser(ua: string): BrowserInfo {
  // Edge (基于 Chromium)
  if (/Edg\/|EdgA\/|EdgDev\//.test(ua)) {
    let match = ua.match(/Edg\/([\d.]+)/);
    let channel: BrowserInfo["channel"] = "stable";

    if (/EdgA\//.test(ua)) {
      match = ua.match(/EdgA\/([\d.]+)/);
      channel = "beta";
    } else if (/EdgDev\//.test(ua)) {
      match = ua.match(/EdgDev\/([\d.]+)/);
      channel = "dev";
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

  // Chrome
  if (/Chrome\//.test(ua) && !/Edg\/|EdgA\/|EdgDev\//.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    const versionInfo = parseVersion(match?.[1] || "");
    let channel: BrowserInfo["channel"] = "stable";

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

    if (/Firefox\/.*?beta/i.test(ua)) channel = "beta";
    else if (/Firefox\/.*?nightly/i.test(ua)) channel = "nightly";

    return {
      name: "Firefox",
      channel,
      ...versionInfo,
    };
  }

  // Safari
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    const match = ua.match(/Version\/([\d.]+).*?Safari/);
    const versionInfo = parseVersion(match?.[1] || "");

    return {
      name: "Safari",
      ...versionInfo,
    };
  }

  // Opera
  if (/OPR\//.test(ua) || /Opera\//.test(ua)) {
    const match = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
    const versionInfo = parseVersion(match?.[1] || "");

    return {
      name: "Opera",
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

  return {
    name: "Unknown",
    version: "",
    major: NaN,
    minor: NaN,
    patch: NaN,
  };
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
 * 解析操作系统信息
 */
function parseOS(ua: string): OSInfo {
  // iOS
  if (/iPhone|iPad|iPod/.test(ua)) {
    const match = ua.match(/OS ([\d_]+)/);
    const version = match?.[1]?.replace(/_/g, ".") || "";
    return {
      name: "iOS",
      version,
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

  // HarmonyOS
  if (/HarmonyOS/.test(ua)) {
    const match = ua.match(/HarmonyOS ([\d.]+)/);
    return {
      name: "HarmonyOS",
      version: match?.[1] || "",
    };
  }

  // Windows
  if (/Windows/.test(ua)) {
    let version = "";
    if (/Windows NT 10\.0/.test(ua)) {
      // 检查是否为 Windows 11
      if (/Windows NT 10\.0.*?(?:22000|22621|22631)/.test(ua)) {
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
    const version = match?.[1]?.replace(/_/g, ".") || "";
    return {
      name: "macOS",
      version,
    };
  }

  // Linux
  if (/Linux/.test(ua) && !/Android/.test(ua)) {
    return {
      name: "Linux",
      version: "",
    };
  }

  return {
    name: "Unknown",
    version: "",
  };
}

/**
 * 解析设备信息
 */
function parseDevice(ua: string): UADeviceInfo {
  // TV
  if (/TV|SmartTV|SMART-TV/.test(ua)) {
    return {
      type: "tv",
    };
  }

  // Wearable
  if (/Watch|wearable/i.test(ua)) {
    return {
      type: "wearable",
    };
  }

  // Tablet
  if (/iPad/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) {
    let vendor = "";
    let model = "";

    if (/iPad/.test(ua)) {
      vendor = "Apple";
      model = "iPad";
    } else if (/SM-T/.test(ua)) {
      vendor = "Samsung";
      const match = ua.match(/SM-T[\w]+/);
      model = match?.[0] || "";
    }

    return {
      type: "tablet",
      vendor: vendor || undefined,
      model: model || undefined,
    };
  }

  // Mobile
  if (/Mobile|iPhone|iPod|Android.*Mobile/.test(ua)) {
    let vendor = "";
    let model = "";

    if (/iPhone/.test(ua)) {
      vendor = "Apple";
      model = "iPhone";
    } else if (/iPod/.test(ua)) {
      vendor = "Apple";
      model = "iPod";
    } else if (/SM-/.test(ua)) {
      vendor = "Samsung";
      const match = ua.match(/SM-[\w]+/);
      model = match?.[0] || "";
    }

    return {
      type: "mobile",
      vendor: vendor || undefined,
      model: model || undefined,
    };
  }

  // Desktop (default)
  return {
    type: "desktop",
  };
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
 * 检测是否为爬虫
 */
function isBot(ua: string): boolean {
  const botPatterns = [
    /googlebot/i,
    /bingbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i,
    /slackbot/i,
    /discordbot/i,
    /applebot/i,
    /duckduckbot/i,
    /msnbot/i,
    /yahoo.*slurp/i,
    /crawler/i,
    /spider/i,
    /bot/i,
  ];

  return botPatterns.some((pattern) => pattern.test(ua));
}

/**
 * 检测是否为 WebView
 */
function isWebView(ua: string): boolean {
  // 微信
  if (/MicroMessenger/i.test(ua)) return true;

  // QQ
  if (/QQ\//i.test(ua)) return true;

  // 微博
  if (/Weibo/i.test(ua)) return true;

  // 钉钉
  if (/DingTalk/i.test(ua)) return true;

  // 支付宝
  if (/AlipayClient/i.test(ua)) return true;

  // 飞书
  if (/Lark/i.test(ua)) return true;

  // Electron
  if (/Electron/i.test(ua)) return true;

  // Tauri
  if (/Tauri/i.test(ua)) return true;

  // Cordova
  if (/Cordova/i.test(ua)) return true;

  // Capacitor
  if (/Capacitor/i.test(ua)) return true;

  // React Native WebView
  if (/ReactNative/i.test(ua)) return true;

  // 通用 WebView 标识
  if (/wv\)|WebView/i.test(ua)) return true;

  return false;
}

/**
 * 检测是否为 Headless 浏览器
 */
function isHeadless(ua: string): boolean {
  // HeadlessChrome
  if (/HeadlessChrome/i.test(ua)) return true;

  // PhantomJS
  if (/PhantomJS/i.test(ua)) return true;

  // Puppeteer
  if (/Puppeteer/i.test(ua)) return true;

  // Playwright
  if (/Playwright/i.test(ua)) return true;

  // Selenium
  if (/Selenium/i.test(ua)) return true;

  return false;
}

/**
 * 解析 UA 字符串
 */
export function parseUA(ua: string = ""): ParsedUA {
  if (!ua || typeof ua !== "string") {
    return {
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
      source: ua,
    };
  }

  return {
    browser: parseBrowser(ua),
    engine: parseEngine(ua),
    os: parseOS(ua),
    device: parseDevice(ua),
    cpu: parseCPU(ua),
    isBot: isBot(ua),
    isWebView: isWebView(ua),
    isHeadless: isHeadless(ua),
    source: ua,
  };
}
