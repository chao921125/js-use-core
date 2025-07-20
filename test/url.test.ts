/**
 * URL 模块测试
 */

// 模拟浏览器环境
global.URL = require('url').URL;

import { 
  urlToObj, 
  parseQuery, 
  stringifyQuery, 
  isValidUrl, 
  getFileExtensionFromUrl, 
  getFileNameFromUrl,
  UrlManager,
  buildUrl
} from '../src/url';

describe('URL 模块测试', () => {
  
  describe('urlToObj', () => {
    test('应该正确解析 URL 参数', () => {
      const result = urlToObj('https://example.com?name=test&id=123#section');
      expect(result).toEqual({
        name: 'test',
        id: '123',
        HASH: 'section'
      });
    });

    test('应该处理空 URL', () => {
      const result = urlToObj('');
      expect(result).toEqual({});
    });

    test('应该处理编码的参数', () => {
      const result = urlToObj('?name=%E6%B5%8B%E8%AF%95&value=hello%20world');
      expect(result).toEqual({
        name: '测试',
        value: 'hello world'
      });
    });
  });

  describe('parseQuery', () => {
    test('应该正确解析查询字符串', () => {
      const result = parseQuery('?name=test&age=25&active=true');
      expect(result).toEqual({
        name: 'test',
        age: '25',
        active: 'true'
      });
    });

    test('应该处理数组参数', () => {
      const result = parseQuery('?tags[]=js&tags[]=web&tags[]=react');
      expect(result).toEqual({
        tags: ['js', 'web', 'react']
      });
    });

    test('应该处理重复的键', () => {
      const result = parseQuery('?color=red&color=blue');
      expect(result).toEqual({
        color: ['red', 'blue']
      });
    });
  });

  describe('stringifyQuery', () => {
    test('应该正确构建查询字符串', () => {
      const result = stringifyQuery({
        name: 'test',
        age: 25,
        active: true
      });
      expect(result).toBe('?name=test&age=25&active=true');
    });

    test('应该处理数组参数', () => {
      const result = stringifyQuery({
        tags: ['js', 'web']
      });
      expect(result).toBe('?tags[]=js&tags[]=web');
    });

    test('应该跳过 undefined 和 null 值', () => {
      const result = stringifyQuery({
        name: 'test',
        empty: null,
        missing: undefined,
        age: 25
      });
      expect(result).toBe('?name=test&age=25');
    });
  });

  describe('isValidUrl', () => {
    test('应该验证有效的 URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.example.com/path?query=value#hash')).toBe(true);
    });

    test('应该拒绝无效的 URL', () => {
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('just-text')).toBe(false);
    });

    test('应该根据选项验证', () => {
      expect(isValidUrl('ftp://example.com', { protocols: ['ftp:'] })).toBe(true);
      expect(isValidUrl('ftp://example.com', { protocols: ['http:', 'https:'] })).toBe(false);
      
      expect(isValidUrl('http://localhost', { allowLocalhost: false })).toBe(false);
      expect(isValidUrl('http://127.0.0.1', { allowIp: false })).toBe(false);
    });
  });

  describe('getFileExtensionFromUrl', () => {
    test('应该正确获取文件扩展名', () => {
      expect(getFileExtensionFromUrl('https://example.com/file.pdf')).toBe('pdf');
      expect(getFileExtensionFromUrl('https://example.com/image.jpg')).toBe('jpg');
      expect(getFileExtensionFromUrl('/path/to/document.docx')).toBe('docx');
    });

    test('应该处理没有扩展名的情况', () => {
      expect(getFileExtensionFromUrl('https://example.com/file')).toBe('');
      expect(getFileExtensionFromUrl('https://example.com/')).toBe('');
    });
  });

  describe('getFileNameFromUrl', () => {
    test('应该正确获取文件名', () => {
      expect(getFileNameFromUrl('https://example.com/path/file.pdf')).toBe('file.pdf');
      expect(getFileNameFromUrl('https://example.com/path/file.pdf', false)).toBe('file');
    });

    test('应该处理根路径', () => {
      expect(getFileNameFromUrl('https://example.com/')).toBe('');
      expect(getFileNameFromUrl('https://example.com')).toBe('');
    });
  });

  describe('buildUrl', () => {
    test('应该正确构建 URL', () => {
      const url = buildUrl({
        base: 'https://api.example.com',
        pathname: '/users',
        query: { page: 1, limit: 10 },
        hash: 'results'
      });
      
      expect(url).toContain('https://api.example.com/users');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('#results');
    });

    test('应该处理空选项', () => {
      const url = buildUrl({});
      expect(typeof url).toBe('string');
    });
  });

  describe('UrlManager', () => {
    test('应该创建 URL 管理器', () => {
      const manager = new UrlManager('https://example.com');
      const info = manager.getUrlInfo();
      
      expect(info.origin).toBe('https://example.com');
      expect(info.protocol).toBe('https:');
      expect(info.hostname).toBe('example.com');
    });

    test('应该支持链式操作', () => {
      const manager = new UrlManager('https://example.com');
      const url = manager
        .setPathname('/api/users')
        .addQuery({ page: 1 })
        .setHash('results')
        .toString();
      
      expect(url).toContain('/api/users');
      expect(url).toContain('page=1');
      expect(url).toContain('#results');
    });

    test('应该正确处理查询参数', () => {
      const manager = new UrlManager('https://example.com?existing=value');
      
      manager.addQuery({ new: 'param' });
      const query = manager.getQuery();
      
      expect(query.existing).toBe('value');
      expect(query.new).toBe('param');
    });
  });

});