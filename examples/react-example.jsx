import React, { useState, useEffect, useRef } from 'react';
import { 
  FullscreenManager, 
  ClipboardManager, 
  FontManager,
  UrlManager,
  DeviceDetector,
  UA
} from 'js-use-core';

// 全屏功能组件
function FullscreenDemo() {
  const [fullscreenManager, setFullscreenManager] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const initFullscreen = async () => {
      try {
        const manager = new FullscreenManager({
          enablePerformanceMonitoring: true,
          debug: true
        });
        
        await manager.initialize();
        
        manager.on('change', (data) => {
          setIsFullscreen(data.isFullscreen);
        });
        
        setFullscreenManager(manager);
        setIsSupported(manager.isSupported);
        setIsFullscreen(manager.isFullscreen);
      } catch (error) {
        console.error('初始化全屏管理器失败:', error);
      }
    };

    initFullscreen();

    return () => {
      if (fullscreenManager) {
        fullscreenManager.destroy();
      }
    };
  }, []);

  const handleRequestFullscreen = async () => {
    if (!fullscreenManager) return;
    try {
      await fullscreenManager.request();
    } catch (error) {
      console.error('进入全屏失败:', error);
    }
  };

  const handleRequestElementFullscreen = async () => {
    if (!fullscreenManager || !elementRef.current) return;
    try {
      await fullscreenManager.request(elementRef.current);
    } catch (error) {
      console.error('元素全屏失败:', error);
    }
  };

  const handleExitFullscreen = async () => {
    if (!fullscreenManager) return;
    try {
      await fullscreenManager.exit();
    } catch (error) {
      console.error('退出全屏失败:', error);
    }
  };

  return (
    <div className="demo-section">
      <h2>🖥️ 全屏功能演示</h2>
      
      <div 
        ref={elementRef}
        className="fullscreen-element"
        onClick={handleRequestElementFullscreen}
        style={{
          padding: '20px',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          borderRadius: '10px',
          textAlign: 'center',
          cursor: 'pointer',
          margin: '10px 0'
        }}
      >
        <h3>点击进入元素全屏</h3>
        <p>或使用下面的按钮控制全屏</p>
      </div>

      <div className="button-group">
        <button onClick={handleRequestFullscreen} disabled={!isSupported}>
          页面全屏
        </button>
        <button onClick={handleRequestElementFullscreen} disabled={!isSupported}>
          元素全屏
        </button>
        <button onClick={handleExitFullscreen} disabled={!isSupported}>
          退出全屏
        </button>
      </div>

      <div className="status">
        <p>支持状态: {isSupported ? '✅ 支持' : '❌ 不支持'}</p>
        <p>当前状态: {isFullscreen ? '🔲 全屏中' : '🔳 正常'}</p>
      </div>
    </div>
  );
}

// 剪贴板功能组件
function ClipboardDemo() {
  const [clipboardManager, setClipboardManager] = useState(null);
  const [textInput, setTextInput] = useState('Hello, js-use-core!');
  const [htmlInput, setHtmlInput] = useState('<strong>粗体文本</strong> 和 <em>斜体文本</em>');
  const [isSupported, setIsSupported] = useState(false);
  const [lastAction, setLastAction] = useState('无');

  useEffect(() => {
    const initClipboard = async () => {
      try {
        const manager = new ClipboardManager({
          enablePermissionCheck: true,
          enableFallback: true,
          debug: true
        });
        
        await manager.initialize();
        
        manager.on('copy', (data) => {
          setLastAction(`复制 ${data.type} (${data.size} 字节)`);
        });
        
        manager.on('read', (data) => {
          setLastAction(`读取 ${data.type} (${data.size} 字节)`);
        });
        
        setClipboardManager(manager);
        setIsSupported(manager.isSupported);
      } catch (error) {
        console.error('初始化剪贴板管理器失败:', error);
      }
    };

    initClipboard();

    return () => {
      if (clipboardManager) {
        clipboardManager.destroy();
      }
    };
  }, []);

  const handleCopyText = async () => {
    if (!clipboardManager) return;
    try {
      await clipboardManager.copyText(textInput);
      alert('文本已复制到剪贴板');
    } catch (error) {
      alert('复制失败: ' + error.message);
    }
  };

  const handleCopyHTML = async () => {
    if (!clipboardManager) return;
    try {
      await clipboardManager.copyHTML(htmlInput);
      alert('HTML 已复制到剪贴板');
    } catch (error) {
      alert('复制失败: ' + error.message);
    }
  };

  const handleReadClipboard = async () => {
    if (!clipboardManager) return;
    try {
      const text = await clipboardManager.readText();
      alert('剪贴板内容: ' + text.substring(0, 100));
    } catch (error) {
      alert('读取失败: ' + error.message);
    }
  };

  return (
    <div className="demo-section">
      <h2>📋 剪贴板功能演示</h2>
      
      <div className="input-group">
        <label>文本内容:</label>
        <input 
          type="text" 
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="输入要复制的文本"
        />
      </div>

      <div className="input-group">
        <label>HTML 内容:</label>
        <textarea 
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          placeholder="输入 HTML 内容"
          rows="3"
        />
      </div>

      <div className="button-group">
        <button onClick={handleCopyText} disabled={!isSupported}>
          复制文本
        </button>
        <button onClick={handleCopyHTML} disabled={!isSupported}>
          复制 HTML
        </button>
        <button onClick={handleReadClipboard} disabled={!isSupported}>
          读取剪贴板
        </button>
      </div>

      <div className="status">
        <p>API 支持: {isSupported ? '✅ 支持' : '❌ 不支持'}</p>
        <p>最后操作: {lastAction}</p>
      </div>
    </div>
  );
}

