import { isElement, getElement } from '../utils/dom';

/**
 * 剪贴板数据类型
 */
export type ClipboardDataType = 'text' | 'html' | 'image';

/**
 * 剪贴板数据接口
 */
export interface ClipboardData {
  type: ClipboardDataType;
  data: string | Blob;
}

/**
 * 复制选项接口
 */
export interface CopyOptions {
  format?: ClipboardDataType;
  fallback?: boolean;
}

/**
 * 粘贴选项接口
 */
export interface PasteOptions {
  format?: ClipboardDataType;
  fallback?: boolean;
}

/**
 * 剪贴板管理器类
 */
class ClipboardManager {
  /**
   * 检查是否支持现代剪贴板 API
   */
  get isSupported(): boolean {
    return 'clipboard' in navigator && 'writeText' in navigator.clipboard;
  }

  /**
   * 检查是否支持读取剪贴板
   */
  get canRead(): boolean {
    return 'clipboard' in navigator && 'readText' in navigator.clipboard;
  }

  /**
   * 复制文本到剪贴板
   */
  async copyText(text: string): Promise<boolean> {
    try {
      if (this.isSupported) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        return this.fallbackCopyText(text);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
      return this.fallbackCopyText(text);
    }
  }

  /**
   * 复制 HTML 到剪贴板
   */
  async copyHTML(html: string): Promise<boolean> {
    try {
      if (this.isSupported && 'write' in navigator.clipboard) {
        const blob = new Blob([html], { type: 'text/html' });
        const data = [new ClipboardItem({ 'text/html': blob })];
        await (navigator.clipboard as any).write(data);
        return true;
      } else {
        return this.fallbackCopyHTML(html);
      }
    } catch (error) {
      console.error('Failed to copy HTML:', error);
      return this.fallbackCopyHTML(html);
    }
  }

  /**
   * 复制元素内容到剪贴板
   */
  async copyElement(element: Element | string, options: CopyOptions = {}): Promise<boolean> {
    const targetElement = getElement(element);
    if (!targetElement) {
      throw new Error('Invalid element provided');
    }

    const { format = 'text', fallback = true } = options;

    try {
      switch (format) {
        case 'html':
          return await this.copyHTML(targetElement.innerHTML);
        case 'text':
        default:
          return await this.copyText(targetElement.textContent || '');
      }
    } catch (error) {
      if (fallback) {
        return this.fallbackCopyElement(targetElement, format);
      }
      throw error;
    }
  }

  /**
   * 从剪贴板读取文本
   */
  async readText(): Promise<string> {
    try {
      if (this.canRead) {
        return await navigator.clipboard.readText();
      } else {
        throw new Error('Clipboard reading not supported');
      }
    } catch (error) {
      console.error('Failed to read text from clipboard:', error);
      throw error;
    }
  }

  /**
   * 从剪贴板读取 HTML
   */
  async readHTML(): Promise<string> {
    try {
      if (this.canRead && 'read' in navigator.clipboard) {
        const data = await (navigator.clipboard as any).read();
        for (const item of data) {
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html');
            return await blob.text();
          }
        }
        throw new Error('No HTML content in clipboard');
      } else {
        throw new Error('Clipboard HTML reading not supported');
      }
    } catch (error) {
      console.error('Failed to read HTML from clipboard:', error);
      throw error;
    }
  }

  /**
   * 从剪贴板读取数据
   */
  async read(options: PasteOptions = {}): Promise<ClipboardData> {
    const { format = 'text', fallback = true } = options;

    try {
      switch (format) {
        case 'html':
          const html = await this.readHTML();
          return { type: 'html', data: html };
        case 'text':
        default:
          const text = await this.readText();
          return { type: 'text', data: text };
      }
    } catch (error) {
      if (fallback) {
        return this.fallbackRead(format);
      }
      throw error;
    }
  }

  /**
   * 降级复制文本方法
   */
  private fallbackCopyText(text: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }

  /**
   * 降级复制 HTML 方法
   */
  private fallbackCopyHTML(html: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.innerHTML = html;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      console.error('Fallback HTML copy failed:', error);
      return false;
    }
  }

  /**
   * 降级复制元素方法
   */
  private fallbackCopyElement(element: Element, format: ClipboardDataType): boolean {
    try {
      const range = document.createRange();
      range.selectNodeContents(element);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        const successful = document.execCommand('copy');
        selection.removeAllRanges();
        return successful;
      }
      return false;
    } catch (error) {
      console.error('Fallback element copy failed:', error);
      return false;
    }
  }

  /**
   * 降级读取方法
   */
  private fallbackRead(format: ClipboardDataType): ClipboardData {
    // 降级读取通常不可行，因为安全限制
    throw new Error(`Fallback reading for ${format} is not supported due to security restrictions`);
  }

  /**
   * 监听剪贴板变化事件
   */
  onCopy(callback: (data: ClipboardData) => void): void {
    document.addEventListener('copy', (event) => {
      // 这里可以尝试获取复制的内容，但受安全限制
      callback({ type: 'text', data: '' });
    });
  }

  /**
   * 监听粘贴事件
   */
  onPaste(callback: (data: ClipboardData) => void): void {
    document.addEventListener('paste', (event) => {
      const clipboardData = event.clipboardData;
      if (clipboardData) {
        if (clipboardData.types.includes('text/html')) {
          callback({ type: 'html', data: clipboardData.getData('text/html') });
        } else if (clipboardData.types.includes('text/plain')) {
          callback({ type: 'text', data: clipboardData.getData('text/plain') });
        }
      }
    });
  }
}

// 创建单例实例
const clipboard = new ClipboardManager();

export default clipboard;
export { ClipboardManager }; 