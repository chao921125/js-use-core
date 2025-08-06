/**
 * 字体管理器
 * 用于检测字体是否已加载到浏览器中，以及动态管理字体
 */

import { BaseManager } from '../core/BaseManager';
import { BaseOptions } from '../types/core';
import { ErrorType } from '../types/errors';

export interface FontCheckResult {
  name: string;
  loaded: boolean;
  status: string;
  loadTime?: number;
  error?: string;
}

export interface FontLoadResult {
  success: boolean;
  allFonts: FontCheckResult[];  // 所有检查的字体列表
  failedFonts?: FontCheckResult[];
  totalLoadTime?: number;
}

export interface FontOptions extends BaseOptions {
  /** 字体检测超时时间（毫秒），默认3000ms */
  timeout?: number;
  /** 字体加载重试次数，默认2次 */
  retries?: number;
  /** 是否启用字体检测缓存，默认true */
  cache?: boolean;
  /** 批量检测时的并发数，默认5 */
  concurrency?: number;
  /** 字体检测精度阈值（百分比），默认2% */
  detectionThreshold?: number;
}

export interface FontLoadState {
  family: string;
  status: 'loading' | 'loaded' | 'error' | 'timeout';
  startTime: number;
  endTime?: number;
  error?: Error;
  retryCount: number;
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

class FontManager extends BaseManager<FontOptions> {
  private addedFonts: Set<FontFace> = new Set();
  private loadingStates: Map<string, FontLoadState> = new Map();
  private systemFonts: Set<string> = new Set([
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier', 
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Tahoma', 
    'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS', 'sans-serif', 'serif', 'monospace'
  ]);

  constructor(options: FontOptions = {}) {
    super(options, 'FontManager');
  }

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<FontOptions> {
    return {
      debug: false,
      timeout: 3000,
      retries: 2,
      cache: true,
      cacheTTL: 300000, // 5分钟
      concurrency: 5,
      detectionThreshold: 2
    };
  }

