/**
 * file React 示例
 * 
 * 这个示例展示了如何在React应用中使用file库
 * 注意：这只是一个示例组件，需要在React项目中使用
 */

import React, { useState } from 'react';
import {
  fileToBase64,
  base64ToFile,
  imgCompress,
  imgConvert,
  checkFileType
} from 'js-use-core'; // 假设已经安装了js-use-core包

const FileUtilDemo = () => {
  const [base64Result, setBase64Result] = useState('');
  const [fileResult, setFileResult] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processInfo, setProcessInfo] = useState('');

  // 文件转Base64
  const handleFileToBase64 = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setBase64Result(base64);
    } catch (error) {
      console.error('文件转Base64失败:', error);
      alert(`转换失败: ${error.message}`);
    }
  };

  // Base64转文件
  const handleBase64ToFile = () => {
    if (!base64Result) {
      alert('请先转换文件为Base64');
      return;
    }

    try {
      const file = base64ToFile(base64Result);
      setFileResult(file);

      // 创建下载链接
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Base64转文件失败:', error);
      alert(`转换失败: ${error.message}`);
    }
  };

  // 图片压缩
  const handleImageCompress = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = checkFileType(file);
    if (!fileType.isImage) {
      alert('请选择图片文件');
      return;
    }

    // 显示原图
    setOriginalImage(URL.createObjectURL(file));
    setProcessedImage(null);
    setProcessInfo('');

    try {
      // 压缩图片
      const compressedFile = await imgCompress(file, {
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800
      });

      // 显示压缩后的图片
      setProcessedImage(URL.createObjectURL(compressedFile));
      setProcessInfo(`压缩后大小: ${(compressedFile.size / 1024).toFixed(2)} KB (原大小: ${(file.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error('图片压缩失败:', error);
      alert(`压缩失败: ${error.message}`);
    }
  };

  // 图片格式转换
  const handleImageConvert = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = checkFileType(file);
    if (!fileType.isImage) {
      alert('请选择图片文件');
      return;
    }

    // 显示原图
    setOriginalImage(URL.createObjectURL(file));
    setProcessedImage(null);
    setProcessInfo('');

    try {
      // 转换图片格式为WebP
      const convertedFile = await imgConvert(file, {
        format: 'webp',
        quality: 0.9
      });

      // 显示转换后的图片
      setProcessedImage(URL.createObjectURL(convertedFile));
      setProcessInfo(`转换为WebP格式，大小: ${(convertedFile.size / 1024).toFixed(2)} KB (原大小: ${(file.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error('图片格式转换失败:', error);
      alert(`转换失败: ${error.message}`);
    }
  };

  return (
    <div className="file-demo">
      <h1>file React 示例</h1>

      <div className="demo-section">
        <h2>文件转Base64</h2>
        <input type="file" onChange={handleFileToBase64} />
        {base64Result && (
          <div className="result">
            <h3>Base64结果:</h3>
            <div className="base64-preview">
              {base64Result.substring(0, 50)}...
            </div>
            <button onClick={handleBase64ToFile}>转换回文件并下载</button>
          </div>
        )}
        {fileResult && (
          <div className="result">
            <h3>文件信息:</h3>
            <p>名称: {fileResult.name}</p>
            <p>大小: {fileResult.size} 字节</p>
            <p>类型: {fileResult.type}</p>
          </div>
        )}
      </div>

      <div className="demo-section">
        <h2>图片处理</h2>
        <div className="image-tools">
          <div>
            <h3>图片压缩</h3>
            <input type="file" accept="image/*" onChange={handleImageCompress} />
            <button onClick={() => document.querySelector('input[type="file"]').click()}>选择图片压缩</button>
          </div>
          <div>
            <h3>图片格式转换</h3>
            <input type="file" accept="image/*" onChange={handleImageConvert} />
            <button onClick={() => document.querySelectorAll('input[type="file"]')[1].click()}>选择图片转换为WebP</button>
          </div>
        </div>

        {(originalImage || processedImage) && (
          <div className="image-preview">
            {originalImage && (
              <div className="preview-item">
                <h3>原图</h3>
                <img src={originalImage} alt="原图" />
              </div>
            )}
            {processedImage && (
              <div className="preview-item">
                <h3>处理后</h3>
                <img src={processedImage} alt="处理后" />
                <p>{processInfo}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .file-demo {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .demo-section {
          margin-bottom: 30px;
          border: 1px solid #eee;
          padding: 20px;
          border-radius: 5px;
        }
        h1 {
          color: #333;
        }
        h2 {
          color: #555;
          margin-top: 0;
        }
        button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 10px 15px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 14px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
        }
        input[type="file"] {
          margin: 10px 0;
        }
        .result {
          margin-top: 10px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .base64-preview {
          word-break: break-all;
          font-family: monospace;
          margin: 10px 0;
        }
        .image-tools {
          display: flex;
          gap: 20px;
        }
        .image-preview {
          display: flex;
          gap: 20px;
          margin-top: 20px;
        }
        .preview-item {
          flex: 1;
        }
        img {
          max-width: 100%;
          max-height: 300px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default FileUtilDemo;