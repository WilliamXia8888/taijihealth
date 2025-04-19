# 太极健康项目小白部署指南

本指南专为技术新手设计，提供简单易懂的步骤，帮助你使用SQLite、Ngrok和GitHub等免费工具部署太极健康项目。

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

如果你需要使用代理上网，可以配置Git代理：
```
git config --global http.proxy http://代理服务器地址:端口号
```

### 3. 安装Node.js

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载并安装LTS（长期支持）版本
3. 安装完成后，打开命令提示符(CMD)，输入以下命令确认安装成功：
   ```
   node --version
   npm --version
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

## 第四步：配置SQLite数据库

1. 确保数据目录存在：
   ```
   mkdir -p data
   ```

2. 如果数据库文件不存在，创建一个空的SQLite数据库文件：
   ```
   type nul > data\taijihealth.db
   ```

3. 安装SQLite相关依赖：
   ```
   npm install sqlite sqlite3
   ```

4. 确认`src\services\sqliteService.js`文件存在，该文件负责数据库操作

## 第五步：配置Ngrok内网穿透

1. 注册[Ngrok账号](https://ngrok.com/signup)并获取认证令牌

2. 安装Ngrok：
   ```
   npm install ngrok
   ```

3. 在项目根目录创建`ngrok.json`文件，添加以下内容：
   ```json
   {
     "authtoken": "你的Ngrok认证令牌",
     "port": 3000,
     "region": "ap"
   }
   ```

4. 创建启动Ngrok的批处理文件`启动Ngrok服务.bat`：
   ```
   @echo off
   echo 正在启动Ngrok服务...
   node ngrok-start.js
   pause
   ```

## 第六步：修复视频播放问题

1. 打开文件：`src\components\taiji\TaijiVideoPlayer.jsx`

2. 找到设置视频源的部分（约第49-70行），将其替换为：

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

## 第七步：配置信令服务器连接

1. 在项目根目录创建`.env`文件，添加以下内容：

   ```
   REACT_APP_SIGNAL_SERVER=http://localhost:3001
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

## 第八步：提交代码到GitHub

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

## 第九步：部署到GitHub Pages

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

## 第十步：启动本地服务器

1. 创建一个启动脚本`一键启动服务.bat`：
   ```
   @echo off
   echo 正在启动太极健康系统服务...
   start cmd /k "node server\index.js"
   timeout /t 5
   echo 正在启动Ngrok内网穿透...
   start cmd /k "node ngrok-start.js"
   echo 服务已启动，请查看上方输出的URL
   pause
   ```

2. 双击运行`一键启动服务.bat`

3. 记下Ngrok提供的公网URL（例如：https://xxxx.ngrok.io）

4. 如果需要远程访问，将`.env`文件中的`REACT_APP_SIGNAL_SERVER`值更新为Ngrok URL

## 第十一步：访问你的网站

1. 本地访问：打开浏览器，访问 `http://localhost:3000`

2. GitHub Pages访问：打开浏览器，访问 `https://你的用户名.github.io/taijihealth`

3. 通过Ngrok访问：打开浏览器，访问Ngrok提供的URL

## 常见问题解决

### SQLite数据库问题

1. 确保`data`目录存在且有写入权限
2. 检查`taijihealth.db`文件是否正确创建
3. 如果遇到数据库锁定错误，确保没有其他程序正在使用该数据库文件

### Ngrok连接问题

1. 确认Ngrok认证令牌是否正确
2. 检查防火墙设置，确保Node.js可以访问网络
3. 如果连接不稳定，尝试更换Ngrok区域（region）

### 视频无法播放

1. 确保视频文件存在于正确位置
2. 考虑使用外部视频托管服务（如Cloudinary）
3. 在`src/data/taijiVideos.js`中将视频URL改为外部链接

### 信令服务器连接失败

1. 确认本地服务器是否正常运行
2. 检查浏览器控制台是否有CORS错误
3. 确保`.env`文件中的服务器URL正确

### GitHub Pages部署失败

1. 确保你有正确的GitHub权限
2. 检查是否有未提交的更改
3. 尝试重新运行部署命令

---

恭喜！你已成功使用SQLite、Ngrok和GitHub免费部署太极健康项目。如有任何疑问，请参考更详细的部署指南文档。