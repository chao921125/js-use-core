<template>
  <div class="app">
    <h1>🚀 js-use-core Vue 演示</h1>
    
    <div class="demo-grid">
      <!-- 全屏功能演示 -->
      <div class="demo-card">
        <h2>🖥️ 全屏功能</h2>
        
        <div 
          ref="fullscreenElement"
          class="fullscreen-demo"
          @click="handleElementFullscreen"
        >
          <h3>点击进入元素全屏</h3>
          <p>或使用下面的按钮控制全屏</p>
        </div>

        <div class="button-group">
          <button @click="requestFullscreen" :disabled="!fullscreenSupported">
            页面全屏
          </button>
          <button @click="requestElementFullscreen" :disabled="!fullscreenSupported">
            元素全屏
          </button>
          <button @click="exitFullscreen" :disabled="!fullscreenSupported">
            退出全屏
          </button>
        </div>

        <div class="status">
          <p>支持状态: {{ fullscreenSupported ? '✅ 支持' : '❌ 不支持' }}</p>
          <p>当前状态: {{ isFullscreen ? '🔲 全屏中' : '🔳 正常' }}</p>
          <p v-if="fullscreenPerformance.enterTime">
            进入耗时: {{ fullscreenPerformance.enterTime }}ms
          </p>
        </div>
      </div>
      
      <!-- 剪贴板功能演示 -->
      <div class="demo-card">
        <h2>📋 剪贴板功能</h2>
        
        <div class="input-group">
          <label>文本内容:</label>
          <input 
            v-model="clipboardText" 
            type="text" 
            placeholder="输入要复制的文本"
          />
        </div>

        <div class="input-group">
          <label>HTML 内容:</label>
          <textarea 
            v-model="clipboardHtml" 
            rows="3"
            placeholder="输入 HTML 内容"
          ></textarea>
        </div>

        <div 
          class="copyable-content"
          @click="copyElementContent"
        >
          <h4>可复制的内容</h4>
          <p>点击这个区域复制内容到剪贴板</p>
        </div>

        <div class="button-group">
          <button @click="copyText" :disabled="!clipboardSupported">
            复制文本
          </button>
          <button @click="copyHtml" :disabled="!clipboardSupported">
            复制 HTML
          </button>
          <button @click="readClipboard" :disabled="!clipboardSupported">
            读取剪贴板
          </button>
        </div>

        <div class="status">
          <p>API 支持: {{ clipboardSupported ? '✅ 支持' : '❌ 不支持' }}</p>
          <p>最后操作: {{ clipboardLastAction }}</p>
        </div>
      </div>
      
      <!-- 字体功能演示 -->
      <div class="demo-card">
        <h2>🔤 字体功能</h2>
        
        <div class="input-group">
          <label>字体名称:</label>
          <input 
            v-model="fontName" 
            type="text" 
            placeholder="输入字体名称"
          />
        </div>

        <div class="input-group">
          <label>字体 URL (可选):</label>
          <input 
            v-model="fontUrl" 
            type="text" 
            placeholder="输入字体文件 URL"
          />
        </div>

        <div 
          class="font-demo"
          :style="{ fontFamily: fontName }"
        >
          这是字体演示文本 - Font Demo Text
        </div>

        <div class="button-group">
          <button @click="checkFont">检查字体</button>
          <button @click="addFont">添加字体</button>
          <button @click="batchCheckFonts">批量检查</button>
        </div>

        <div class="status">
          <p>检查结果: {{ fontCheckResult }}</p>
          <p>检测时间: {{ fontLoadTime }}</p>
          <p v-if="fontLoadingStates.size > 0">
            加载状态: {{ Array.from(fontLoadingStates.entries()).map(([name, state]) => `${name}: ${state.status}`).join(', ') }}
          </p>
        </div>
      </div>
      
      <!-- 设备检测演示 -->
      <div class="demo-card">
        <h2>📱 设备检测</h2>
        
        <div class="button-group">
          <button @click="detectDevice">检测设备</button>
          <button @click="refreshDeviceInfo">刷新信息</button>
        </div>

        <div class="device-info">
          <div class="device-info-item">
            <div>设备类型</div>
            <div>{{ deviceInfo.type }}</div>
          </div>
          <div class="device-info-item">
            <div>操作系统</div>
            <div>{{ deviceInfo.os }}</div>
          </div>
          <div class="device-info-item">
            <div>浏览器</div>
            <div>{{ deviceInfo.browser }}</div>
          </div>
          <div class="device-info-item">
            <div>屏幕尺寸</div>
            <div>{{ deviceInfo.screen }}</div>
          </div>
        </div>
      </div>
      
      <!-- URL 功能演示 -->
      <div class="demo-card">
        <h2>🔗 URL 功能</h2>
        
        <div class="input-group">
          <label>URL 地址:</label>
          <input 
            v-model="urlInput" 
            type="text" 
            placeholder="输入 URL"
          />
        </div>

        <div class="input-group">
          <label>查询参数:</label>
          <div style="display: flex; gap: 10px;">
            <input 
              v-model="queryKey" 
              type="text" 
              placeholder="参数名"
              style="flex: 1;"
            />
            <input 
              v-model="queryValue" 
              type="text" 
              placeholder="参数值"
              style="flex: 1;"
            />
          </div>
        </div>

        <div class="button-group">
          <button @click="parseUrl">解析 URL</button>
          <button @click="addQuery">添加参数</button>
          <button @click="buildUrl">构建 URL</button>
        </div>

        <div class="status">
          <p>解析结果: {{ urlParseResult }}</p>
          <p>构建结果: {{ urlBuildResult }}</p>
        </div>
      </div>
      
      <!-- User Agent 解析演示 -->
      <div class="demo-card">
        <h2>🔍 User Agent 解析</h2>
        
        <div class="input-group">
          <label>User Agent 字符串:</label>
          <textarea 
            v-model="uaInput" 
            rows="3"
            placeholder="输入 User Agent 字符串"
          ></textarea>
        </div>

        <div class="button-group">
          <button @click="parseUA">解析 UA</button>
          <button @click="getCurrentUA">获取当前 UA</button>
          <button @click="compareUA">版本比较</button>
        </div>

        <div class="status">
          <p>浏览器: {{ uaParseResult.browser }}</p>
          <p>版本: {{ uaParseResult.version }}</p>
          <p>操作系统: {{ uaParseResult.os }}</p>
        </div>
      </div>
    </div>
    
    <!-- 消息提示 -->
    <div v-if="message.show" :class="['message', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import { 
  FullscreenManager, 
  ClipboardManager, 
  FontManager,
  UrlManager,
  DeviceDetector,
  UA
} from 'js-use-core';

