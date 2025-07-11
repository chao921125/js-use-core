/**
 * 字体加载检查器
 * 用于检测字体是否已加载到浏览器中，以及动态管理字体
 */

export interface FontCheckResult {
  name: string;
  loaded: boolean;
  status: string;
}

export interface FontLoadResult {
  success: boolean;
  allFonts: FontCheckResult[];  // 所有检查的字体列表
  failedFonts?: FontCheckResult[];
}

export interface FontOptions {
  timeout?: number;
}

// 扩展 FontFaceSet 接口以匹配最新的 Web API
interface ExtendedFontFaceSet {
  add: (font: FontFace) => void;
  delete: (font: FontFace) => boolean;
  clear: () => void;
  check: (font: string) => boolean;
  load: (font: string, text?: string) => Promise<FontFace[]>;
  ready: Promise<FontFaceSet>;
  forEach: (callbackfn: (value: FontFace) => void) => void;
}

class Font {
  private options: FontOptions;
  private addedFonts: Set<FontFace> = new Set();

  constructor(options: FontOptions = {}) {
    this.options = {
      timeout: 3000,
      ...options
    };
  }

  /**
   * 动态添加字体
   * @param fontName 字体名称
   * @param url 字体文件URL地址
   * @param options 可选的FontFace配置选项
   * @returns 布尔值，表示是否添加成功
   */
  addFont(fontName: string, url: string, options?: FontFaceDescriptors): boolean {
    try {
      if (!document.fonts) {
        console.error('当前环境不支持 CSS Font Loading API');
        return false;
      }
      
      if (typeof FontFace !== 'function') {
        console.error('当前环境不支持 FontFace API');
        return false;
      }
      
      // 检查是否可能存在跨域问题
      const isCrossDomain = this.isCrossDomainUrl(url);
      if (isCrossDomain) {
        console.warn(`警告: 尝试加载可能存在跨域问题的字体: ${url}`);
        console.warn('请确保目标服务器已设置正确的CORS头部: Access-Control-Allow-Origin');
      }
      
      // 创建FontFace对象
      const fontFace = new FontFace(fontName, `url(${url})`, options);
      
      // 添加到document.fonts
      (document.fonts as unknown as ExtendedFontFaceSet).add(fontFace);
      this.addedFonts.add(fontFace);
      
      // 尝试加载字体
      fontFace.load().then(() => {
        console.log(`字体 ${fontName} 加载成功`);
      }).catch(error => {
        // 分析错误，检测是否是跨域问题
        if (this.isCORSError(error) || (error instanceof Error && error.toString().includes('NetworkError'))) {
          console.error(`字体 ${fontName} 加载失败: 跨域资源共享(CORS)错误`);
          console.error('请确保字体服务器设置了正确的CORS头部: Access-Control-Allow-Origin');
        } else {
          console.warn(`字体 ${fontName} 加载失败:`, error);
        }
      });
      
      return true;
    } catch (error) {
      console.error('添加字体失败:', error);
      return false;
    }
  }

