# 贡献指南

感谢你对 js-use-core 项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、测试、问题报告和功能建议。

## 🤝 贡献方式

### 1. 报告问题 (Issues)

如果你发现了 bug 或有功能建议，请：

1. 先搜索现有的 [Issues](https://github.com/chao921125/js-use-core/issues) 确认问题未被报告
2. 使用合适的 Issue 模板创建新的 Issue
3. 提供详细的信息，包括：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（浏览器、版本等）
   - 相关代码示例

### 2. 提交代码 (Pull Requests)

我们欢迎代码贡献！请遵循以下流程：

1. Fork 项目到你的 GitHub 账户
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 进行开发并确保代码质量
4. 提交变更：`git commit -m "feat: add your feature"`
5. 推送到你的分支：`git push origin feature/your-feature-name`
6. 创建 Pull Request

### 3. 改进文档

文档改进同样重要：

- 修复错别字和语法错误
- 改进现有文档的清晰度
- 添加缺失的文档
- 翻译文档到其他语言
- 添加使用示例

### 4. 参与讨论

在 [GitHub Discussions](https://github.com/chao921125/js-use-core/discussions) 中：

- 分享使用经验
- 提出功能建议
- 帮助其他用户解决问题
- 参与项目规划讨论

## 🛠️ 开发环境设置

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.14.18 或 yarn >= 3.0.0 或 pnpm
- Git

### 克隆项目

```bash
git clone https://github.com/chao921125/js-use-core.git
cd js-use-core
```

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 开发脚本

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建项目
npm run build

# 运行测试
npm run test

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 代码检查
npm run lint

# 自动修复代码风格问题
npm run lint:fix

# 类型检查
npm run type-check

# 监听模式类型检查
npm run type-check:watch

# 完整验证（推荐在提交前运行）
npm run validate
```

## 📝 代码规范

### 代码风格

我们使用 ESLint 和 TypeScript 来确保代码质量：

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置的代码风格
- 使用 2 个空格缩进
- 使用单引号
- 行末不加分号（除非必要）
- 最大行长度 100 字符

### 命名规范

- **文件名**：使用 kebab-case（如 `clipboard-manager.ts`）
- **类名**：使用 PascalCase（如 `ClipboardManager`）
- **方法和变量**：使用 camelCase（如 `copyText`）
- **常量**：使用 UPPER_SNAKE_CASE（如 `DEFAULT_TIMEOUT`）
- **接口**：使用 PascalCase，可选择性添加 `I` 前缀（如 `ClipboardOptions`）

### 注释规范

```typescript
/**
 * 复制文本到剪贴板
 * @param text 要复制的文本内容
 * @param options 复制选项
 * @returns Promise<boolean> 复制是否成功
 * @throws {Error} 当浏览器不支持或权限被拒绝时抛出错误
 * @example
 * ```typescript
 * const clipboard = new ClipboardManager();
 * await clipboard.copyText('Hello World!');
 * ```
 */
async copyText(text: string, options?: CopyOptions): Promise<boolean> {
  // 实现代码
}
```

## 🏗️ 项目架构

### 目录结构

```
js-use-core/
├── src/                    # 源代码
│   ├── core/              # 核心模块
│   ├── clipboard/         # 剪贴板模块
│   ├── fullscreen/        # 全屏模块
│   ├── font/              # 字体模块
│   ├── file/              # 文件模块
│   ├── device/            # 设备检测模块
│   ├── url/               # URL 模块
│   ├── ua/                # User Agent 模块
│   ├── utils/             # 工具函数
│   └── index.ts           # 主入口文件
├── test/                  # 测试文件
├── docs/                  # 文档
├── examples/              # 示例文件
├── dist/                  # 构建输出
└── types/                 # 类型定义
```

### 模块设计原则

1. **单一职责**：每个模块只负责一个特定功能
2. **统一架构**：所有管理器继承自 `BaseManager`
3. **类型安全**：完整的 TypeScript 类型定义
4. **错误处理**：统一的错误处理机制
5. **可测试性**：易于单元测试和集成测试

### 添加新功能

如果你想添加新功能，请：

1. 在相应模块目录下创建文件
2. 继承 `BaseManager` 类（如果是管理器）
3. 实现必要的接口和方法
4. 添加完整的类型定义
5. 编写单元测试
6. 更新文档

## 🧪 测试

### 测试框架

我们使用 Jest 作为测试框架：

- 单元测试：测试单个函数或类
- 集成测试：测试模块间的交互
- 端到端测试：测试完整的用户场景

### 编写测试

```typescript
// test/clipboard/clipboard-manager.test.ts
import { ClipboardManager } from '../../src/clipboard/clipboard-manager';

describe('ClipboardManager', () => {
  let manager: ClipboardManager;

  beforeEach(() => {
    manager = new ClipboardManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('copyText', () => {
    it('should copy text successfully', async () => {
      const text = 'test text';
      const result = await manager.copyText(text);
      expect(result).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // 模拟错误情况
      jest.spyOn(navigator.clipboard, 'writeText')
        .mockRejectedValue(new Error('Permission denied'));

      await expect(manager.copyText('test'))
        .rejects.toThrow('Permission denied');
    });
  });
});
```

### 测试覆盖率

我们要求：

- 单元测试覆盖率 >= 80%
- 核心功能覆盖率 >= 90%
- 新增代码必须有对应测试

## 📚 文档

### 文档类型

1. **API 文档**：详细的 API 说明和示例
2. **指南文档**：使用指南和最佳实践
3. **示例代码**：实际使用示例
4. **架构文档**：系统设计和架构说明

### 文档规范

- 使用 Markdown 格式
- 提供中英文版本（优先中文）
- 包含代码示例
- 保持文档与代码同步

### 文档结构

```markdown
# 模块名称

简短描述

## 功能特性

- 特性1
- 特性2

## 快速开始

```javascript
// 基础使用示例
```

## API 文档

### 类名

#### 构造函数

#### 方法

#### 属性

## 使用示例

## 浏览器兼容性

## 注意事项
```

## 🚀 发布流程

### 版本管理

我们遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 发布检查清单

在发布新版本前，请确保：

- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新
- [ ] 构建成功
- [ ] 示例正常工作

### 发布命令

```bash
# 修订版本
npm run release:patch

# 次版本
npm run release:minor

# 主版本
npm run release:major
```

## 🎯 贡献指导

### 适合新手的任务

如果你是第一次贡献，可以从这些任务开始：

- 修复文档中的错别字
- 改进代码注释
- 添加单元测试
- 修复标记为 "good first issue" 的问题
- 改进示例代码

### 高级贡献

对于有经验的贡献者：

- 添加新功能模块
- 性能优化
- 架构改进
- 复杂 bug 修复
- 新平台支持

### 贡献认可

我们会在以下地方认可贡献者：

- README.md 中的贡献者列表
- 发布说明中的感谢
- GitHub 贡献者页面

## 📞 获取帮助

如果你在贡献过程中遇到问题：

1. 查看现有的 Issues 和 Discussions
2. 在 [GitHub Discussions](https://github.com/chao921125/js-use-core/discussions) 中提问
3. 创建新的 Issue 寻求帮助
4. 联系维护者

## 📋 Pull Request 检查清单

提交 PR 前请确认：

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 测试全部通过
- [ ] 更新了相关文档
- [ ] 提交信息清晰明确
- [ ] PR 描述详细说明了变更内容
- [ ] 解决了相关的 Issue（如果有）

## 🏷️ 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式变更（不影响代码运行）
- `refactor`: 重构（既不是新增功能，也不是修复 bug）
- `perf`: 性能优化
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

### 示例

```
feat(clipboard): add HTML content support

Add support for copying and reading HTML content from clipboard.
This includes new methods copyHTML() and readHTML().

Closes #123
```

## 🎉 感谢

感谢所有为 js-use-core 项目做出贡献的开发者！你们的贡献让这个项目变得更好。

如果你有任何问题或建议，请随时联系我们。我们期待你的贡献！