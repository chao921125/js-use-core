/**
 * 轻量级事件发射器
 * 
 * @description 提供事件的注册、移除和触发功能，支持优先级和一次性监听器
 * @author js-use-core
 * @date 2024-07-20
 */

import { EventListener, EventListenerConfig } from './types';

/**
 * 事件发射器类
 */
export class EventEmitter {
  private events: Map<string, EventListenerConfig[]> = new Map();
  private maxListeners: number = 10;

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param options 监听器配置
   */
  on(event: string, listener: EventListener, options?: { once?: boolean; priority?: number }): this {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    const config: EventListenerConfig = {
      listener,
      once: options?.once || false,
      priority: options?.priority || 0
    };

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    
    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(`Warning: Possible EventEmitter memory leak detected. ${listeners.length + 1} listeners added for event "${event}". Use setMaxListeners() to increase limit.`);
    }

    // 按优先级插入监听器
    let inserted = false;
    for (let i = 0; i < listeners.length; i++) {
      if (config.priority! > (listeners[i].priority || 0)) {
        listeners.splice(i, 0, config);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      listeners.push(config);
    }

    return this;
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param priority 优先级
   */
  once(event: string, listener: EventListener, priority?: number): this {
    return this.on(event, listener, { once: true, priority });
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener?: EventListener): this {
    if (!this.events.has(event)) {
      return this;
    }

    const listeners = this.events.get(event)!;

    if (!listener) {
      // 移除所有监听器
      this.events.delete(event);
    } else {
      // 移除指定监听器
      const index = listeners.findIndex(config => config.listener === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        if (listeners.length === 0) {
          this.events.delete(event);
        }
      }
    }

    return this;
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给监听器的参数
   */
  emit(event: string, ...args: any[]): boolean {
    if (!this.events.has(event)) {
      return false;
    }

    const listeners = this.events.get(event)!.slice(); // 复制数组避免在执行过程中被修改
    const toRemove: EventListenerConfig[] = [];

    for (const config of listeners) {
      try {
        config.listener.apply(this, args);
        
        if (config.once) {
          toRemove.push(config);
        }
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }

    // 移除一次性监听器
    if (toRemove.length > 0) {
      const currentListeners = this.events.get(event);
      if (currentListeners) {
        for (const config of toRemove) {
          const index = currentListeners.indexOf(config);
          if (index !== -1) {
            currentListeners.splice(index, 1);
          }
        }
        
        if (currentListeners.length === 0) {
          this.events.delete(event);
        }
      }
    }

    return true;
  }

  /**
   * 获取事件的监听器数量
   * @param event 事件名称
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }

  /**
   * 获取事件的所有监听器
   * @param event 事件名称
   */
  listeners(event: string): EventListener[] {
    return this.events.get(event)?.map(config => config.listener) || [];
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * 移除所有监听器
   * @param event 可选的事件名称，如果不提供则移除所有事件的监听器
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * 设置最大监听器数量
   * @param n 最大数量
   */
  setMaxListeners(n: number): this {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Max listeners must be a non-negative integer');
    }
    this.maxListeners = n;
    return this;
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * 在指定事件前添加监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  prependListener(event: string, listener: EventListener): this {
    return this.on(event, listener, { priority: Number.MAX_SAFE_INTEGER });
  }

  /**
   * 在指定事件前添加一次性监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  prependOnceListener(event: string, listener: EventListener): this {
    return this.once(event, listener, Number.MAX_SAFE_INTEGER);
  }
}