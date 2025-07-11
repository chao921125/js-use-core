import React, { useState } from 'react';
import { useFontCheck, createFont } from 'js-use-core';

// 基本使用示例
function BasicExample() {
  const { results, loading, error } = useFontCheck(['Arial', 'Helvetica', 'Times New Roman', 'NonExistentFont']);
  
  if (loading) return <div>检查中...</div>;
  if (error) return <div>发生错误: {error.message}</div>;
  
  // 确保结果是数组
  const fontResults = Array.isArray(results) ? results : [results];
  
  return (
    <div className="example-section">
      <h2>基本使用</h2>
      <div>
        {fontResults.map((font, index) => (
          <div key={index} className="font-item">
            <span style={{ fontFamily: font.name }} className="font-sample">Aa</span>
            <span className="font-name">{font.name}</span>
            <span className={`font-status ${font.loaded ? 'loaded' : 'not-loaded'}`}>
              {font.loaded ? '已加载' : '未加载'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 自定义检查组件
function CustomFontCheck() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const checkFonts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const checker = createFont({ timeout: 3000 });
      const fontResults = await checker.check(['Arial', 'Helvetica', 'NonExistentFont']);
      setResults(Array.isArray(fontResults) ? fontResults : [fontResults]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('检查字体时发生错误'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="example-section">
      <h2>自定义检查</h2>
      <button onClick={checkFonts} className="check-button">
        检查自定义字体
      </button>
      
      {loading && <div>检查中...</div>}
      {error && <div className="error">错误: {error.message}</div>}
      
      {!loading && results.length > 0 && (
        <div className="results-container">
          {results.map((font, index) => (
            <div key={index} className="font-item">
              <span style={{ fontFamily: font.name }} className="font-sample">Aa</span>
              <span className="font-name">{font.name}</span>
              <span className={`font-status ${font.loaded ? 'loaded' : 'not-loaded'}`}>
                {font.loaded ? '已加载' : '未加载'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 主应用组件
export default function ReactExample() {
  return (
    <div className="font-checker-example">
      <h1>React 字体加载检查示例</h1>
      
      {/* 基本Hook使用 */}
      <BasicExample />
      
      {/* 自定义检查 */}
      <CustomFontCheck />
      
      {/* 样式 */}
      <style jsx>{`
        .font-checker-example {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .example-section {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 8px;
          background-color: #f5f5f5;
        }
        
        .font-item {
          display: flex;
          align-items: center;
          padding: 10px;
          margin-bottom: 10px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .font-sample {
          font-size: 24px;
          margin-right: 15px;
          width: 40px;
          text-align: center;
        }
        
        .font-name {
          flex: 1;
          font-weight: 500;
        }
        
        .font-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .loaded {
          background-color: #e6f7e6;
          color: #2e7d32;
        }
        
        .not-loaded {
          background-color: #ffebee;
          color: #c62828;
        }
        
        .check-button {
          background-color: #1976d2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 15px;
        }
        
        .check-button:hover {
          background-color: #1565c0;
        }
        
        .results-container {
          margin-top: 15px;
          background-color: white;
          border-radius: 4px;
          padding: 10px;
        }
        
        .error {
          color: #c62828;
          margin: 10px 0;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}