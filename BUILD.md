# 构建说明

本项目支持两种部署方式，需要使用不同的构建配置：

## 1. GitHub Pages 部署（子路径）

部署到 `https://ixiongdi.github.io/nav/`

```bash
# 设置环境变量并构建
VITE_BASE_PATH=/nav/ npm run build
```

或者直接在 `.env.production` 文件中设置：
```
VITE_BASE_PATH=/nav/
```

## 2. 自定义域名部署（根路径）

部署到 `https://nav.xifan.uno/`

```bash
# 使用默认根路径构建
npm run build
```

或者明确设置：
```bash
VITE_BASE_PATH=/ npm run build
```

## 3. 本地开发

```bash
# 本地开发始终使用根路径
npm run dev
```

## 注意事项

- GitHub Actions 自动部署会使用 `/nav/` 路径
- 手动部署到自定义域名时，请确保使用根路径构建
- 构建完成后，检查 `dist/index.html` 中的资源路径是否正确