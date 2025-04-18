# 太极健康项目GitHub部署指南

本指南将帮助你将太极健康项目部署到GitHub上，并解决"专家咨询"语音视频信令服务器连接失败和"太极养生"视频播放等问题。

## 1. 准备工作

### 1.1 安装Git

如果你还没有安装Git，请先下载并安装：
- 访问 [Git官网](https://git-scm.com/downloads) 下载适合你系统的版本
- 安装时使用默认选项即可

### 1.2 配置Git

安装完成后，打开命令提示符(CMD)或PowerShell，设置你的Git用户信息：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"
```

## 2. 创建GitHub仓库

### 2.1 登录GitHub

- 打开浏览器，访问 [GitHub](https://github.com)
- 使用你已注册的账号登录

### 2.2 创建新仓库

1. 点击右上角的"+"图标，选择"New repository"
2. 填写仓库信息：
   - Repository name: `taijihealth`（或你喜欢的名称）
   - Description: 太极健康项目（可选）
   - 选择"Public"（公开）
   - 不要勾选"Initialize this repository with a README"
3. 点击"Create repository"按钮

## 3. 配置本地项目

### 3.1 初始化本地Git仓库

打开命令提示符(CMD)或PowerShell，进入项目目录：

```bash
cd d:\trae\taijihealth
```

初始化Git仓库：

```bash
git init
```

### 3.2 修改.gitignore文件

检查项目中的.gitignore文件，确保它包含以下内容（如果没有这些内容，请添加）：

```
# 依赖目录
node_modules/

# 环境变量文件
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日志文件
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# 本地数据库文件
data/*.db

# 构建输出
build/
dist/

# 系统文件
.DS_Store
Thumbs.db
```

### 3.3 准备视频文件目录

确保public/videos/taiji目录存在，并包含视频文件：

```bash
mkdir -p public\videos\taiji
```

## 4. 解决视频播放问题

### 4.1 修改视频路径处理

视频播放问题主要是由于GitHub Pages的路径处理方式与本地开发环境不同。我们需要修改TaijiVideoPlayer.jsx文件中的视频路径处理逻辑：

1. 在项目根目录创建一个.env文件（如果不存在），添加以下内容：

```
REACT_APP_BASE_URL=https://你的用户名.github.io/taijihealth
```

2. 修改视频路径处理逻辑，使其适应GitHub Pages环境

## 5. 解决信令服务器连接问题

### 5.1 配置信令服务器

由于GitHub Pages只能托管静态内容，无法运行后端服务，我们需要将信令服务器部署到其他支持Node.js的平台（如Heroku、Vercel等）。

1. 在项目根目录创建一个server目录（如果不存在）
2. 将信令服务器相关文件移动到该目录
3. 创建一个package.json文件，添加必要的依赖

### 5.2 更新前端连接配置

修改前端代码中的WebSocket连接地址，指向你部署的信令服务器：

1. 在.env文件中添加：

```
REACT_APP_SIGNAL_SERVER=https://你的信令服务器地址
```

2. 更新socketService.js中的连接逻辑

## 6. 提交代码到GitHub

### 6.1 添加文件到Git

```bash
git add .
```

### 6.2 提交更改

```bash
git commit -m "初始提交：太极健康项目"
```

### 6.3 关联远程仓库

```bash
git remote add origin https://github.com/你的用户名/taijihealth.git
```

### 6.4 推送代码

```bash
git push -u origin master
```

## 7. 配置GitHub Pages

### 7.1 构建项目

```bash
npm run build
```

### 7.2 启用GitHub Pages

1. 在GitHub仓库页面，点击"Settings"
2. 滚动到"GitHub Pages"部分
3. 在"Source"下拉菜单中选择"gh-pages"分支或"master branch /docs folder"
4. 点击"Save"

### 7.3 自动部署配置（可选）

创建.github/workflows/deploy.yml文件，添加GitHub Actions配置：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install Dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: build
```

## 8. 访问部署的网站

部署完成后，你可以通过以下URL访问你的网站：

```
https://你的用户名.github.io/taijihealth
```

## 9. 故障排除

### 9.1 视频播放问题

如果视频仍然无法播放：

1. 检查视频文件是否已正确上传到GitHub
2. 确认视频路径是否正确
3. 考虑使用CDN服务（如Cloudinary、七牛云等）托管视频文件

### 9.2 信令服务器连接问题

如果信令服务器连接失败：

1. 确认信令服务器是否正常运行
2. 检查WebSocket连接URL是否正确
3. 确保信令服务器支持CORS，允许来自GitHub Pages的请求

## 10. 维护与更新

### 10.1 更新代码

当你需要更新网站时：

1. 修改代码
2. 提交更改：
   ```bash
   git add .
   git commit -m "更新：描述你的更改"
   git push
   ```
3. GitHub Actions将自动部署更新（如果已配置）

### 10.2 本地测试

在推送更改前，建议先在本地测试：

```bash
npm run dev
```

## 结语

恭喜！你已成功将太极健康项目部署到GitHub上。如果遇到任何问题，可以查阅GitHub文档或在GitHub社区寻求帮助。