  /**
   * 初始化字体管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 检查浏览器支持
      if (typeof document === 'undefined') {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'FontManager requires browser environment',
          { context: { method: 'initialize' } }
        );
      }

      if (!document.fonts) {
        this.logger.warn('CSS Font Loading API not supported, falling back to basic detection');
      }

      // 等待现有字体加载完成
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      this.initialized = true;
      this.emit('initialized');
      this.logger.info('FontManager initialized successfully');
    } catch (error) {
      const processedError = this.handleError(error as Error, 'initialize');
      throw processedError;
    }
  }

  /**
   * 销毁字体管理器
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      // 清理所有添加的字体
      this.clearFonts();
      
      // 清理加载状态
      this.loadingStates.clear();
      
      // 调用基类销毁方法
      this.baseDestroy();
      
      this.logger.info('FontManager destroyed successfully');
    } catch (error) {
      this.handleError(error as Error, 'destroy');
    }
  }

  /**
   * 动态添加字体
   * @param fontName 字体名称
   * @param url 字体文件URL地址
   * @param options 可选的FontFace配置选项
   * @returns 布尔值，表示是否添加成功
   */
  async addFont(fontName: string, url: string, options?: FontFaceDescriptors): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      // 验证输入参数
      if (!this.validateInput(fontName, { type: 'string', required: true })) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Font name must be a non-empty string',
          { context: { method: 'addFont', input: { fontName, url } } }
        );
      }

      if (!this.validateInput(url, { type: 'string', required: true })) {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Font URL must be a non-empty string',
          { context: { method: 'addFont', input: { fontName, url } } }
        );
      }

      // 检查浏览器支持
      if (!document.fonts) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'CSS Font Loading API not supported in current environment',
          { context: { method: 'addFont' } }
        );
      }
      
      if (typeof FontFace !== 'function') {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'FontFace API not supported in current environment',
          { context: { method: 'addFont' } }
        );
      }
      
      // 检查是否可能存在跨域问题
      const isCrossDomain = this.isCrossDomainUrl(url);
      if (isCrossDomain) {
        this.logger.warn(`Loading potentially cross-origin font: ${url}`, {
          fontName,
          url,
          suggestion: 'Ensure target server has proper CORS headers: Access-Control-Allow-Origin'
        });
        this.emit('crossOriginWarning', { fontName, url });
      }
      
      // 创建FontFace对象
      const fontFace = new FontFace(fontName, `url(${url})`, options);
      
      // 初始化加载状态
      const loadState: FontLoadState = {
        family: fontName,
        status: 'loading',
        startTime: Date.now(),
        retryCount: 0
      };
      this.loadingStates.set(fontName, loadState);
      
      // 添加到document.fonts
      (document.fonts as unknown as ExtendedFontFaceSet).add(fontFace);
      this.addedFonts.add(fontFace);
      
      // 触发字体添加事件
      this.emit('fontAdded', { fontName, url, fontFace });
      
      // 异步加载字体并处理结果
      this.loadFontWithRetry(fontFace, fontName, url);
      
      return true;
    }, 'addFont').catch((error) => {
      this.logger.error(`Failed to add font ${fontName}`, { error: error.message, url });
      return false;
    });
  }

  /**
   * 带重试机制的字体加载
   * @param fontFace FontFace对象
   * @param fontName 字体名称
   * @param url 字体URL
   */
  private async loadFontWithRetry(fontFace: FontFace, fontName: string, url: string): Promise<void> {
    const loadState = this.loadingStates.get(fontName);
    if (!loadState) return;

    try {
      await fontFace.load();
      
      // 更新加载状态
      loadState.status = 'loaded';
      loadState.endTime = Date.now();
      
      this.logger.info(`Font ${fontName} loaded successfully`, {
        loadTime: loadState.endTime - loadState.startTime
      });
      
      this.emit('fontLoaded', { fontName, url, loadTime: loadState.endTime - loadState.startTime });
    } catch (error) {
      loadState.error = error as Error;
      
      // 检查是否需要重试
      if (loadState.retryCount < this.options.retries) {
        loadState.retryCount++;
        loadState.status = 'loading';
        
        this.logger.warn(`Font ${fontName} load failed, retrying (${loadState.retryCount}/${this.options.retries})`, {
          error: (error as Error).message
        });
        
        // 延迟重试
        setTimeout(() => {
          this.loadFontWithRetry(fontFace, fontName, url);
        }, 1000 * loadState.retryCount);
        
        return;
      }
      
      // 重试次数用完，标记为失败
      loadState.status = 'error';
      loadState.endTime = Date.now();
      
      // 分析错误类型
      const isCORSError = this.isCORSError(error) || 
        (error instanceof Error && error.toString().includes('NetworkError'));
      
      if (isCORSError) {
        this.logger.error(`Font ${fontName} load failed: CORS error`, {
          url,
          suggestion: 'Ensure font server has proper CORS headers: Access-Control-Allow-Origin'
        });
        
        this.emit('fontLoadError', { 
          fontName, 
          url, 
          error: error as Error, 
          type: 'cors',
          suggestion: 'Check CORS headers on font server'
        });
      } else {
        this.logger.error(`Font ${fontName} load failed`, {
          error: (error as Error).message,
          url
        });
        
        this.emit('fontLoadError', { 
          fontName, 
          url, 
          error: error as Error, 
          type: 'unknown'
        });
      }
    }
  }



  /**
   * 检查字体是否已加载
   * @param fontNames 字体名称或字体名称数组，如果不提供则检查所有已加载字体
   * @returns 字体加载结果，如果全部加载成功返回 {success: true, allFonts: [...]}，
   * 否则返回 {success: false, allFonts: [...], failedFonts: 失败的字体列表}
   */
  async check(fontNames?: string | string[]): Promise<FontLoadResult> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    return this.safeExecute(async () => {
      const startTime = Date.now();
      let results: FontCheckResult[] = [];
      
      if (!fontNames) {
        results = await this.checkAllFonts();
      } else if (Array.isArray(fontNames)) {
        results = await this.checkMultipleFonts(fontNames);
      } else {
        const result = await this.checkSingleFont(fontNames);
        results = [result];
      }
      
      const failedFonts = results.filter(font => !font.loaded);
      const totalLoadTime = Date.now() - startTime;
      
      this.logger.debug(`Font check completed`, {
        totalFonts: results.length,
        successCount: results.length - failedFonts.length,
        failedCount: failedFonts.length,
        totalTime: totalLoadTime
      });
      
      return {
        success: failedFonts.length === 0,
        allFonts: results,
        totalLoadTime,
        ...(failedFonts.length > 0 ? { failedFonts } : {})
      };
    }, 'check');
  }

  /**
   * 批量检查多个字体（支持并发控制）
   * @param fontNames 字体名称数组
   * @returns 字体检查结果数组
   */
  private async checkMultipleFonts(fontNames: string[]): Promise<FontCheckResult[]> {
    const concurrency = this.options.concurrency;
    const results: FontCheckResult[] = [];
    
    // 预处理：去重和排序（系统字体优先）
    const uniqueFonts = Array.from(new Set(fontNames));
    const sortedFonts = this.sortFontsByPriority(uniqueFonts);
    
    // 分批处理以控制并发数
    for (let i = 0; i < sortedFonts.length; i += concurrency) {
      const batch = sortedFonts.slice(i, i + concurrency);
      
      // 使用 Promise.allSettled 以避免单个字体检测失败影响整批
      const batchPromises = batch.map(name => 
        this.checkSingleFont(name).catch(error => ({
          name,
          loaded: false,
          status: 'error',
          error: error.message,
          loadTime: 0
        } as FontCheckResult))
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      const successfulResults = batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      );
      
      results.push(...successfulResults);
      
      // 如果有更多批次，添加小延迟以避免过度占用资源
      if (i + concurrency < sortedFonts.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    // 按原始顺序重新排列结果
    return fontNames.map(name => 
      results.find(result => result.name === name) || {
        name,
        loaded: false,
        status: 'not-found',
        loadTime: 0
      }
    );
  }

  /**
   * 按优先级排序字体（系统字体优先，已缓存的字体优先）
   * @param fontNames 字体名称数组
   * @returns 排序后的字体名称数组
   */
  private sortFontsByPriority(fontNames: string[]): string[] {
    return fontNames.sort((a, b) => {
      const aIsSystem = this.systemFonts.has(a.toLowerCase());
      const bIsSystem = this.systemFonts.has(b.toLowerCase());
      const aCached = this.getCached(`font_check_${a}`) !== undefined;
      const bCached = this.getCached(`font_check_${b}`) !== undefined;
      
      // 已缓存的优先
      if (aCached && !bCached) return -1;
      if (!aCached && bCached) return 1;
      
      // 系统字体优先
      if (aIsSystem && !bIsSystem) return -1;
      if (!aIsSystem && bIsSystem) return 1;
      
      // 字母顺序
      return a.localeCompare(b);
    });
  }

  /**
   * 检查单个字体是否已加载
   * @param fontName 字体名称
   * @returns 字体加载状态结果
   */
  private async checkSingleFont(fontName: string): Promise<FontCheckResult> {
    const startTime = Date.now();
    
    // 检查缓存
    const cacheKey = `font_check_${fontName}`;
    const cached = this.getCached<FontCheckResult>(cacheKey);
    if (cached) {
      this.logger.debug(`Font check cache hit for ${fontName}`);
      return cached;
    }

    try {
      // 验证输入
      if (!fontName || typeof fontName !== 'string') {
        throw this.errorHandler.createError(
          ErrorType.USER_ERROR,
          'Font name must be a non-empty string',
          { context: { method: 'checkSingleFont', input: fontName } }
        );
      }

      const cleanFontName = fontName.replace(/['"]/g, '');
      const isSystemFont = this.systemFonts.has(cleanFontName.toLowerCase());
      
      let result: FontCheckResult;

      // 首先检查加载状态
      const loadState = this.loadingStates.get(fontName);
      if (loadState) {
        if (loadState.status === 'loaded') {
          result = {
            name: fontName,
            loaded: true,
            status: 'loaded',
            loadTime: loadState.endTime ? loadState.endTime - loadState.startTime : undefined
          };
        } else if (loadState.status === 'loading') {
          result = {
            name: fontName,
            loaded: false,
            status: 'loading'
          };
        } else {
          result = {
            name: fontName,
            loaded: false,
            status: loadState.status,
            error: loadState.error?.message
          };
        }
      } else {
        // 执行字体检测
        result = await this.performFontCheck(fontName, isSystemFont);
      }

      result.loadTime = Date.now() - startTime;

      // 缓存结果（只缓存成功的检测结果）
      if (result.loaded || result.status === 'not-available') {
        this.setCached(cacheKey, result, 30000); // 缓存30秒
      }

      return result;
    } catch (error) {
      const processedError = this.handleError(error as Error, 'checkSingleFont');
      return {
        name: fontName,
        loaded: false,
        status: 'error',
        error: processedError.message,
        loadTime: Date.now() - startTime
      };
    }
  }

  /**
   * 执行字体检测
   * @param fontName 字体名称
   * @param isSystemFont 是否为系统字体
   * @returns 字体检查结果
   */
  private async performFontCheck(fontName: string, isSystemFont: boolean): Promise<FontCheckResult> {
    try {
      // 等待字体就绪
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      // 使用 document.fonts.check 进行初步检测
      const basicCheck = document.fonts && document.fonts.check(`12px '${fontName}'`);
      
      if (basicCheck) {
        // 对于非系统字体，进行额外验证以避免误报
        if (!isSystemFont) {
          // 检查是否在字体列表中
          let fontFound = false;
          if (document.fonts) {
            document.fonts.forEach(font => {
              if (font.family.replace(/['"]/g, '').toLowerCase() === fontName.replace(/['"]/g, '').toLowerCase()) {
                fontFound = true;
              }
            });
          }
          
          if (!fontFound) {
            // 进行精确的字体检测测试
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

      // 如果基础检测失败，尝试使用 FontFace API
      if (typeof FontFace === 'function') {
        return await this.checkWithFontFaceAPI(fontName, isSystemFont);
      }

      // 最后回退到基础检测结果
      return {
        name: fontName,
        loaded: false,
        status: 'unloaded'
      };
    } catch (error) {
      this.logger.warn(`Font check failed for ${fontName}`, { error: (error as Error).message });
      return {
        name: fontName,
        loaded: false,
        status: 'error',
        error: (error as Error).message
      };
    }
  }

  /**
   * 使用 FontFace API 检查字体
   * @param fontName 字体名称
   * @param isSystemFont 是否为系统字体
   * @returns 字体检查结果
   */
  private async checkWithFontFaceAPI(fontName: string, isSystemFont: boolean): Promise<FontCheckResult> {
    try {
      const fontFace = new FontFace(fontName, `local(${fontName})`);
      
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Font load timeout')), this.options.timeout);
      });
      
      // 尝试加载字体
      const loadedFont = await Promise.race([
        fontFace.load(),
        timeoutPromise
      ]).catch(() => null);
      
      if (loadedFont) {
        // 对于非系统字体，进行额外验证
        if (!isSystemFont) {
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
          loaded: true,
          status: 'loaded'
        };
      }

      // 如果 FontFace 加载失败，但基础检测通过且是系统字体，则认为已加载
      if (document.fonts && document.fonts.check(`12px '${fontName}'`) && isSystemFont) {
        return {
          name: fontName,
          loaded: true,
          status: 'loaded'
        };
      }

      return {
        name: fontName,
        loaded: false,
        status: 'error'
      };
    } catch (error) {
      // 回退到基础检测
      const isLoaded = document.fonts && document.fonts.check(`12px '${fontName}'`);
      
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
        loaded: isLoaded || false,
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
      // 检查缓存
      const cacheKey = `font_detection_${fontName}`;
      const cached = this.getCached<boolean>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      // 创建测试元素
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.style.visibility = 'hidden';
      testElement.style.whiteSpace = 'nowrap';
      testElement.style.fontSize = '16px';
      testElement.style.lineHeight = '1';
      
      // 测试文本 - 使用多种字符以提高检测准确性
      const testStrings = [
        'mmmmmmmmmmlli',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'abcdefghijklmnopqrstuvwxyz',
        '1234567890'
      ];
      
      document.body.appendChild(testElement);
      
      let detectionResults: boolean[] = [];
      
      for (const testString of testStrings) {
        testElement.textContent = testString;
        
        // 测试回退字体宽度
        testElement.style.fontFamily = 'sans-serif';
        const fallbackWidth = testElement.offsetWidth;
        
        // 测试目标字体宽度
        testElement.style.fontFamily = `'${fontName}', sans-serif`;
        const testWidth = testElement.offsetWidth;
        
        // 计算差异百分比
        const widthDifference = Math.abs(testWidth - fallbackWidth);
        const percentDifference = fallbackWidth > 0 ? (widthDifference / fallbackWidth) * 100 : 0;
        
        // 如果差异大于阈值，认为字体已加载
        detectionResults.push(percentDifference > this.options.detectionThreshold);
      }
      
      // 清理测试元素
      document.body.removeChild(testElement);
      
      // 如果大部分测试都表明字体已加载，则认为字体确实已加载
      const positiveResults = detectionResults.filter(result => result).length;
      const isLoaded = positiveResults >= Math.ceil(detectionResults.length / 2);
      
      // 缓存结果
      this.setCached(cacheKey, isLoaded, 60000); // 缓存1分钟
      
      this.logger.debug(`Font detection test for ${fontName}`, {
        testResults: detectionResults,
        positiveResults,
        threshold: this.options.detectionThreshold,
        isLoaded
      });
      
      return isLoaded;
    } catch (error) {
      this.logger.warn(`Font detection test failed for ${fontName}`, { 
        error: (error as Error).message 
      });
      return false;
    }
  }

  /**
   * 检查所有已加载的字体
   * @returns 所有已加载字体的状态
   */
  private async checkAllFonts(): Promise<FontCheckResult[]> {
    try {
      // 确保字体已加载
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      const fontList: FontCheckResult[] = [];
      const fontSet = new Set<string>();
      
      // 收集所有字体
      if (document.fonts) {
        document.fonts.forEach(font => {
          const fontFamily = font.family.replace(/['"]*/g, '');
          if (!fontSet.has(fontFamily)) {
            fontSet.add(fontFamily);
            
            const loadState = this.loadingStates.get(fontFamily);
            fontList.push({
              name: fontFamily,
              loaded: true,
              status: loadState?.status === 'loaded' ? 'loaded' : 'system',
              loadTime: loadState?.endTime && loadState?.startTime ? 
                loadState.endTime - loadState.startTime : undefined
            });
          }
        });
      }
      
      this.logger.debug(`Found ${fontList.length} fonts in document.fonts`);
      return fontList;
    } catch (error) {
      this.logger.error('Failed to check all fonts', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * 动态添加字体（使用FontFace对象）
   * @param font FontFace 对象
   * @returns 布尔值，表示是否添加成功
   */
  addFontFace(font: FontFace): boolean {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    try {
      if (!document.fonts) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'CSS Font Loading API not supported',
          { context: { method: 'addFontFace' } }
        );
      }
      
      (document.fonts as unknown as ExtendedFontFaceSet).add(font);
      this.addedFonts.add(font);
      
      this.emit('fontFaceAdded', { fontFace: font });
      this.logger.debug(`FontFace added: ${font.family}`);
      
      return true;
    } catch (error) {
      this.handleError(error as Error, 'addFontFace');
      return false;
    }
  }

  /**
   * 删除之前添加的字体
   * @param font FontFace对象或字体名称
   * @returns 布尔值，表示是否删除成功
   */
  deleteFont(font: FontFace | string): boolean {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    try {
      if (!document.fonts) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'CSS Font Loading API not supported',
          { context: { method: 'deleteFont' } }
        );
      }
      
      if (typeof font === 'string') {
        // 查找匹配的字体
        const fontsToDelete: FontFace[] = [];
        this.addedFonts.forEach(addedFont => {
          if (addedFont.family === font) {
            fontsToDelete.push(addedFont);
          }
        });
        
        if (fontsToDelete.length > 0) {
          fontsToDelete.forEach(f => {
            (document.fonts as unknown as ExtendedFontFaceSet).delete(f);
            this.addedFonts.delete(f);
          });
          
          // 清理加载状态
          this.loadingStates.delete(font);
          
          this.emit('fontDeleted', { fontName: font, count: fontsToDelete.length });
          this.logger.debug(`Deleted ${fontsToDelete.length} fonts with name: ${font}`);
          
          return true;
        }
        
        this.logger.warn(`Font not found: ${font}`);
        return false;
      }
      
      // 如果传入的是FontFace对象
      const deleted = (document.fonts as unknown as ExtendedFontFaceSet).delete(font);
      if (deleted) {
        this.addedFonts.delete(font);
        this.loadingStates.delete(font.family);
        
        this.emit('fontDeleted', { fontFace: font });
        this.logger.debug(`FontFace deleted: ${font.family}`);
      }
      
      return deleted;
    } catch (error) {
      this.handleError(error as Error, 'deleteFont');
      return false;
    }
  }

  /**
   * 清除所有动态添加的字体
   * @returns 布尔值，表示是否清除成功
   */
  clearFonts(): boolean {
    this.ensureNotDestroyed();

    try {
      if (!document.fonts) {
        throw this.errorHandler.createError(
          ErrorType.SYSTEM_ERROR,
          'CSS Font Loading API not supported',
          { context: { method: 'clearFonts' } }
        );
      }

      const fontCount = this.addedFonts.size;
      
      // 删除所有通过 addFont 添加的字体
      this.addedFonts.forEach(font => {
        (document.fonts as unknown as ExtendedFontFaceSet).delete(font);
      });
      
      this.addedFonts.clear();
      this.loadingStates.clear();
      
      this.emit('fontsCleared', { count: fontCount });
      this.logger.info(`Cleared ${fontCount} fonts`);
      
      return true;
    } catch (error) {
      this.handleError(error as Error, 'clearFonts');
      return false;
    }
  }

  /**
   * 获取字体加载状态
   * @param fontName 字体名称
   * @returns 字体加载状态
   */
  getFontLoadState(fontName: string): FontLoadState | undefined {
    return this.loadingStates.get(fontName);
  }

  /**
   * 获取所有字体加载状态
   * @returns 所有字体加载状态
   */
  getAllFontLoadStates(): Map<string, FontLoadState> {
    return new Map(this.loadingStates);
  }

  /**
   * 批量添加字体
   * @param fonts 字体配置数组
   * @returns 添加结果数组
   */
  async addFonts(fonts: Array<{
    name: string;
    url: string;
    options?: FontFaceDescriptors;
  }>): Promise<Array<{ name: string; success: boolean; error?: string }>> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    const results: Array<{ name: string; success: boolean; error?: string }> = [];
    const concurrency = Math.min(this.options.concurrency, fonts.length);
    
    // 分批处理以控制并发数
    for (let i = 0; i < fonts.length; i += concurrency) {
      const batch = fonts.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (font) => {
        try {
          const success = await Promise.resolve(this.addFont(font.name, font.url, font.options));
          return { name: font.name, success };
        } catch (error) {
          return { 
            name: font.name, 
            success: false, 
            error: (error as Error).message 
          };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      const processedResults = batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : {
          name: 'unknown',
          success: false,
          error: 'Promise rejected'
        }
      );
      
      results.push(...processedResults);
      
      // 添加小延迟以避免过度占用资源
      if (i + concurrency < fonts.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    this.emit('batchFontsAdded', { results, total: fonts.length });
    return results;
  }

  /**
   * 预加载字体（不添加到文档，仅检测可用性）
   * @param fontNames 字体名称数组
   * @returns 预加载结果
   */
  async preloadFonts(fontNames: string[]): Promise<{
    available: string[];
    unavailable: string[];
    cached: string[];
  }> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    const available: string[] = [];
    const unavailable: string[] = [];
    const cached: string[] = [];
    
    // 首先检查缓存
    for (const fontName of fontNames) {
      const cacheKey = `font_check_${fontName}`;
      const cachedResult = this.getCached<FontCheckResult>(cacheKey);
      
      if (cachedResult) {
        cached.push(fontName);
        if (cachedResult.loaded) {
          available.push(fontName);
        } else {
          unavailable.push(fontName);
        }
      }
    }
    
    // 检测未缓存的字体
    const uncachedFonts = fontNames.filter(name => !cached.includes(name));
    if (uncachedFonts.length > 0) {
      const results = await this.checkMultipleFonts(uncachedFonts);
      
      for (const result of results) {
        if (result.loaded) {
          available.push(result.name);
        } else {
          unavailable.push(result.name);
        }
      }
    }
    
    this.emit('fontsPreloaded', { 
      total: fontNames.length,
      available: available.length,
      unavailable: unavailable.length,
      cached: cached.length
    });
    
    return { available, unavailable, cached };
  }

  /**
   * 清理过期的缓存和加载状态
   */
  cleanup(): void {
    // 清理过期的加载状态（超过1小时的）
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    for (const [fontName, state] of this.loadingStates.entries()) {
      if (state.startTime < oneHourAgo && 
          (state.status === 'loaded' || state.status === 'error')) {
        this.loadingStates.delete(fontName);
      }
    }
    
    this.logger.debug('Font manager cleanup completed', {
      remainingStates: this.loadingStates.size
    });
  }

  /**
   * 获取性能统计信息
   * @returns 性能统计
   */
  getPerformanceStats(): {
    totalFontsChecked: number;
    cacheHitRate: number;
    averageCheckTime: number;
    loadingFonts: number;
    loadedFonts: number;
    failedFonts: number;
  } {
    const states = Array.from(this.loadingStates.values());
    const loadingFonts = states.filter(s => s.status === 'loading').length;
    const loadedFonts = states.filter(s => s.status === 'loaded').length;
    const failedFonts = states.filter(s => s.status === 'error').length;
    
    const completedStates = states.filter(s => s.endTime);
    const totalCheckTime = completedStates.reduce((sum, state) => 
      sum + (state.endTime! - state.startTime), 0
    );
    const averageCheckTime = completedStates.length > 0 ? 
      totalCheckTime / completedStates.length : 0;
    
    // 估算缓存命中率（基于缓存大小和检测次数的比例）
    const cacheSize = this.cache?.size() || 0;
    const totalChecks = states.length;
    const cacheHitRate = totalChecks > 0 ? Math.min(cacheSize / totalChecks, 1) : 0;
    
    return {
      totalFontsChecked: totalChecks,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageCheckTime: Math.round(averageCheckTime),
      loadingFonts,
      loadedFonts,
      failedFonts
    };
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
}

// 保持向后兼容性
export default FontManager;
export { FontManager };
export { FontManager as Font };

// 导出工具函数
export * from './utils';