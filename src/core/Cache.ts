/**
 * 智能缓存管理器
 * 
 * @description 提供智能缓存管理功能，支持TTL、LRU清理和自动过期
 * @author js-use-core
 * @date 2024-07-20
 */

import { CacheEntry, CacheConfig } from './types';

/**
 * 缓存管理器类
 */
export class Cache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: Required<CacheConfig>;
  private cleanupTimer?: NodeJS.Timeout;

  /**
   * 构造函数
   * @param config 缓存配置
   */
  constructor(config?: CacheConfig) {
    this.config = {
      maxSize: config?.maxSize ?? 100,
      defaultTTL: config?.defaultTTL ?? 5 * 60 * 1000, // 5分钟
      enableLRU: config?.enableLRU ?? true,
      cleanupInterval: config?.cleanupInterval ?? 60 * 1000 // 1分钟
    };

    // 启动定期清理
    this.startCleanup();
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒），可选
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expireTime = ttl ?? this.config.defaultTTL;
    
    const entry: CacheEntry<T> = {
      value,
      expireAt: now + expireTime,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now
    };

    // 如果缓存已满且不是更新现有键，执行LRU清理
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值或undefined
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now > entry.expireAt) {
      this.cache.delete(key);
      return undefined;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.value;
  }

  /**
   * 检查缓存项是否存在且未过期
   * @param key 缓存键
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // 检查是否过期
    if (Date.now() > entry.expireAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存项的详细信息
   * @param key 缓存键
   */
  getInfo(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // 检查是否过期
    if (Date.now() > entry.expireAt) {
      this.cache.delete(key);
      return undefined;
    }

    return { ...entry }; // 返回副本
  }

  /**
   * 更新缓存项的TTL
   * @param key 缓存键
   * @param ttl 新的过期时间（毫秒）
   */
  touch(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now > entry.expireAt) {
      this.cache.delete(key);
      return false;
    }

    // 更新过期时间
    const expireTime = ttl ?? this.config.defaultTTL;
    entry.expireAt = now + expireTime;
    entry.lastAccessed = now;

    return true;
  }

  /**
   * 获取或设置缓存项（如果不存在则通过工厂函数创建）
   * @param key 缓存键
   * @param factory 工厂函数
   * @param ttl 过期时间（毫秒），可选
   */
  async getOrSet(key: string, factory: () => T | Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * 批量设置缓存项
   * @param entries 缓存项数组
   * @param ttl 过期时间（毫秒），可选
   */
  mset(entries: Array<[string, T]>, ttl?: number): void {
    for (const [key, value] of entries) {
      this.set(key, value, ttl);
    }
  }

  /**
   * 批量获取缓存项
   * @param keys 缓存键数组
   */
  mget(keys: string[]): Array<T | undefined> {
    return keys.map(key => this.get(key));
  }

  /**
   * 批量删除缓存项
   * @param keys 缓存键数组
   */
  mdel(keys: string[]): number {
    let deleted = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccess: number;
    expiredCount: number;
  } {
    let totalAccess = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      totalAccess += entry.accessCount;
      
      if (now > entry.expireAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalAccess > 0 ? (totalAccess - expiredCount) / totalAccess : 0,
      totalAccess,
      expiredCount
    };
  }

  /**
   * 手动清理过期项
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expireAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * LRU清理（移除最少使用的项）
   */
  private evictLRU(): void {
    if (!this.config.enableLRU || this.cache.size === 0) {
      return;
    }

    let lruKey: string | null = null;
    let lruTime = Infinity; // 初始化为最大值，寻找最小的访问时间

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止定期清理
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * 更新配置
   * @param config 新的配置
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 如果更新了清理间隔，重启清理定时器
    if (config.cleanupInterval !== undefined) {
      this.startCleanup();
    }

    // 如果缓存大小超过新的限制，执行清理
    if (config.maxSize !== undefined && this.cache.size > config.maxSize) {
      while (this.cache.size > config.maxSize) {
        this.evictLRU();
      }
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}