# 贡献指南

[English](./CONTRIBUTING.en.md) | 简体中文

感谢您对 js-use-core 剪贴板功能的关注！我们欢迎所有形式的贡献。

## 贡献方式

### 🐛 报告 Bug

如果您发现了 bug，请通过以下方式报告：

1. 使用 [GitHub Issues](https://github.com/your-username/js-use-core/issues) 创建新的 issue
2. 在标题中标注 `[clipboard]` 前缀
3. 提供详细的复现步骤和错误信息

**Bug 报告模板：**

```markdown
## Bug 描述
简要描述 bug 的内容

## 复现步骤
1. 打开浏览器
2. 访问页面
3. 点击复制按钮
4. 观察错误

## 预期行为
描述您期望看到的行为

## 实际行为
描述实际发生的行为

## 环境信息
- 浏览器：Chrome 90.0.4430.212
- 操作系统：macOS 11.4
- js-use-core 版本：1.0.0
- 是否 HTTPS：是/否

## 错误信息
```
Error: Clipboard write failed
```

## 其他信息
任何其他相关信息
```

### 💡 功能请求

如果您有新的功能想法，请：

1. 使用 [GitHub Issues](https://github.com/your-username/js-use-core/issues) 创建新的 issue
2. 在标题中标注 `[clipboard]` 前缀
3. 详细描述功能需求和用例

### 🔧 代码贡献

#### 开发环境设置

1. Fork 项目
2. 克隆您的 fork：
   ```bash
   git clone https://github.com/your-username/js-use-core.git
   cd js-use-core
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 创建功能分支：
   ```bash
   git checkout -b feature/clipboard-improvement
   ```

#### 开发流程

1. **编写代码** - 在 `src/clipboard.ts` 中进行修改
2. **编写测试** - 在 `test/clipboard.test.ts` 中添加测试用例
3. **运行测试** - 确保所有测试通过：
   ```bash
   npm test
   ```
4. **类型检查** - 确保 TypeScript 类型正确：
   ```bash
   npm run type-check
   ```
5. **代码格式化** - 运行 ESLint：
   ```bash
   npm run lint
   ```

#### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 新功能
git commit -m "feat(clipboard): add new clipboard options"

# Bug 修复
git commit -m "fix(clipboard): fix clipboard permission on Safari"

# 文档更新
git commit -m "docs(clipboard): update API documentation"

# 性能优化
git commit -m "perf(clipboard): optimize permission checking"
```

#### 提交 Pull Request

1. 推送您的分支：
   ```bash
   git push origin feature/clipboard-improvement
   ```

2. 在 GitHub 上创建 Pull Request
3. 填写 PR 模板，描述您的更改
4. 等待代码审查

## 代码规范

### TypeScript 规范

- 使用 TypeScript 编写所有代码
- 提供完整的类型定义
- 使用接口定义 API 契约
- 避免使用 `any` 类型

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 行尾不加分号
- 使用 ES6+ 语法

### 测试规范

- 每个新功能都要有对应的测试
- 测试覆盖率不低于 80%
- 使用 Jest 作为测试框架
- 测试用例要清晰易懂

### 文档规范

- 所有公共 API 都要有 JSDoc 注释
- 更新 README.md 中的示例
- 添加类型定义文档

## 剪贴板功能特定指南

### 浏览器兼容性

- 确保新功能在所有支持的浏览器中工作
- 测试不同浏览器的权限处理
- 验证降级方案的正确性

### 权限处理

- 正确实现权限检查和请求
- 处理权限被拒绝的情况
- 提供用户友好的错误信息

### 安全考虑

- 验证剪贴板内容的安全性
- 实现内容长度限制
- 处理敏感信息

### 事件处理

- 正确管理事件监听器的生命周期
- 避免内存泄漏
- 提供事件清理机制

## 测试指南

### 单元测试

```javascript
// test/clipboard.test.ts
describe('Clipboard API', () => {
  test('should write text to clipboard', async () => {
    const text = 'Hello World';
    await expect(clipboard.writeText(text)).resolves.not.toThrow();
  });
  
  test('should read text from clipboard', async () => {
    const text = await clipboard.readText();
    expect(typeof text).toBe('string');
  });
  
  test('should check permission', async () => {
    const hasPermission = await clipboard.hasPermission();
    expect(typeof hasPermission).toBe('boolean');
  });
});
```

### 集成测试

```javascript
// test/clipboard.integration.test.ts
describe('Clipboard Integration', () => {
  test('should handle permission flow', async () => {
    // 模拟权限检查
    const hasPermission = await clipboard.hasPermission();
    
    if (!hasPermission) {
      const granted = await clipboard.requestPermission();
      expect(typeof granted).toBe('boolean');
    }
  });
  
  test('should handle clipboard events', (done) => {
    clipboard.on('change', (event) => {
      expect(event).toBeDefined();
      done();
    });
    
    // 触发剪贴板变化
    setTimeout(() => {
      clipboard.emit('change', {});
    }, 100);
  });
});
```

### 浏览器测试

```javascript
// test/clipboard.browser.test.ts
describe('Clipboard Browser Tests', () => {
  test('should work in Chrome', async () => {
    // Chrome 特定测试
  });
  
  test('should work in Firefox', async () => {
    // Firefox 特定测试
  });
  
  test('should work in Safari', async () => {
    // Safari 特定测试
  });
});
```

## 发布流程

### 版本管理

使用 [Semantic Versioning](https://semver.org/)：

- **MAJOR** - 不兼容的 API 更改
- **MINOR** - 向后兼容的新功能
- **PATCH** - 向后兼容的 bug 修复

### 发布步骤

1. 更新版本号：
   ```bash
   npm version patch|minor|major
   ```

2. 构建项目：
   ```bash
   npm run build
   ```

3. 运行测试：
   ```bash
   npm test
   ```

4. 发布到 npm：
   ```bash
   npm publish
   ```

5. 创建 GitHub Release

## 社区准则

### 行为准则

- 尊重所有贡献者
- 保持专业和友善的交流
- 欢迎新手提问
- 提供建设性的反馈

### 沟通渠道

- [GitHub Issues](https://github.com/your-username/js-use-core/issues) - Bug 报告和功能请求
- [GitHub Discussions](https://github.com/your-username/js-use-core/discussions) - 一般讨论
- [GitHub Pull Requests](https://github.com/your-username/js-use-core/pulls) - 代码贡献

## 常见问题

### Q: 如何测试剪贴板功能？

A: 由于浏览器安全限制，剪贴板功能需要在用户交互中测试。建议使用自动化测试工具如 Puppeteer 或 Playwright。

### Q: 如何处理权限被拒绝的情况？

A: 当权限被拒绝时，应该提供用户友好的提示，并建议用户手动复制或检查浏览器设置。

### Q: 如何确保跨浏览器兼容性？

A: 使用功能检测，为不同浏览器提供降级方案，并在多个浏览器中测试。

## 致谢

感谢所有为 js-use-core 剪贴板功能做出贡献的开发者！

---

如果您有任何问题，请随时联系我们。我们期待您的贡献！🎉 