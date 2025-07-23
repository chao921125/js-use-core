/**
 * 核心基础架构测试
 */

import {
  BaseManager,
  ErrorHandler,
  EventEmitter,
  Logger,
  Cache,
  CustomError,
  ErrorType,
  LogLevel
} from '../src/core';

// 测试用的具体管理器实现
class TestManager extends BaseManager {
  protected getDefaultOptions() {
    return {
      debug: false,
      timeout: 5000,
      retries: 3,
      cache: true
    };
  }

  async initialize(): Promise<void> {
    this.initialized = true;
    this.emit('initialized');
  }

  destroy(): void {
    this.baseDestroy();
  }

  // 公开一些受保护的方法用于测试
  public testHandleError(error: Error, context?: string) {
    return this.handleError(error, context);
  }

  public testValidateInput(input: any, schema: any) {
    return this.validateInput(input, schema);
  }

  public async testSafeExecute<R>(operation: () => Promise<R>, context: string) {
    return this.safeExecute(operation, context);
  }
}

describe('核心基础架构测试', () => {
  describe('Cache', () => {
    let cache: Cache;

    beforeEach(() => {
      cache = new Cache({
        maxSize: 5,
        defaultTTL: 1000,
        enableLRU: true,
        cleanupInterval: 100
      });
    });

    afterEach(() => {
      cache.destroy();
    });

    it('应该能够设置和获取缓存', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('应该在过期后返回undefined', async () => {
      cache.set('key1', 'value1', 100);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeUndefined();
    });

    it('应该支持LRU清理', () => {
      // 填满缓存
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      
      expect(cache.size()).toBe(5);
      
      // 添加新项目，应该触发LRU清理
      cache.set('key5', 'value5');
      
      // 缓存大小不应该超过最大值
      expect(cache.size()).toBeLessThanOrEqual(5);
      // 新项目应该存在
      expect(cache.get('key5')).toBe('value5');
    });

    it('应该支持批量操作', () => {
      cache.mset([['key1', 'value1'], ['key2', 'value2']]);
      const values = cache.mget(['key1', 'key2', 'key3']);
      expect(values).toEqual(['value1', 'value2', undefined]);
    });
  });

  describe('Logger', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('TestModule', {
        level: LogLevel.DEBUG,
        enableConsole: false
      });
    });

    it('应该记录不同级别的日志', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[1].level).toBe(LogLevel.INFO);
      expect(logs[2].level).toBe(LogLevel.WARN);
      expect(logs[3].level).toBe(LogLevel.ERROR);
    });

    it('应该根据日志级别过滤日志', () => {
      logger.setLevel(LogLevel.WARN);
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[1].level).toBe(LogLevel.ERROR);
    });

    it('应该支持创建子日志记录器', () => {
      const childLogger = logger.createChild('SubModule');
      childLogger.info('Child message');

      const logs = childLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].module).toBe('TestModule.SubModule');
    });
  });

  describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
      emitter = new EventEmitter();
    });

    it('应该能够添加和触发事件监听器', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      emitter.emit('test', 'arg1', 'arg2');

      expect(listener).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('应该支持一次性监听器', () => {
      const listener = jest.fn();
      emitter.once('test', listener);
      emitter.emit('test');
      emitter.emit('test');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('应该支持优先级', () => {
      const calls: number[] = [];
      emitter.on('test', () => calls.push(1), { priority: 1 });
      emitter.on('test', () => calls.push(3), { priority: 3 });
      emitter.on('test', () => calls.push(2), { priority: 2 });

      emitter.emit('test');
      expect(calls).toEqual([3, 2, 1]);
    });

    it('应该能够移除监听器', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      emitter.off('test', listener);
      emitter.emit('test');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('ErrorHandler', () => {
    let errorHandler: ErrorHandler;

    beforeEach(() => {
      errorHandler = new ErrorHandler();
    });

    it('应该能够处理不同类型的错误', () => {
      const networkError = new Error('Network request failed');
      const processedError = errorHandler.handleError(networkError);

      expect(processedError.type).toBe(ErrorType.NETWORK_ERROR);
      expect(processedError.recoverable).toBe(true);
    });

    it('应该能够创建自定义错误', () => {
      const customError = errorHandler.createError(
        ErrorType.USER_ERROR,
        'Invalid input',
        { code: 'INVALID_INPUT' }
      );

      expect(customError).toBeInstanceOf(CustomError);
      expect(customError.type).toBe(ErrorType.USER_ERROR);
      expect(customError.code).toBe('INVALID_INPUT');
    });

    it('应该提供错误解决方案', () => {
      errorHandler.addErrorSolution('TEST_ERROR', 'This is a test solution');
      
      const error = new Error('Test error');
      (error as any).code = 'TEST_ERROR';
      
      const solution = errorHandler.getErrorSolution(error);
      expect(solution).toBe('This is a test solution');
    });
  });

  describe('BaseManager', () => {
    let manager: TestManager;

    beforeEach(() => {
      manager = new TestManager();
    });

    afterEach(() => {
      if (!manager.getStatus().destroyed) {
        manager.destroy();
      }
    });

    it('应该能够初始化和销毁', async () => {
      expect(manager.getStatus().initialized).toBe(false);
      
      await manager.initialize();
      expect(manager.getStatus().initialized).toBe(true);
      
      manager.destroy();
      expect(manager.getStatus().destroyed).toBe(true);
    });

    it('应该支持事件系统', async () => {
      const listener = jest.fn();
      manager.on('initialized', listener);
      
      await manager.initialize();
      expect(listener).toHaveBeenCalled();
    });

    it('应该能够处理错误', () => {
      const error = new Error('Test error');
      const processedError = manager.testHandleError(error, 'testMethod');

      expect(processedError.context.module).toBe('TestManager');
      expect(processedError.context.method).toBe('testMethod');
    });

    it('应该能够验证输入', () => {
      const schema = {
        type: 'string',
        required: true
      };

      expect(manager.testValidateInput('valid string', schema)).toBe(true);
      expect(manager.testValidateInput(123, schema)).toBe(false);
      expect(manager.testValidateInput(null, schema)).toBe(false);
    });

    it('应该支持安全执行操作', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await manager.testSafeExecute(operation, 'testOperation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('应该支持重试机制', async () => {
      let attempts = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          const error = new Error('Temporary error');
          // 标记为可恢复错误
          (error as any).name = 'NetworkError';
          throw error;
        }
        return Promise.resolve('success');
      });

      const result = await manager.testSafeExecute(operation, 'testOperation');
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('应该能够更新配置', () => {
      const initialOptions = manager.getStatus();
      manager.updateOptions({ debug: true });
      
      // 验证配置更新事件被触发
      const listener = jest.fn();
      manager.on('optionsUpdated', listener);
      manager.updateOptions({ timeout: 10000 });
      
      expect(listener).toHaveBeenCalled();
    });
  });
});