// 字体功能组件
function FontDemo() {
  const [fontManager, setFontManager] = useState(null);
  const [fontName, setFontName] = useState('Arial');
  const [fontUrl, setFontUrl] = useState('');
  const [checkResult, setCheckResult] = useState('未检查');
  const [loadTime, setLoadTime] = useState('-');

  useEffect(() => {
    const initFont = async () => {
      try {
        const manager = new FontManager({
          timeout: 3000,
          cache: true,
          debug: true
        });
        
        await manager.initialize();
        
        manager.on('fontLoaded', (data) => {
          alert(`字体 ${data.fontName} 加载成功`);
          setLoadTime(data.loadTime + 'ms');
        });
        
        manager.on('fontLoadError', (data) => {
          alert(`字体 ${data.fontName} 加载失败: ${data.error.message}`);
        });
        
        setFontManager(manager);
      } catch (error) {
        console.error('初始化字体管理器失败:', error);
      }
    };

    initFont();

    return () => {
      if (fontManager) {
        fontManager.destroy();
      }
    };
  }, []);

  const handleCheckFont = async () => {
    if (!fontManager) return;
    try {
      const startTime = performance.now();
      const result = await fontManager.check(fontName);
      const endTime = performance.now();
      
      const font = result.allFonts[0];
      setCheckResult(font.loaded ? '已加载' : '未加载');
      setLoadTime(Math.round(endTime - startTime) + 'ms');
      
      alert(`字体检测完成: ${font.loaded ? '已加载' : '未加载'}`);
    } catch (error) {
      alert('字体检测失败: ' + error.message);
    }
  };

  const handleAddFont = () => {
    if (!fontManager) return;
    if (!fontUrl) {
      alert('请输入字体 URL');
      return;
    }
    
    try {
      const success = fontManager.addFont(fontName, fontUrl);
      if (success) {
        alert('字体添加成功，正在加载...');
      } else {
        alert('字体添加失败');
      }
    } catch (error) {
      alert('添加字体失败: ' + error.message);
    }
  };

  const handleBatchCheck = async () => {
    if (!fontManager) return;
    try {
      const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana'];
      const result = await fontManager.check(fonts);
      const loadedCount = result.allFonts.filter(f => f.loaded).length;
      alert(`批量检测完成: ${loadedCount}/${fonts.length} 个字体已加载`);
    } catch (error) {
      alert('批量检测失败: ' + error.message);
    }
  };

  return (
    <div className="demo-section">
      <h2>🔤 字体功能演示</h2>
      
      <div className="input-group">
        <label>字体名称:</label>
        <input 
          type="text" 
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
          placeholder="输入字体名称"
        />
      </div>

      <div className="input-group">
        <label>字体 URL (可选):</label>
        <input 
          type="text" 
          value={fontUrl}
          onChange={(e) => setFontUrl(e.target.value)}
          placeholder="输入字体文件 URL"
        />
      </div>

      <div 
        className="font-demo"
        style={{
          fontFamily: fontName,
          padding: '20px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '10px 0'
        }}
      >
        这是字体演示文本 - Font Demo Text
      </div>

      <div className="button-group">
        <button onClick={handleCheckFont}>检查字体</button>
        <button onClick={handleAddFont}>添加字体</button>
        <button onClick={handleBatchCheck}>批量检查</button>
      </div>

      <div className="status">
        <p>检查结果: {checkResult}</p>
        <p>检测时间: {loadTime}</p>
      </div>
    </div>
  );
}

