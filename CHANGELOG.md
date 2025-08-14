# 更新日志

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.3.0] - 2024-01-XX

### 📚 文档大幅改进
- **全新架构文档** - 新增 `docs/ARCHITECTURE.md` 详细说明系统架构设计
- **快速开始指南** - 新增 `docs/GETTING_STARTED.md` 帮助新用户快速上手
- **完整 API 文档** - 大幅扩展和完善所有模块的 API 文档
  - 新增 `docs/device/API.md` - 设备检测完整 API 文档
  - 新增 `docs/ua/API.md` - User Agent 解析完整 API 文档  
  - 新增 `docs/url/API.md` - URL 管理完整 API 文档
- **综合示例** - 新增 `examples/comprehensive-usage.html` 展示所有功能的完整示例
- **文档格式优化** - 修复 API 文档中的 Markdown 格式问题，提高可读性

### 🔄 文档结构优化
- **重新组织文档结构** - 将文档分为指南、API 参考和示例三大类
- **改进导航** - 更新 README.md 中的文档链接，提供更清晰的导航
- **统一文档风格** - 统一所有文档的格式和风格，提高一致性

### 🎯 示例和教程
- **实用示例** - 新增涵盖所有功能模块的实际使用示例
- **框架集成** - 提供 React、Vue 2/3、原生 JavaScript 的集成示例
- **最佳实践演示** - 在示例中展示推荐的使用模式和最佳实践

### 🛠️ 开发体验改进
- **更好的类型定义** - 完善所有 API 的 TypeScript 类型定义文档
- **错误处理指南** - 详细说明各种错误情况的处理方法
- **调试技巧** - 提供调试和故障排除的实用技巧

## [1.3.0] - 2024-01-XX

### 🎉 新增
- **自动初始化功能** - 所有管理器现在支持自动初始化，无需手动调用 `initialize()` 方法
- **ready() 方法** - 新增便捷方法等待初始化完成
- **更详细的状态信息** - `getStatus()` 方法现在包含 `initializing` 状态
- **自动初始化演示** - 新增 `examples/auto-initialization-demo.html` 演示文件
- **完善的文档** - 新增自动初始化功能文档和最佳实践指南

### 🔄 变更
- **BaseManager 架构升级** - 支持自动初始化机制
- **错误处理优化** - 初始化错误现在在使用时抛出，提供更好的调试体验
- **性能优化** - 初始化过程不再阻塞构造函数执行

### 🛠️ 修复
- **类型错误修复** - 修复 `src/url/parser.ts` 中的 TypeScript 类型错误
- **Promise 拒绝处理** - 修复自动初始化可能导致的未处理 Promise 拒绝问题

### 📚 文档
- **README 更新** - 更新主要文档以反映自动初始化功能
- **迁移指南** - 新增详细的迁移指南 `MIGRATION_GUIDE.md`
- **最佳实践** - 新增最佳实践文档 `docs/BEST_PRACTICES.md`
- **自动初始化文档** - 新增专门的自动初始化功能文档

### ⚠️ 向后兼容性
- **完全向后兼容** - 现有代码无需修改，仍然可以手动调用 `initialize()`
- **API 保持不变** - 所有现有 API 保持不变，只是使用更加简便

### 🧪 测试
- **新增测试** - 添加自动初始化功能的专门测试
- **测试更新** - 更新现有测试以适应新的自动初始化机制

## [1.2.1] - 2024-01-XX

### 🛠️ 修复
- 修复构建配置问题
- 优化类型定义

### 📚 文档
- 完善 API 文档
- 更新使用示例

## [1.2.0] - 2024-01-XX

### 🎉 新增
- **统一架构** - 基于 BaseManager 的统一管理架构
- **TypeScript 支持** - 完整的类型定义
- **错误处理系统** - 统一的错误处理和降级方案
- **性能监控** - 内置性能监控和缓存机制
- **事件系统** - 轻量级事件发射器

### 📦 模块
- **FullscreenManager** - 全屏功能管理
- **ClipboardManager** - 剪贴板操作管理
- **FontManager** - 字体加载和管理
- **FileManager** - 文件处理功能
- **ImageManager** - 图像处理功能
- **UrlManager** - URL 操作和解析
- **DeviceDetector** - 设备检测功能
- **UAManager** - User Agent 解析

### 🔧 核心功能
- **BaseManager** - 所有管理器的基类
- **ErrorHandler** - 统一错误处理
- **EventEmitter** - 事件系统
- **Logger** - 日志记录
- **Cache** - 智能缓存管理

## [1.1.0] - 2023-XX-XX

### 🎉 新增
- 基础功能模块
- 简单的 API 接口

### 🛠️ 修复
- 初始版本的 bug 修复

## [1.0.0] - 2023-XX-XX

### 🎉 新增
- 项目初始版本
- 基础的工具函数

---

## 版本说明

### 语义化版本控制

本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) 规范：

- **主版本号 (MAJOR)**：当你做了不兼容的 API 修改
- **次版本号 (MINOR)**：当你做了向下兼容的功能性新增
- **修订号 (PATCH)**：当你做了向下兼容的问题修正

### 版本类型说明

- 🎉 **新增 (Added)** - 新功能
- 🔄 **变更 (Changed)** - 对现有功能的变更
- 🗑️ **废弃 (Deprecated)** - 即将移除的功能
- ❌ **移除 (Removed)** - 已移除的功能
- 🛠️ **修复 (Fixed)** - 任何 bug 修复
- 🔒 **安全 (Security)** - 安全相关的修复

### 发布计划

- **主版本** - 每年 1-2 次重大更新
- **次版本** - 每季度功能更新
- **修订版本** - 根据需要发布 bug 修复

### 支持政策

- **当前版本** - 完全支持，包括新功能和 bug 修复
- **前一个主版本** - 仅 bug 修复和安全更新
- **更早版本** - 不再维护，建议升级

### 升级建议

1. **补丁版本** - 可以安全升级，只包含 bug 修复
2. **次版本** - 建议升级，包含新功能但向后兼容
3. **主版本** - 需要仔细评估，可能包含破坏性变更

### 获取更新

- **npm**: `npm update js-use-core`
- **yarn**: `yarn upgrade js-use-core`
- **pnpm**: `pnpm update js-use-core`

### 反馈和建议

如果你有任何问题或建议，请：

1. 查看 [GitHub Issues](https://github.com/chao921125/js-use-core/issues)
2. 提交新的 Issue 或 Pull Request
3. 参与 [Discussions](https://github.com/chao921125/js-use-core/discussions)

感谢你使用 js-use-core！