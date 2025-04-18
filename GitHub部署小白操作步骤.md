# 太极健康项目GitHub部署小白操作步骤

本指南提供简单易懂的步骤，帮助你将太极健康项目部署到GitHub，并解决视频播放和专家咨询连接问题。

## 第一步：准备工作

### 1. 安装Git

1. 打开浏览器，访问 [Git下载页面](https://git-scm.com/downloads)
2. 下载Windows版本并安装（全部选择默认选项即可）
3. 安装完成后，在桌面右键选择"Git Bash Here"，输入以下命令确认安装成功：
   ```
   git --version
   ```

### 2. 设置Git用户信息

在Git Bash中输入（替换为你的GitHub用户名和邮箱）：

```
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"
```

## 第二步：创建GitHub仓库

1. 打开浏览器，访问 [GitHub](https://github.com) 并登录
2. 点击右上角的"+"图标，选择"New repository"
3. 填写仓库信息：
   - 仓库名称：`taijihealth`
   - 选择"Public"（公开）
   - 不要勾选"Add a README file"
4. 点击"Create repository"按钮

## 第三步：准备本地项目

1. 打开命令提示符(CMD)，进入项目目录：
   ```
   cd d:\trae\taijihealth
   ```

2. 初始化Git仓库：
   ```
   git init
   ```

3. 确保视频目录存在：
   ```
   mkdir -p public\videos\taiji
   ```

4. 创建一个空文件，确保Git能跟踪空目录：
   ```
   type nul > public\videos\taiji\.gitkeep
   ```

## 第四步：修复视频播放问题

1. 打开文件：`src\components\taiji\TaijiVideoPlayer.jsx`

2. 找到第49-70行左右的代码（设置视频源的部分），将其替换为：

   ```javascript
   // 根据视频信息设置视频源
   useEffect(() => {
     if (video && video.videoUrl) {
       // 重置错误状态
       setVideoError(false);
       setErrorMessage('');
       
       try {
         // 检查是否是完整URL或相对路径
         if (video.videoUrl.startsWith('http')) {
           setVideoSrc(video.videoUrl);
         } else {
           // 构建绝对路径，确保从public目录正确引用
           // 移除开头的所有斜杠，确保路径格式正确
           let correctPath = video.videoUrl;
           while (correctPath.startsWith('/') || correctPath.startsWith('\\')) {
             correctPath = correctPath.substring(1);
           }
           
           // 使用环境变量或window.location.origin构建完整的绝对URL
           // 为GitHub Pages部署添加仓库名称路径
           const baseUrl = window.location.origin;
           const repoPath = baseUrl.includes('github.io') ? '/taijihealth' : '';
           const absolutePath = `${baseUrl}${repoPath}/${correctPath}`;
           setVideoSrc(absolutePath);
           console.log('设置视频源(绝对路径):', absolutePath);
         }
       } catch (error) {
         console.error('设置视频源时出错:', error);
         setVideoError(true);
         setErrorMessage('视频路径处理错误，请联系管理员');
       }
     }
   }, [video]);
   ```

3. 保存文件

## 第五步：修复信令服务器连接问题

1. 在项目根目录创建`.env`文件，添加以下内容：

   ```
   REACT_APP_SIGNAL_SERVER=https://你的用户名-taijihealth.onrender.com
   ```

2. 打开文件：`src\services\socketService.js`

3. 找到创建Socket连接的代码（约第49行），修改为：

   ```javascript
   // 创建新的Socket.io连接
   const serverUrl = process.env.REACT_APP_SIGNAL_SERVER || finalServerUrl;
   this.socket = io(serverUrl, {
     reconnectionDelayMax: 10000,
     reconnectionAttempts: this.maxReconnectAttempts,
     timeout: 20000,
     transports: ['polling', 'websocket'], // 先尝试polling，然后尝试websocket
   });
   ```

4. 保存文件

## 第六步：提交代码到GitHub

1. 添加所有文件到Git：
   ```
   git add .
   ```

2. 提交更改：
   ```
   git commit -m "初始提交：太极健康项目"
   ```

3. 关联远程仓库（替换为你的GitHub用户名）：
   ```
   git remote add origin https://github.com/你的用户名/taijihealth.git
   ```

4. 推送代码：
   ```
   git push -u origin master
   ```
   (可能会要求你输入GitHub用户名和密码)

## 第七步：部署到GitHub Pages

1. 安装gh-pages包：
   ```
   npm install --save-dev gh-pages
   ```

2. 打开`package.json`文件，添加以下内容：

   在顶部添加：
   ```json
   "homepage": "https://你的用户名.github.io/taijihealth",
   ```

   在"scripts"部分添加：
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build",
   ```

3. 保存文件

4. 执行部署命令：
   ```
   npm run deploy
   ```

5. 等待部署完成

## 第八步：部署信令服务器（解决专家咨询问题）

1. 创建一个新的GitHub仓库：`taijihealth-server`

2. 将服务器文件复制到新目录：
   ```
   mkdir d:\taijihealth-server
   xcopy d:\trae\taijihealth\server d:\taijihealth-server\server /E /I
   ```

3. 在新目录创建package.json文件：
   ```json
   {
     "name": "taijihealth-server",
     "version": "1.0.0",
     "main": "server/index.js",
     "scripts": {
       "start": "node server/index.js"
     },
     "dependencies": {
       "express": "^5.1.0",
       "socket.io": "^4.8.1"
     }
   }
   ```

4. 修改`server/signalServerIntegration.js`文件，添加CORS支持：

   ```javascript
   // 创建Socket.io实例
   const io = new Server(server, {
     path: '/socket.io',
     cors: {
       origin: ["https://你的用户名.github.io", "http://localhost:3000"],
       methods: ["GET", "POST"],
       credentials: true
     },
     transports: ['websocket', 'polling']
   });
   ```

5. 初始化Git并推送到GitHub：
   ```
   cd d:\taijihealth-server
   git init
   git add .
   git commit -m "初始提交：太极健康信令服务器"
   git remote add origin https://github.com/你的用户名/taijihealth-server.git
   git push -u origin master
   ```

6. 注册[Render.com](https://render.com/)账号

7. 创建新的Web Service：
   - 连接到`taijihealth-server`仓库
   - 选择Node.js环境
   - 设置启动命令：`npm start`
   - 选择免费计划

8. 等待部署完成，记下服务URL（例如：https://你的用户名-taijihealth.onrender.com）

9. 更新前端项目中的`.env`文件，使用这个URL作为`REACT_APP_SIGNAL_SERVER`的值

10. 重新部署前端项目：
    ```
    cd d:\trae\taijihealth
    npm run deploy
    ```

## 第九步：访问你的网站

1. 打开浏览器，访问：`https://你的用户名.github.io/taijihealth`

2. 测试太极养生视频播放功能

3. 测试专家咨询功能

## 常见问题解决

### 视频无法播放

1. 确保视频文件存在于正确位置
2. 考虑使用外部视频托管服务（如Cloudinary）
3. 在`src/data/taijiVideos.js`中将视频URL改为外部链接

### 信令服务器连接失败

1. 确认Render.com服务是否在线
2. 检查浏览器控制台是否有CORS错误
3. 确保`.env`文件中的服务器URL正确

### 部署失败

1. 确保你有正确的GitHub权限
2. 检查是否有未提交的更改
3. 尝试重新运行部署命令

---

恭喜！你已成功将太极健康项目部署到GitHub，并解决了视频播放和专家咨询连接问题。如有任何疑问，请参考更详细的部署指南文档。