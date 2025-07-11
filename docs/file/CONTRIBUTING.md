# 贡献指南

感谢您考虑为 file 项目做出贡献！这个文档提供了一些指导方针和最佳实践，以帮助您的贡献过程更加顺利。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告 Bug](#报告-bug)
  - [功能请求](#功能请求)
  - [提交代码](#提交代码)
- [开发流程](#开发流程)
  - [环境设置](#环境设置)
  - [代码风格](#代码风格)
  - [测试](#测试)
- [提交 Pull Request](#提交-pull-request)
- [发布流程](#发布流程)

## 行为准则

本项目采用开放、尊重和包容的态度。我们期望所有参与者：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性的批评
- 关注对社区最有利的事情

## 如何贡献

### 报告 Bug

如果您发现了 bug，请通过 GitHub Issues 报告，并包含以下信息：

1. 问题的简短描述
2. 重现步骤
3. 预期行为
4. 实际行为
5. 环境信息（浏览器、操作系统、Node.js 版本等）
6. 如果可能，提供最小复现示例

### 功能请求

如果您希望添加新功能或改进现有功能，请通过 GitHub Issues 提交功能请求，并包含：

1. 功能的详细描述
2. 使用场景和动机
3. 可能的实现方式（如果有）

### 提交代码

1. Fork 项目仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 开发流程

### 环境设置

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/file.git
   cd file
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 构建项目：
   ```bash
   npm run build
   ```

### 代码风格

我们使用 ESLint 和 TypeScript 来保持代码质量和一致性。在提交代码前，请确保：

1. 运行 lint 检查：
   ```bash
   npm run lint
   ```

2. 修复可自动修复的问题：
   ```bash
   npm run lint:fix
   ```

### 测试

为确保代码质量，请为您的更改添加适当的测试：

1. 运行测试：
   ```bash
   npm test
   ```

2. 检查测试覆盖率：
   ```bash
   npm run test:coverage
   ```

## 提交 Pull Request

1. 确保您的代码通过了所有测试
2. 更新文档以反映您的更改（如果适用）
3. 提交 Pull Request 时，请提供清晰的描述：
   - 您解决了什么问题
   - 您的实现方式
   - 任何需要审阅者特别注意的地方

## 发布流程

项目维护者负责发布新版本。如果您是维护者，请按照以下步骤发布：

1. 更新版本号（遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)）：
   ```bash
   npm version patch|minor|major
   ```

2. 构建项目：
   ```bash
   npm run build
   ```

3. 发布到 npm：
   ```bash
   npm publish
   ```

4. 创建 GitHub Release，包含版本更新日志

---

再次感谢您的贡献！如果您有任何问题，请随时在 Issues 中提问。 