export default {
  name: 'JsUseCoreDemo',
  
  data() {
    return {
      // 管理器实例
      fullscreenManager: null,
      clipboardManager: null,
      fontManager: null,
      urlManager: null,
      deviceDetector: null,
      
      // 全屏相关
      fullscreenSupported: false,
      isFullscreen: false,
      fullscreenPerformance: {},
      
      // 剪贴板相关
      clipboardSupported: false,
      clipboardText: 'Hello, js-use-core!',
      clipboardHtml: '<strong>粗体文本</strong> 和 <em>斜体文本</em>',
      clipboardLastAction: '无',
      
      // 字体相关
      fontName: 'Arial',
      fontUrl: '',
      fontCheckResult: '未检查',
      fontLoadTime: '-',
      fontLoadingStates: new Map(),
      
      // 设备检测相关
      deviceInfo: {
        type: '检测中...',
        os: '检测中...',
        browser: '检测中...',
        screen: '检测中...'
      },
      
      // URL 相关
      urlInput: 'https://example.com/api',
      queryKey: 'page',
      queryValue: '1',
      urlParseResult: '未解析',
      urlBuildResult: '-',
      
      // UA 相关
      uaInput: navigator.userAgent,
      uaParseResult: {
        browser: '未解析',
        version: '-',
        os: '-'
      },
      
      // 消息提示
      message: {
        show: false,
        text: '',
        type: 'success'
      }
    };
  },
  
  async mounted() {
    await this.initializeManagers();
  },
  
  beforeDestroy() {
    this.destroyManagers();
  },
  
  methods: {
    // 显示消息
    showMessage(text, type = 'success') {
      this.message = { show: true, text, type };
      setTimeout(() => {
        this.message.show = false;
      }, 3000);
    },
    
    // 初始化所有管理器
    async initializeManagers() {
      try {
        this.showMessage('正在初始化管理器...', 'warning');
        
        // 初始化全屏管理器
        if (FullscreenManager) {
          this.fullscreenManager = new FullscreenManager({
            enablePerformanceMonitoring: true,
            debug: true
          });
          
          await this.fullscreenManager.initialize();
          
          this.fullscreenManager.on('change', (data) => {
            this.isFullscreen = data.isFullscreen;
          });
          
          this.fullscreenManager.on('request', () => {
            this.fullscreenPerformance = this.fullscreenManager.performanceData;
          });
          
          this.fullscreenSupported = this.fullscreenManager.isSupported;
          this.isFullscreen = this.fullscreenManager.isFullscreen;
        }
        
        // 初始化剪贴板管理器
        if (ClipboardManager) {
          this.clipboardManager = new ClipboardManager({
            enablePermissionCheck: true,
            enableFallback: true,
            debug: true
          });
          
          await this.clipboardManager.initialize();
          
          this.clipboardManager.on('copy', (data) => {
            this.clipboardLastAction = `复制 ${data.type} (${data.size} 字节)`;
          });
          
          this.clipboardManager.on('read', (data) => {
            this.clipboardLastAction = `读取 ${data.type} (${data.size} 字节)`;
          });
          
          this.clipboardSupported = this.clipboardManager.isSupported;
        }
        
        // 初始化字体管理器
        if (FontManager) {
          this.fontManager = new FontManager({
            timeout: 3000,
            cache: true,
            debug: true
          });
          
          await this.fontManager.initialize();
          
          this.fontManager.on('fontLoaded', (data) => {
            this.showMessage(`字体 ${data.fontName} 加载成功`);
            this.fontLoadTime = data.loadTime + 'ms';
          });
          
          this.fontManager.on('fontLoadError', (data) => {
            this.showMessage(`字体 ${data.fontName} 加载失败`, 'error');
          });
        }
        
        // 初始化 URL 管理器
        if (UrlManager) {
          this.urlManager = new UrlManager();
        }
        
        // 初始化设备检测器
        if (DeviceDetector) {
          this.deviceDetector = new DeviceDetector();
          await this.deviceDetector.initialize();
          this.updateDeviceInfo();
        }
        
        this.showMessage('所有管理器初始化完成');
        
      } catch (error) {
        console.error('初始化管理器失败:', error);
        this.showMessage('初始化失败: ' + error.message, 'error');
      }
    },
    
    // 销毁所有管理器
    destroyManagers() {
      [
        this.fullscreenManager,
        this.clipboardManager,
        this.fontManager,
        this.deviceDetector
      ].forEach(manager => {
        if (manager && typeof manager.destroy === 'function') {
          manager.destroy();
        }
      });
    },
    
    // 全屏相关方法
    async requestFullscreen() {
      if (!this.fullscreenManager) return;
      try {
        await this.fullscreenManager.request();
        this.showMessage('已进入全屏模式');
      } catch (error) {
        this.showMessage('全屏失败: ' + error.message, 'error');
      }
    },
    
    async requestElementFullscreen() {
      if (!this.fullscreenManager) return;
      try {
        await this.fullscreenManager.request(this.$refs.fullscreenElement);
        this.showMessage('元素已进入全屏模式');
      } catch (error) {
        this.showMessage('元素全屏失败: ' + error.message, 'error');
      }
    },
    
    async exitFullscreen() {
      if (!this.fullscreenManager) return;
      try {
        await this.fullscreenManager.exit();
        this.showMessage('已退出全屏模式');
      } catch (error) {
        this.showMessage('退出全屏失败: ' + error.message, 'error');
      }
    },
    
    async handleElementFullscreen() {
      if (!this.fullscreenManager) return;
      try {
        await this.fullscreenManager.toggle(this.$refs.fullscreenElement);
      } catch (error) {
        this.showMessage('切换全屏失败: ' + error.message, 'error');
      }
    },
    
    // 剪贴板相关方法
    async copyText() {
      if (!this.clipboardManager) return;
      try {
        await this.clipboardManager.copyText(this.clipboardText);
        this.showMessage('文本已复制到剪贴板');
      } catch (error) {
        this.showMessage('复制失败: ' + error.message, 'error');
      }
    },
    
    async copyHtml() {
      if (!this.clipboardManager) return;
      try {
        await this.clipboardManager.copyHTML(this.clipboardHtml);
        this.showMessage('HTML 已复制到剪贴板');
      } catch (error) {
        this.showMessage('复制失败: ' + error.message, 'error');
      }
    },
    
    async readClipboard() {
      if (!this.clipboardManager) return;
      try {
        const text = await this.clipboardManager.readText();
        this.showMessage('剪贴板内容: ' + text.substring(0, 50) + (text.length > 50 ? '...' : ''));
      } catch (error) {
        this.showMessage('读取失败: ' + error.message, 'error');
      }
    },
    
    async copyElementContent() {
      if (!this.clipboardManager) return;
      try {
        const element = event.currentTarget;
        await this.clipboardManager.copyElement(element);
        this.showMessage('内容已复制到剪贴板');
      } catch (error) {
        this.showMessage('复制失败: ' + error.message, 'error');
      }
    },
    
    // 字体相关方法
    async checkFont() {
      if (!this.fontManager) return;
      try {
        const startTime = performance.now();
        const result = await this.fontManager.check(this.fontName);
        const endTime = performance.now();
        
        const font = result.allFonts[0];
        this.fontCheckResult = font.loaded ? '已加载' : '未加载';
        this.fontLoadTime = Math.round(endTime - startTime) + 'ms';
        
        this.showMessage(`字体检测完成: ${font.loaded ? '已加载' : '未加载'}`);
      } catch (error) {
        this.showMessage('字体检测失败: ' + error.message, 'error');
      }
    },
    
    addFont() {
      if (!this.fontManager) return;
      if (!this.fontUrl) {
        this.showMessage('请输入字体 URL', 'warning');
        return;
      }
      
      try {
        const success = this.fontManager.addFont(this.fontName, this.fontUrl);
        if (success) {
          this.showMessage('字体添加成功，正在加载...');
          // 更新字体加载状态
          this.fontLoadingStates = this.fontManager.getAllFontLoadStates();
        } else {
          this.showMessage('字体添加失败', 'error');
        }
      } catch (error) {
        this.showMessage('添加字体失败: ' + error.message, 'error');
      }
    },
    
    async batchCheckFonts() {
      if (!this.fontManager) return;
      try {
        const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana'];
        const result = await this.fontManager.check(fonts);
        const loadedCount = result.allFonts.filter(f => f.loaded).length;
        this.showMessage(`批量检测完成: ${loadedCount}/${fonts.length} 个字体已加载`);
      } catch (error) {
        this.showMessage('批量检测失败: ' + error.message, 'error');
      }
    },
    
    // 设备检测相关方法
    async detectDevice() {
      if (!this.deviceDetector) return;
      try {
        await this.deviceDetector.detect();
        this.updateDeviceInfo();
        this.showMessage('设备检测完成');
      } catch (error) {
        this.showMessage('设备检测失败: ' + error.message, 'error');
      }
    },
    
    refreshDeviceInfo() {
      this.updateDeviceInfo();
      this.showMessage('设备信息已刷新');
    },
    
    updateDeviceInfo() {
      if (!this.deviceDetector) return;
      
      this.deviceInfo = {
        type: this.deviceDetector.isMobile ? '移动设备' : 
              this.deviceDetector.isTablet ? '平板设备' : '桌面设备',
        os: this.deviceDetector.os?.name || '未知',
        browser: this.deviceDetector.browser?.name || '未知',
        screen: `${screen.width}x${screen.height}`
      };
    },
    
    // URL 相关方法
    parseUrl() {
      try {
        if (this.urlManager) {
          this.urlManager = new UrlManager(this.urlInput);
          const parsed = this.urlManager.parse();
          this.urlParseResult = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
          this.showMessage('URL 解析完成');
        }
      } catch (error) {
        this.showMessage('URL 解析失败: ' + error.message, 'error');
      }
    },
    
    addQuery() {
      try {
        if (this.urlManager && this.queryKey && this.queryValue) {
          this.urlManager.addQuery({ [this.queryKey]: this.queryValue });
          this.urlBuildResult = this.urlManager.toString();
          this.showMessage('查询参数已添加');
        }
      } catch (error) {
        this.showMessage('添加参数失败: ' + error.message, 'error');
      }
    },
    
    buildUrl() {
      try {
        if (this.urlManager) {
          this.urlBuildResult = this.urlManager.toString();
          this.showMessage('URL 构建完成');
        }
      } catch (error) {
        this.showMessage('URL 构建失败: ' + error.message, 'error');
      }
    },
    
    // UA 相关方法
    parseUA() {
      try {
        if (UA && this.uaInput) {
          const parsed = UA.parse(this.uaInput);
          this.uaParseResult = {
            browser: parsed.browser?.name || '未知',
            version: parsed.browser?.version || '未知',
            os: parsed.os?.name || '未知'
          };
          this.showMessage('User Agent 解析完成');
        }
      } catch (error) {
        this.showMessage('UA 解析失败: ' + error.message, 'error');
      }
    },
    
    getCurrentUA() {
      try {
        if (UA) {
          const current = UA.parse(navigator.userAgent);
          this.uaParseResult = {
            browser: current.browser?.name || '未知',
            version: current.browser?.version || '未知',
            os: current.os?.name || '未知'
          };
          this.showMessage('当前 UA 信息已获取');
        }
      } catch (error) {
        this.showMessage('获取 UA 失败: ' + error.message, 'error');
      }
    },
    
    compareUA() {
      try {
        if (UA) {
          const current = UA.parse(navigator.userAgent);
          const isModern = UA.satisfies(current, 'Chrome >= 80');
          this.showMessage(`浏览器版本检查: ${isModern ? '现代浏览器' : '旧版浏览器'}`);
        }
      } catch (error) {
        this.showMessage('版本比较失败: ' + error.message, 'error');
      }
    }
  }
};
</script>

<style scoped>
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.demo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.demo-card h2 {
  margin-bottom: 20px;
  color: #fff;
  font-size: 1.5rem;
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

input, textarea, select {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

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
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.fullscreen-demo {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 15px 0;
}

.fullscreen-demo:hover {
  transform: scale(1.02);
}

.font-demo {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin: 15px 0;
  text-align: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.copyable-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.copyable-content:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.device-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.device-info-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 6px;
  text-align: center;
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

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  max-width: 350px;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: linear-gradient(45deg, #4CAF50, #45a049);
}

.message.error {
  background: linear-gradient(45deg, #f44336, #d32f2f);
}

.message.warning {
  background: linear-gradient(45deg, #ff9800, #f57c00);
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
  }
  to {
    transform: translateX(0);
  }
}
</style>