  /**
   * 检查URL是否可能存在跨域问题
   * @param url 要检查的URL
   * @returns 是否可能存在跨域问题
   */
  private isCrossDomainUrl(url: string): boolean {
    if (!url) return false;
    // 如果是相对路径，则不存在跨域问题
    if (url.startsWith('/') && !url.startsWith('//')) {
      return false;
    }
    
    try {
      // 如果是绝对路径，检查域名是否不同
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        const urlObj = new URL(url.startsWith('//') ? `https:${url}` : url);
        const currentLocation = window.location;
        
        // 比较域名和端口
        return urlObj.hostname !== currentLocation.hostname || 
               urlObj.port !== currentLocation.port || 
               urlObj.protocol !== currentLocation.protocol;
      }
      
      return false;
    } catch (e) {
      // 如果URL解析错误，保守起见返回true
      return true;
    }
  }

  /**
   * 检查错误是否是CORS相关错误
   * @param error 错误对象
   * @returns 是否是CORS错误
   */
  private isCORSError(error: any): boolean {
    if (!error) return false;
    
    // 将错误转换为字符串进行检查
    const errorString = error.toString().toLowerCase();
    
    // 检查常见的CORS错误标识
    return errorString.includes('cors') || 
           errorString.includes('cross-origin') || 
           errorString.includes('cross origin') ||
           errorString.includes('networkerror') ||
           errorString.includes('access-control-allow-origin');
  }

  /**
   * 动态添加字体（使用FontFace对象）
   * @param font FontFace 对象
   * @returns 布尔值，表示是否添加成功
   */
  addFontFace(font: FontFace): boolean {
    try {
      if (!document.fonts) {
        console.error('当前环境不支持 CSS Font Loading API');
        return false;
      }
      
      (document.fonts as unknown as ExtendedFontFaceSet).add(font);
      this.addedFonts.add(font);
      return true;
    } catch (error) {
      console.error('添加字体失败:', error);
      return false;
    }
  }

  /**
   * 删除之前添加的字体
   * @param font FontFace对象或字体名称
   * @returns 布尔值，表示是否删除成功
   */
  deleteFont(font: FontFace | string): boolean {
    try {
      if (!document.fonts) {
        console.error('当前环境不支持 CSS Font Loading API');
        return false;
      }
      
      // 如果传入的是字体名称字符串
      if (typeof font === 'string') {
        // 查找匹配的字体
        const fontToDelete: FontFace[] = [];
        this.addedFonts.forEach(addedFont => {
          if (addedFont.family === font) {
            fontToDelete.push(addedFont);
          }
        });
        
        // 如果找到匹配的字体，删除它们
        if (fontToDelete.length > 0) {
          fontToDelete.forEach(f => {
            (document.fonts as unknown as ExtendedFontFaceSet).delete(f);
            this.addedFonts.delete(f);
          });
          return true;
        }
        
        // 如果没有找到匹配的字体
        console.warn(`未找到名为 "${font}" 的字体`);
        return false;
      }
      
      // 如果传入的是FontFace对象
      (document.fonts as unknown as ExtendedFontFaceSet).delete(font);
      this.addedFonts.delete(font);
      return true;
    } catch (error) {
      console.error('删除字体失败:', error);
      return false;
    }
  }

  /**
   * 清除所有动态添加的字体
   * @returns 布尔值，表示是否清除成功
   */
  clearFonts(): boolean {
    try {
      if (!document.fonts) {
        console.error('当前环境不支持 CSS Font Loading API');
        return false;
      }

      // 删除所有通过 addFont 添加的字体
      this.addedFonts.forEach(font => {
        (document.fonts as unknown as ExtendedFontFaceSet).delete(font);
      });
      
      this.addedFonts.clear();
      return true;
    } catch (error) {
      console.error('清除字体失败:', error);
      return false;
    }
  }

  /**
   * 检查字体是否已加载
   * @param fontNames 字体名称或字体名称数组，如果不提供则检查所有已加载字体
   * @returns 字体加载结果，如果全部加载成功返回 {success: true, allFonts: [...]}，
   * 否则返回 {success: false, allFonts: [...], failedFonts: 失败的字体列表}
   */
  async check(fontNames?: string | string[]): Promise<FontLoadResult> {
    let results: FontCheckResult[] = [];
    
    if (!fontNames) {
      results = await this.checkAllFonts();
    } else if (Array.isArray(fontNames)) {
      results = await Promise.all(fontNames.map(name => this.checkSingleFont(name)));
    } else {
      const result = await this.checkSingleFont(fontNames);
      results = [result];
    }
    
    const failedFonts = results.filter(font => !font.loaded);
    
    return {
      success: failedFonts.length === 0,
      allFonts: results,
      ...(failedFonts.length > 0 ? { failedFonts } : {})
    };
  }

  /**
   * 检查单个字体是否已加载
   * @param fontName 字体名称
   * @returns 字体加载状态结果
   */
  private async checkSingleFont(fontName: string): Promise<FontCheckResult> {
    // 系统默认字体列表（常见的安全字体）
    const systemFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier', 
      'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Tahoma', 
      'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS', 'sans-serif', 'serif', 'monospace'
    ];

    // 首先检查是否是系统默认字体，如果不是，需要更严格的检测
    const isSystemFont = systemFonts.some(font => 
      font.toLowerCase() === fontName.toLowerCase().replace(/['"]/g, '')
    );
    
    // 首先检查字体是否存在于已加载的字体列表中
    try {
      // 等待字体就绪
      await document.fonts.ready;
      
      // 检查字体是否已加载
      if (document.fonts && document.fonts.check(`12px '${fontName}'`)) {
        // 对于非系统字体，进行额外验证
        if (!isSystemFont) {
          // 检查是否在字体列表中
          let fontFound = false;
          document.fonts.forEach(font => {
            if (font.family.replace(/['"]/g, '').toLowerCase() === fontName.replace(/['"]/g, '').toLowerCase()) {
              fontFound = true;
            }
          });
          
          if (!fontFound) {
            // 进行字体比较测试，检测是否真的加载了该字体
            const isTrulyLoaded = await this.performFontDetectionTest(fontName);
            if (!isTrulyLoaded) {
              return {
                name: fontName,
                loaded: false,
                status: 'not-available'
              };
            }
          }
        }
        
        return {
          name: fontName,
          loaded: true,
          status: 'loaded'
        };
      }
      
      // 检查是否在字体列表中
      let fontFound = false;
      document.fonts.forEach(font => {
        if (font.family.replace(/['"]/g, '').toLowerCase() === fontName.replace(/['"]/g, '').toLowerCase()) {
          fontFound = true;
        }
      });
      
      if (fontFound) {
        return {
          name: fontName,
          loaded: true,
          status: 'loaded'
        };
      }
    } catch (e) {
      // 忽略错误，继续尝试其他方法
    }
    
    // 检查是否支持FontFace API
    if (typeof FontFace !== 'function') {
      const isLoaded = document.fonts.check(`12px '${fontName}'`);
      // 对于非系统字体，如果检测为已加载，进行额外验证
      if (isLoaded && !isSystemFont) {
        const isTrulyLoaded = await this.performFontDetectionTest(fontName);
        return {
          name: fontName,
          loaded: isTrulyLoaded,
          status: isTrulyLoaded ? 'loaded' : 'fallback-to-system'
        };
      }
      return {
        name: fontName,
        loaded: isLoaded,
        status: isLoaded ? 'loaded' : 'unloaded'
      };
    }

    try {
      // 使用FontFace API检查字体
      const fontFace = new FontFace(fontName, `local(${fontName})`);
      
      // 设置超时
      const timeoutPromise = new Promise<FontFace>((_, reject) => {
        setTimeout(() => reject(new Error('Font load timeout')), this.options.timeout);
      });
      
      // 加载字体或超时
      const loadedFont = await Promise.race([
        fontFace.load(),
        timeoutPromise
      ]).catch((_) => {
        // 如果加载失败，但字体已经在document.fonts中存在，则认为字体已加载
        if (document.fonts.check(`12px '${fontName}'`) && isSystemFont) {
          return { family: fontName, status: 'loaded' };
        }
        return null;
      });
      
      // 对于非系统字体，如果检测为已加载，进行额外验证
      if (loadedFont && !isSystemFont) {
        const isTrulyLoaded = await this.performFontDetectionTest(fontName);
        if (!isTrulyLoaded) {
          return {
            name: fontName,
            loaded: false,
            status: 'fallback-detected'
          };
        }
      }
      
      return {
        name: fontName,
        loaded: loadedFont !== null,
        status: loadedFont ? 'loaded' : 'error'
      };
    } catch (error) {
      // 回退到传统检测方法
      const isLoaded = document.fonts.check(`12px '${fontName}'`);
      
      // 对于非系统字体，如果检测为已加载，进行额外验证
      if (isLoaded && !isSystemFont) {
        const isTrulyLoaded = await this.performFontDetectionTest(fontName);
        return {
          name: fontName,
          loaded: isTrulyLoaded,
          status: isTrulyLoaded ? 'loaded' : 'fallback-to-system'
        };
      }
      
      return {
        name: fontName,
        loaded: isLoaded,
        status: isLoaded ? 'loaded' : 'fallback'
      };
    }
  }

  /**
   * 执行字体检测测试，通过比较渲染宽度来确定字体是否真正加载
   * @param fontName 要检测的字体名称
   * @returns 布尔值，表示字体是否真正加载
   */
  private async performFontDetectionTest(fontName: string): Promise<boolean> {
    // 检查是否在浏览器环境中
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return false;
    }
    
    try {
      // 创建一个临时的canvas元素
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return false;
      
      // 测试文本 - 使用一些特殊字符，不同字体渲染宽度会有明显差异
      const testString = 'mmmmmmmmmmlli';
      
      // 设置字体大小
      context.font = `16px sans-serif`;
      const fallbackWidth = context.measureText(testString).width;
      
      // 设置为测试字体
      context.font = `16px '${fontName}', sans-serif`;
      const testWidth = context.measureText(testString).width;
      
      // 如果宽度相差不大，可能是回退到了系统字体
      const widthDifference = Math.abs(testWidth - fallbackWidth);
      const percentDifference = (widthDifference / fallbackWidth) * 100;
      
      // 如果差异小于2%，可能是回退到了系统字体
      return percentDifference > 2;
    } catch (e) {
      // 如果出现错误（例如在测试环境中），则返回false
      return false;
    }
  }

  /**
   * 检查所有已加载的字体
   * @returns 所有已加载字体的状态
   */
  private async checkAllFonts(): Promise<FontCheckResult[]> {
    // 确保字体已加载
    await document.fonts.ready;
    
    const fontList: FontCheckResult[] = [];
    const fontSet = new Set<string>();
    
    // 收集所有字体
    document.fonts.forEach(font => {
      const fontFamily = font.family.replace(/['"]*/g, '');
      if (!fontSet.has(fontFamily)) {
        fontSet.add(fontFamily);
        fontList.push({
          name: fontFamily,
          loaded: true,
          status: 'loaded'
        });
      }
    });
    
    return fontList;
  }
}

export default Font;