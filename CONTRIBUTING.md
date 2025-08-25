# 贡献指南

感谢您对稀饭导航项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📖 改进文档
- 🔧 提交代码修复或新功能
- 💬 参与讨论

## 🚀 开始贡献

### 环境搭建

1. **Fork 项目**
   
   点击页面右上角的 "Fork" 按钮，将项目 fork 到您的 GitHub 账号下。

2. **克隆到本地**
   ```bash
   git clone https://github.com/ixiongdi/nav.git
   cd nav
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

## 📝 代码规范

### 编码标准

- **语言**: 使用 TypeScript，确保类型安全
- **组件**: 使用 Vue 3 Composition API 和 `<script setup>` 语法
- **样式**: 遵循 Element Plus 设计规范
- **格式化**: 使用 Prettier 进行代码格式化

### 命名规范

- **文件名**: 使用 kebab-case（如：`bookmark-list.vue`）
- **组件名**: 使用 PascalCase（如：`BookmarkList`）
- **变量/函数**: 使用 camelCase（如：`bookmarkList`）
- **常量**: 使用 UPPER_SNAKE_CASE（如：`MAX_BOOKMARKS`）

### 代码质量

- 确保所有 TypeScript 类型正确
- 为复杂函数添加注释
- 保持函数简洁，单一职责
- 使用有意义的变量和函数名

## 🔧 开发工作流

### 1. 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型说明：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更改
- `style`: 代码格式化，不影响代码逻辑
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**
```bash
git commit -m "feat(bookmarks): add bookmark search functionality"
git commit -m "fix(ui): resolve button alignment issue in header"
git commit -m "docs: update installation instructions"
```

### 2. 分支策略

- `main`: 主分支，稳定的生产代码
- `feature/*`: 新功能开发分支
- `fix/*`: Bug 修复分支
- `docs/*`: 文档更新分支

### 3. Pull Request 流程

1. **确保代码质量**
   ```bash
   # 格式化代码
   npm run format
   
   # 类型检查
   npm run build
   ```

2. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写详细的 PR 描述
   - 关联相关的 Issue
   - 请求代码审查

4. **代码审查**
   - 响应审查者的反馈
   - 及时修复提出的问题
   - 保持 PR 更新

## 🐛 报告 Bug

使用 [Bug Report 模板](https://github.com/ixiongdi/nav/issues/new?template=bug_report.md) 报告 Bug：

**包含信息：**
- 清晰的 Bug 描述
- 重现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器版本、操作系统等）
- 截图（如适用）

## 💡 功能建议

使用 [Feature Request 模板](https://github.com/ixiongdi/nav/issues/new?template=feature_request.md) 提出新功能：

**包含信息：**
- 功能的详细描述
- 使用场景
- 预期的用户体验
- 可能的实现方案

## 📖 文档贡献

- 修复文档中的错误
- 添加缺失的信息
- 改进现有文档的清晰度
- 添加使用示例

## 🔍 代码审查指南

### 作为审查者

- 保持建设性和友善的语调
- 关注代码质量、性能和可维护性
- 提供具体的改进建议
- 及时响应 PR

### 作为提交者

- 响应审查反馈
- 解释设计决策
- 及时修复问题
- 保持耐心和开放的心态

## 🎯 贡献领域

### 急需贡献的领域

- 🧪 **测试**: 增加单元测试和集成测试
- 🌐 **国际化**: 添加多语言支持
- 📱 **移动端优化**: 改善移动设备体验
- ⚡ **性能优化**: 提升应用性能
- 🔒 **安全性**: 增强数据安全保护

### 适合新手的任务

查找标有 `good first issue` 标签的 Issue，这些任务适合新手参与。

## 🏆 贡献者认可

- 所有贡献者将在 README 中得到认可
- 重要贡献者将获得维护者权限
- 定期发布贡献者统计和感谢

## 📞 获取帮助

如果您在贡献过程中遇到问题：

- 查看 [FAQ](docs/FAQ.md)
- 在 [Discussions](https://github.com/ixiongdi/nav/discussions) 中提问
- 通过 Issue 寻求帮助

## 📄 许可证

通过贡献代码，您同意您的贡献将根据 [MIT License](LICENSE) 进行许可。

---

再次感谢您的贡献！您的参与让稀饭导航变得更好！🙏