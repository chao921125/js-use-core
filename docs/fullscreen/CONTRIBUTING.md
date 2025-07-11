# 贡献指南

[English](./CONTRIBUTING.en.md) | 简体中文

感谢您对 js-use-core 全屏功能的关注！我们欢迎所有形式的贡献。

## 贡献方式

### 🐛 报告 Bug

如果您发现了 bug，请通过以下方式报告：

1. 使用 [GitHub Issues](https://github.com/your-username/js-use-core/issues) 创建新的 issue
2. 在标题中标注 `[fullscreen]` 前缀
3. 提供详细的复现步骤和错误信息

**Bug 报告模板：**

```markdown
## Bug 描述
简要描述 bug 的内容

## 复现步骤
1. 打开浏览器
2. 访问页面
3. 点击全屏按钮
4. 观察错误

## 预期行为
描述您期望看到的行为

## 实际行为
描述实际发生的行为

## 环境信息
- 浏览器：Chrome 90.0.4430.212
- 操作系统：macOS 11.4
- js-use-core 版本：1.0.0

## 错误信息
```
Error: Fullscreen request failed
```

## 其他信息
任何其他相关信息
```

### 💡 功能请求

如果您有新的功能想法，请：

1. 使用 [GitHub Issues](https://github.com/your-username/js-use-core/issues) 创建新的 issue
2. 在标题中标注 `[fullscreen]` 前缀
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
   git checkout -b feature/fullscreen-improvement
   ```

#### 开发流程

1. **编写代码** - 在 `src/fullscreen.ts` 中进行修改
2. **编写测试** - 在 `test/fullscreen.test.ts` 中添加测试用例
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
git commit -m "feat(fullscreen): add new fullscreen options"

# Bug 修复
git commit -m "fix(fullscreen): fix fullscreen exit on Safari"

# 文档更新
git commit -m "docs(fullscreen): update API documentation"

# 性能优化
git commit -m "perf(fullscreen): optimize event listener management"
```

#### 提交 Pull Request

1. 推送您的分支：
   ```bash
   git push origin feature/fullscreen-improvement
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

## 全屏功能特定指南

### 浏览器兼容性

- 确保新功能在所有支持的浏览器中工作
- 测试不同浏览器的前缀处理
- 验证降级方案的正确性

### 事件处理

- 正确管理事件监听器的生命周期
- 避免内存泄漏
- 提供事件清理机制

### 错误处理

- 提供有意义的错误信息
- 实现优雅的降级方案
- 处理权限被拒绝的情况

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

## 致谢

感谢所有为 js-use-core 全屏功能做出贡献的开发者！

---

如果您有任何问题，请随时联系我们。我们期待您的贡献！🎉 