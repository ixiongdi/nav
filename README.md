# 稀饭导航 (XiFan Nav) - 个人导航书签管理应用

一个基于 Vue 3 和 TypeScript 的现代化导航书签管理应用，支持本地存储、智能搜索、数据导入导出等功能。

## 📸 项目截图

### 主界面

![稀饭导航主界面](docs/images/main-interface.jpeg)

**界面特色：**
- 🎨 **优雅设计** - 采用渐变背景和毛玻璃效果，界面现代美观
- 🔍 **智能搜索** - 顶部醒目搜索栏，支持快捷键 `Ctrl+K` 快速定位
- 📁 **文件夹管理** - 左侧清晰的文件夹树状结构，支持多层级管理
- 🎯 **操作便捷** - 导入、导出、新增、清空等核心功能一目了然
- 💡 **友好提示** - 空状态界面友好引导，新用户上手简单

### 添加书签

![添加书签界面](docs/images/add-bookmark.jpeg)

### 书签管理

![书签管理界面](docs/images/bookmark-management.jpeg)

## ✨ 功能特性

- 📁 **文件夹管理** - 支持多层级文件夹结构，轻松组织书签
- 🔍 **智能搜索** - 快速搜索书签标题和URL
- 💾 **本地存储** - 使用IndexedDB实现数据本地持久化
- 📤 **数据导入** - 支持从浏览器导出的HTML书签文件导入
- 📥 **数据导出** - 导出为标准HTML格式，兼容各大浏览器
- 🎨 **现代UI** - 基于Element Plus的美观界面
- ⚡ **快速响应** - Vue 3组合式API带来的高性能体验
- 🔒 **类型安全** - 完整的TypeScript类型定义

## 🛠 技术栈

- **前端框架**: Vue 3.5.19
- **开发语言**: TypeScript 5.9.2
- **构建工具**: Vite 7.1.3
- **UI组件库**: Element Plus 2.10.7
- **数据存储**: Dexie.js (IndexedDB封装)
- **唯一标识**: UUID 11.1.0
- **代码格式化**: Prettier 3.6.2

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/ixiongdi/nav.git
   cd nav
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   
   本地开发：打开浏览器访问 `http://localhost:5173`
   在线体验：[https://nav.xifan.uno](https://nav.xifan.uno)

## 📝 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run format` - 格式化代码

## 📱 使用方法

### 基本操作

1. **添加书签**: 点击「添加书签」按钮，输入标题和URL
2. **创建文件夹**: 点击「新建文件夹」按钮，输入文件夹名称
3. **搜索书签**: 在搜索框中输入关键词快速查找
4. **编辑/删除**: 右键点击书签或文件夹进行编辑或删除

### 数据导入导出

- **导入书签**: 从浏览器导出HTML格式的书签文件，然后使用应用内的导入功能
- **导出书签**: 将当前书签导出为HTML格式，可导入到其他浏览器

## 🏗 项目结构

```
src/
├── types/
│   └── bookmark.ts          # 书签数据类型定义
├── utils/
│   ├── bookmarks.ts         # 书签操作逻辑
│   ├── database.ts          # Dexie数据库封装
│   └── parser.ts            # HTML解析工具
├── App.vue                  # 主组件
└── main.ts                  # 应用入口
```

## 🤝 贡献指南

我们欢迎任何形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细的贡献指南。

### 开发流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🐛 问题反馈

如果您发现了bug或有功能建议，请在 [Issues](https://github.com/ixiongdi/nav/issues) 页面提交。

## 📞 联系我们

- 项目主页: [https://github.com/ixiongdi/nav](https://github.com/ixiongdi/nav)
- 问题反馈: [Issues](https://github.com/ixiongdi/nav/issues)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
