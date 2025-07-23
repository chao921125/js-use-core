/**
 * 统一日志记录器
 * 
 * @description 提供统一的日志记录功能，支持不同级别的日志和格式化输出
 * @author js-use-core
 * @date 2024-07-20
 */

import { LogLevel, LogEntry } from './types';

/**
 * 日志记录器类
 */
export class Logger {
  private level: LogLevel = LogLevel.INFO;
  private module: string;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private enableConsole: boolean = true;

  /**
   * 构造函数
   * @param module 模块名称
   * @param options 配置选项
   */
  constructor(module: string = 'Core', options?: {
    level?: LogLevel;
    maxLogs?: number;
    enableConsole?: boolean;
  }) {
    this.module = module;
    if (options) {
      this.level = options.level ?? LogLevel.INFO;
      this.maxLogs = options.maxLogs ?? 1000;
      this.enableConsole = options.enableConsole ?? true;
    }
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param data 额外数据
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param data 额外数据
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param data 额外数据
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param data 额外数据
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param data 额外数据
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      module: this.module,
      data
    };

    // 添加到日志数组
    this.logs.push(entry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    if (this.enableConsole) {
      this.outputToConsole(entry);
    }
  }

  /**
   * 输出日志到控制台
   * @param entry 日志条目
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.module}]`;
    
    const args = [
      `${prefix} ${entry.message}`,
      ...(entry.data !== undefined ? [entry.data] : [])
    ];

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        break;
    }
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 获取指定级别的日志
   * @param level 日志级别
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(entry => entry.level === level);
  }

  /**
   * 获取指定时间范围内的日志
   * @param startTime 开始时间戳
   * @param endTime 结束时间戳
   */
  getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this.logs.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * 设置最大日志数量
   * @param maxLogs 最大日志数量
   */
  setMaxLogs(maxLogs: number): void {
    if (maxLogs < 0) {
      throw new Error('Max logs must be non-negative');
    }
    this.maxLogs = maxLogs;
    
    // 如果当前日志数量超过限制，则删除旧的日志
    if (this.logs.length > maxLogs) {
      this.logs = this.logs.slice(-maxLogs);
    }
  }

  /**
   * 启用或禁用控制台输出
   * @param enable 是否启用
   */
  setConsoleOutput(enable: boolean): void {
    this.enableConsole = enable;
  }

  /**
   * 导出日志为JSON字符串
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 从JSON字符串导入日志
   * @param jsonString JSON字符串
   */
  importLogs(jsonString: string): void {
    try {
      const logs = JSON.parse(jsonString);
      if (Array.isArray(logs)) {
        this.logs = logs.filter(entry => 
          entry && 
          typeof entry.level === 'number' &&
          typeof entry.message === 'string' &&
          typeof entry.timestamp === 'number'
        );
      }
    } catch (error) {
      this.error('Failed to import logs', error);
    }
  }

  /**
   * 创建子日志记录器
   * @param subModule 子模块名称
   */
  createChild(subModule: string): Logger {
    return new Logger(`${this.module}.${subModule}`, {
      level: this.level,
      maxLogs: this.maxLogs,
      enableConsole: this.enableConsole
    });
  }
}