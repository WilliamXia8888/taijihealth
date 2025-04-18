# 太极健康项目GitHub部署视频修复指南

本指南是GitHub部署指南的补充，专门针对解决太极养生视频播放问题和专家咨询信令服务器连接问题提供详细步骤。

## 1. 视频播放问题解决方案

### 1.1 问题分析

经过分析，视频播放问题主要有以下几个原因：

1. GitHub Pages的基础URL与本地开发环境不同
2. 视频文件路径处理逻辑不兼容GitHub Pages环境
3. 视频文件可能超过GitHub Pages的大小限制

### 1.2 修改视频路径处理逻辑

打开`src/components/taiji/TaijiVideoPlayer.jsx`文件，修改视频路径处理逻辑：

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
        const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
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

### 1.3 创建视频占位符文件

为了确保GitHub仓库包含视频目录结构，我们需要创建占位符文件：

1. 确保`public/videos/taiji`目录存在
2. 在该目录中创建一个`.gitkeep`文件，确保空目录也会被Git跟踪
3. 如果视频文件较小（小于100MB），可以直接添加到仓库中

### 1.4 处理大型视频文件

由于GitHub对文件大小有限制（单个文件不超过100MB），对于较大的视频文件，我们有以下解决方案：

#### 方案1：使用外部视频托管服务

修改`src/data/taijiVideos.js`文件，将视频URL指向外部托管服务：

```javascript
const taijiVideos = [
  {
    id: 1,
    title: '太极禅道健身功法基本功八式',
    // 其他属性保持不变
    // 使用外部视频托管服务的URL
    videoUrl: 'https://example-video-host.com/videos/taiji-v1.mp4',
    thumbnail: '/images/taiji/taiji-basic-8.jpg',
  },
  // 其他视频条目
];
```

推荐的视频托管服务：
- [Cloudinary](https://cloudinary.com/)（有免费套餐）
- [七牛云](https://www.qiniu.com/)（国内服务，有免费额度）
- [YouTube](https://www.youtube.com/)（嵌入视频）

#### 方案2：使用Git LFS（大文件存储）

1. 安装Git LFS：
   ```bash
   git lfs install
   ```

2. 配置Git LFS跟踪视频文件：
   ```bash
   git lfs track "*.mp4"
   git lfs track "*.webm"
   git lfs track "*.ogg"
   ```

3. 确保`.gitattributes`文件被提交：
   ```bash
   git add .gitattributes
   git commit -m "配置Git LFS跟踪视频文件"
   ```

## 2. 信令服务器连接问题解决方案

### 2.1 问题分析

信令服务器连接失败的主要原因是GitHub Pages只能托管静态内容，无法运行后端服务。我们需要将信令服务器部署到支持Node.js的平台。

### 2.2 分离前后端代码

1. 创建一个新的GitHub仓库，专门用于信令服务器：
   - 仓库名称：`taijihealth-server`

2. 将服务器相关文件移动到新仓库：
   - `server/`目录下的所有文件
   - 创建一个新的`package.json`文件，只包含服务器需要的依赖

### 2.3 部署信令服务器到Render.com（免费且易用）

1. 注册[Render.com](https://render.com/)账号

2. 创建新的Web Service：
   - 连接到`taijihealth-server`仓库
   - 选择Node.js环境
   - 设置启动命令：`node server/index.js`
   - 选择免费计划

3. 配置环境变量：
   - `PORT`: `10000`（或你希望的端口）
   - 其他必要的环境变量

### 2.4 更新前端连接配置

1. 在项目根目录创建`.env`文件（如果不存在），添加：

```
REACT_APP_SIGNAL_SERVER=https://你的render服务名称.onrender.com
```

2. 修改`src/services/socketService.js`中的连接逻辑：

```javascript
// 创建新的Socket.io连接
this.socket = io(process.env.REACT_APP_SIGNAL_SERVER || finalServerUrl, {
  reconnectionDelayMax: 10000,
  reconnectionAttempts: this.maxReconnectAttempts,
  timeout: 20000,
  transports: ['polling', 'websocket'], // 先尝试polling，然后尝试websocket
});
```

3. 确保信令服务器支持CORS，在服务器代码中添加：

```javascript
const io = new Server(server, {
  cors: {
    origin: ["https://你的用户名.github.io", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  // 其他配置...
});
```

## 3. 部署后的测试与验证

### 3.1 视频播放测试

1. 访问部署后的网站：`https://你的用户名.github.io/taijihealth`
2. 导航到太极养生视频页面
3. 尝试播放不同的视频，确认是否正常工作
4. 检查浏览器控制台是否有错误信息

### 3.2 信令服务器连接测试

1. 登录两个不同的账号（一个普通用户，一个专家）
2. 尝试发起专家咨询
3. 检查WebSocket连接是否成功建立
4. 测试音视频通话功能

## 4. 常见问题与解决方案

### 4.1 视频无法加载

- **问题**: 视频显示加载错误
- **解决方案**: 
  - 检查网络控制台中的请求URL是否正确
  - 确认视频文件是否存在于指定位置
  - 尝试使用完整的外部URL替代相对路径

### 4.2 CORS错误

- **问题**: 控制台显示跨域资源共享(CORS)错误
- **解决方案**:
  - 确保信令服务器正确配置了CORS头
  - 检查允许的域名列表是否包含你的GitHub Pages URL

### 4.3 WebSocket连接失败

- **问题**: 无法建立WebSocket连接
- **解决方案**:
  - 确认信令服务器是否在线运行
  - 检查浏览器是否支持WebSocket
  - 尝试使用备用传输方式（如长轮询）

## 结语

通过以上步骤，你应该能够成功解决太极健康项目在GitHub Pages上的视频播放和信令服务器连接问题。如果仍然遇到困难，可以考虑使用其他托管服务，如Vercel或Netlify，它们提供更完整的前端应用托管解决方案。