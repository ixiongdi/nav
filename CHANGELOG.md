# 更新日志

本文件记录了稀饭导航项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/spec/v2.0.0.html)。

## [Unreleased]

### 计划中的功能
- 标签系统支持
- 书签分组功能
- 快捷键支持
- 主题切换功能
- 数据同步功能

## [1.0.0] - 2024-12-24

### 新增
- 🎉 首次发布稀饭导航 1.0.0
- ✨ 书签管理功能
  - 创建、编辑、删除书签
  - 文件夹管理和嵌套支持
  - 拖拽排序功能
- 🔍 智能搜索
  - 实时搜索书签标题和URL
  - 搜索结果高亮显示
- 📁 文件夹管理
  - 多层级文件夹结构
  - 文件夹展开/折叠
  - 右键菜单操作
- 💾 数据持久化
  - 基于 IndexedDB 的本地存储
  - 数据自动保存
  - 浏览器重启后数据恢复
- 📤 导入导出功能
  - 支持标准 HTML 书签格式导入
  - 兼容 Chrome、Firefox、Safari 等浏览器
  - 导出为标准 HTML 格式
- 🎨 现代化 UI
  - 基于 Element Plus 的美观界面
  - 响应式设计，支持移动设备
  - 书签卡片式布局
  - 网站图标自动获取
- 🛠 开发工具
  - TypeScript 类型安全
  - Vue 3 Composition API
  - Vite 快速构建
  - Prettier 代码格式化

### 技术栈
- Vue 3.5.19 (Composition API)
- TypeScript 5.9.2
- Vite 7.1.3
- Element Plus 2.10.7
- Dexie.js 4.2.0 (IndexedDB)
- UUID 11.1.0

### 开源准备
- 📄 完整的 README 文档
- 📋 贡献指南 (CONTRIBUTING.md)
- 🤝 行为准则 (CODE_OF_CONDUCT.md)
- 🔒 安全策略 (SECURITY.md)
- ⚖️ MIT 开源许可证
- 🔧 GitHub Actions CI/CD
- 📝 Issue 和 PR 模板
- 📚 完整的开发文档

## 版本说明

### 语义化版本规则

- **主版本号** (X.0.0): 不兼容的 API 修改
- **次版本号** (X.Y.0): 向下兼容的功能性新增
- **修订号** (X.Y.Z): 向下兼容的问题修正

### 更新类型

- **新增 (Added)**: 新功能
- **变更 (Changed)**: 对现有功能的变更
- **弃用 (Deprecated)**: 不久将被移除的功能
- **移除 (Removed)**: 已移除的功能
- **修复 (Fixed)**: Bug 修复
- **安全 (Security)**: 安全相关的修复

## 未来版本规划

### 1.1.0 (计划中)
- 标签系统
- 书签收藏夹
- 快捷键支持
- 主题切换

### 1.2.0 (计划中)
- 数据导入优化
- 批量操作功能
- 高级搜索过滤
- 性能优化

### 2.0.0 (远期规划)
- 数据云端同步
- 多用户支持
- 插件系统
- 移动端应用

---

**注意**: 此更新日志将在每次发布时更新。如果您发现任何遗漏或错误，请[提交 Issue](https://github.com/ixiongdi/nav/issues)。