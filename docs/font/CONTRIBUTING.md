# 贡献指南

> 返回 [主说明文档](../README.md)

感谢您考虑为 font-load-check 做出贡献！以下是一些指导方针，可以帮助您开始。

## 开发环境设置

1. Fork 这个仓库
2. 克隆您的 fork：`git clone https://github.com/YOUR_USERNAME/font-load-check.git`
3. 安装依赖：`npm install` 或 `pnpm install`
4. 创建一个新分支：`git checkout -b feature/your-feature-name`

## 开发流程

### 开发模式

运行以下命令启动开发模式，它将监视文件更改并自动重新构建：

```bash
npm run dev
```

### 构建库

要构建库，请运行：

```bash
npm run build
```

这将在 `dist` 目录中创建生产就绪的文件。

### 运行测试

运行测试：

```bash
npm test
```

运行带有覆盖率报告的测试：

```bash
npm run test:coverage
```

## 提交指南

### 提交消息

请使用清晰的提交消息，描述您的更改。建议使用以下格式：

```
feat: 添加了新功能 X
fix: 修复了问题 Y
docs: 更新了文档 Z
test: 添加了测试用例
refactor: 重构了代码
```

### 拉取请求流程

1. 确保您的代码通过所有测试
2. 更新相关文档
3. 提交您的更改：`git commit -am 'feat: 添加了一些功能'`
4. 推送到您的分支：`git push origin feature/your-feature-name`
5. 提交拉取请求到主仓库

## 代码风格

- 遵循现有的代码风格和模式
- 使用 TypeScript 类型
- 为新功能添加测试
- 确保代码通过所有现有测试

## 报告问题

如果您发现问题但没有时间修复它，请在 GitHub 上创建一个问题，包括：

- 问题的简短描述
- 重现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器、操作系统等）

## 功能请求

如果您有新功能的想法，请创建一个问题，描述该功能以及它将如何工作。

## 许可证

通过贡献您的代码，您同意您的贡献将根据项目的 MIT 许可证进行许可。 