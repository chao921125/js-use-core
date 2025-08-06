/**
 * 自动初始化功能测试
 */

import { ClipboardManager } from '../src/clipboard';
import { FullscreenManager } from '../src/fullscreen';
import { FontManager } from '../src/font';

describe('自动初始化功能测试', () => {
  it('ClipboardManager 应该自动初始化', async () => {
    const manager = new ClipboardManager();
    
    // 直接使用功能，应该自动初始化
    try {
      await manager.copyText('test');
      // 如果没有错误，说明自动初始化成功
      expect(manager.getStatus().initialized).toBe(true);
    } catch (error) {
      // 在测试环境中可能会因为缺少浏览器API而失败，这是正常的
      // 但应该是功能性错误，而不是初始化错误
      expect((error as Error).message).not.toContain('not initialized');
    }
  });

  it('FullscreenManager 应该自动初始化', async () => {
    const manager = new FullscreenManager();
    
    // 直接使用功能，应该自动初始化
    try {
      await manager.request();
      expect(manager.getStatus().initialized).toBe(true);
    } catch (error) {
      // 在测试环境中可能会因为缺少浏览器API而失败，这是正常的
      expect((error as Error).message).not.toContain('not initialized');
    }
  });

  it('FontManager 应该自动初始化', async () => {
    const manager = new FontManager();
    
    // 直接使用功能，应该自动初始化
    try {
      await manager.check('Arial');
      expect(manager.getStatus().initialized).toBe(true);
    } catch (error) {
      // 在测试环境中可能会因为缺少浏览器API而失败，这是正常的
      expect((error as Error).message).not.toContain('not initialized');
    }
  });

  it('ready() 方法应该等待初始化完成', async () => {
    const manager = new ClipboardManager();
    
    // ready() 应该等待初始化完成
    await manager.ready();
    expect(manager.getStatus().initialized).toBe(true);
  });

  it('多次调用 ready() 应该是安全的', async () => {
    const manager = new ClipboardManager();
    
    // 多次调用 ready() 应该都能正常完成
    await Promise.all([
      manager.ready(),
      manager.ready(),
      manager.ready()
    ]);
    
    expect(manager.getStatus().initialized).toBe(true);
  });
});