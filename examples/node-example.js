/**
 * file Node.js 示例
 * 
 * 注意：这个示例需要在构建库后运行
 * 运行方法：node examples/node-example.js
 */

// 导入库
const fs = require('fs');
const path = require('path');
const { fileToBase64, base64ToFile, base64ToBlob } = require('../dist/index');

// 模拟浏览器环境中的一些对象
global.Blob = class Blob {
  constructor(parts, options = {}) {
    this.parts = parts;
    this.type = options.type || '';
    this.size = parts.reduce((acc, part) => acc + (part.length || 0), 0);
  }
};

global.File = class File extends Blob {
  constructor(parts, name, options = {}) {
    super(parts, options);
    this.name = name;
    this.lastModified = options.lastModified || Date.now();
  }
};

global.FileReader = class FileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }

  readAsDataURL(blob) {
    try {
      // 简单模拟，实际情况更复杂
      const buffer = Buffer.concat(blob.parts.map(part => {
        if (typeof part === 'string') {
          return Buffer.from(part);
        }
        return part;
      }));
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
      if (this.onload) {
        setTimeout(() => this.onload({ target: this }), 0);
      }
    } catch (error) {
      if (this.onerror) {
        setTimeout(() => this.onerror(error), 0);
      }
    }
  }
};

// 示例1: 文件转Base64
async function example1() {
  console.log('\n示例1: 文件转Base64');
  
  // 创建一个测试文件
  const testFilePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFilePath, 'Hello, this is a test file!');
  
  // 创建File对象
  const fileContent = fs.readFileSync(testFilePath);
  const file = new File([fileContent], 'test-file.txt', { type: 'text/plain' });
  
  // 转换为Base64
  try {
    const base64 = await fileToBase64(file);
    console.log('Base64结果:', base64);
    
    // 清理
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.error('转换失败:', error);
  }
}

// 示例2: Base64转文件
function example2() {
  console.log('\n示例2: Base64转文件');
  
  const testBase64 = 'data:text/plain;base64,SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IGZpbGUh';
  
  try {
    // 转换为File对象
    const file = base64ToFile(testBase64, 'output.txt');
    console.log('生成的文件:', file.name, '大小:', file.size, '类型:', file.type);
    
    // 将File对象内容写入实际文件
    const reader = new FileReader();
    reader.onload = function() {
      const base64Data = reader.result.split(',')[1];
      const outputPath = path.join(__dirname, 'output.txt');
      fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
      console.log('文件已保存到:', outputPath);
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('转换失败:', error);
  }
}

// 示例3: Base64转Blob
function example3() {
  console.log('\n示例3: Base64转Blob');
  
  const testBase64 = 'data:text/plain;base64,SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IGZpbGUh';
  
  try {
    // 转换为Blob对象
    const blob = base64ToBlob(testBase64);
    console.log('生成的Blob:', '大小:', blob.size, '类型:', blob.type);
  } catch (error) {
    console.error('转换失败:', error);
  }
}

// 运行示例
async function runExamples() {
  await example1();
  example2();
  example3();
}

runExamples().catch(console.error);