// 设备检测组件
function DeviceDemo() {
  const [deviceDetector, setDeviceDetector] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({
    type: '检测中...',
    os: '检测中...',
    browser: '检测中...',
    screen: '检测中...'
  });

  useEffect(() => {
    const initDevice = async () => {
      try {
        const detector = new DeviceDetector();
        await detector.initialize();
        
        setDeviceDetector(detector);
        updateDeviceInfo(detector);
      } catch (error) {
        console.error('初始化设备检测器失败:', error);
      }
    };

    initDevice();

    return () => {
      if (deviceDetector) {
        deviceDetector.destroy();
      }
    };
  }, []);

  const updateDeviceInfo = (detector) => {
    if (!detector) return;
    
    setDeviceInfo({
      type: detector.isMobile ? '移动设备' : 
            detector.isTablet ? '平板设备' : '桌面设备',
      os: detector.os?.name || '未知',
      browser: detector.browser?.name || '未知',
      screen: `${screen.width}x${screen.height}`
    });
  };

  const handleDetectDevice = async () => {
    if (!deviceDetector) return;
    try {
      await deviceDetector.detect();
      updateDeviceInfo(deviceDetector);
      alert('设备检测完成');
    } catch (error) {
      alert('设备检测失败: ' + error.message);
    }
  };

  const handleRefreshInfo = () => {
    updateDeviceInfo(deviceDetector);
    alert('设备信息已刷新');
  };

  return (
    <div className="demo-section">
      <h2>📱 设备检测演示</h2>
      
      <div className="button-group">
        <button onClick={handleDetectDevice}>检测设备</button>
        <button onClick={handleRefreshInfo}>刷新信息</button>
      </div>

      <div className="device-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '15px' }}>
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
          <div>设备类型</div>
          <div>{deviceInfo.type}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
          <div>操作系统</div>
          <div>{deviceInfo.os}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
          <div>浏览器</div>
          <div>{deviceInfo.browser}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
          <div>屏幕尺寸</div>
          <div>{deviceInfo.screen}</div>
        </div>
      </div>
    </div>
  );
}

// User Agent 解析组件
function UADemo() {
  const [uaInput, setUaInput] = useState(navigator.userAgent);
  const [parseResult, setParseResult] = useState({
    browser: '未解析',
    version: '-',
    os: '-'
  });

  const handleParseUA = () => {
    try {
      if (UA && uaInput) {
        const parsed = UA.parse(uaInput);
        setParseResult({
          browser: parsed.browser?.name || '未知',
          version: parsed.browser?.version || '未知',
          os: parsed.os?.name || '未知'
        });
        alert('User Agent 解析完成');
      }
    } catch (error) {
      alert('UA 解析失败: ' + error.message);
    }
  };

  const handleGetCurrentUA = () => {
    try {
      if (UA) {
        const current = UA.parse(navigator.userAgent);
        setParseResult({
          browser: current.browser?.name || '未知',
          version: current.browser?.version || '未知',
          os: current.os?.name || '未知'
        });
        alert('当前 UA 信息已获取');
      }
    } catch (error) {
      alert('获取 UA 失败: ' + error.message);
    }
  };

  const handleCompareUA = () => {
    try {
      if (UA) {
        const current = UA.parse(navigator.userAgent);
        const isModern = UA.satisfies(current, 'Chrome >= 80');
        alert(`浏览器版本检查: ${isModern ? '现代浏览器' : '旧版浏览器'}`);
      }
    } catch (error) {
      alert('版本比较失败: ' + error.message);
    }
  };

  return (
    <div className="demo-section">
      <h2>🔍 User Agent 解析演示</h2>
      
      <div className="input-group">
        <label>User Agent 字符串:</label>
        <textarea 
          value={uaInput}
          onChange={(e) => setUaInput(e.target.value)}
          placeholder="输入 User Agent 字符串"
          rows="3"
        />
      </div>

      <div className="button-group">
        <button onClick={handleParseUA}>解析 UA</button>
        <button onClick={handleGetCurrentUA}>获取当前 UA</button>
        <button onClick={handleCompareUA}>版本比较</button>
      </div>

      <div className="status">
        <p>浏览器: {parseResult.browser}</p>
        <p>版本: {parseResult.version}</p>
        <p>操作系统: {parseResult.os}</p>
      </div>
    </div>
  );
}

// 主应用组件
function App() {
  return (
    <div className="app" style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        🚀 js-use-core React 演示
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px' 
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '15px', 
          padding: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          <FullscreenDemo />
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '15px', 
          padding: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          <ClipboardDemo />
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '15px', 
          padding: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          <FontDemo />
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '15px', 
          padding: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          <DeviceDemo />
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '15px', 
          padding: '25px',
          backdropFilter: 'blur(10px)',
          gridColumn: '1 / -1'
        }}>
          <UADemo />
        </div>
      </div>
      
      <style jsx>{`
        .button-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 15px;
        }
        
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        button:disabled {
          background: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .input-group {
          margin-bottom: 15px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        
        input, textarea {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-sizing: border-box;
        }
        
        input::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .status {
          margin-top: 15px;
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
        }
        
        .status p {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
}

export default App;