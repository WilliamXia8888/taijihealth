/**
 * 信令服务器启动文件 - 用于启动独立的WebRTC信令服务
 */
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const SignalingServer = require('./signalingServer');

// 创建Express应用
const app = express();
const PORT = process.env.SIGNAL_PORT || 5001;

// 配置CORS中间件 - 增强版，确保移动设备通过Ngrok访问正常
app.use(cors({
  origin: '*', // 明确允许所有来源访问
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false // 禁用跨域凭证，解决移动设备访问问题
}));

// 添加额外的CORS头，确保Ngrok公网访问正常
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', '*'); // 始终允许所有来源
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400'); // 预检请求缓存24小时
  next();
});

// 添加OPTIONS请求处理，解决预检请求问题
app.options('*', (req, res) => {
  res.status(204).end();
});

// 创建HTTP服务器
const server = http.createServer(app);

// 创建Socket.io实例，配置为支持移动设备和Ngrok访问
const io = new Server(server, {
  path: '/socket.io',
  serveClient: true,
  cors: {
    origin: '*', // 允许所有来源访问
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: false // 禁用跨域凭证，解决移动设备访问问题
  },
  transports: ['polling', 'websocket'], // 同时支持polling和websocket，优先使用polling解决移动设备连接问题
  pingTimeout: 60000, // 增加ping超时时间到60秒
  pingInterval: 25000, // 增加ping间隔到25秒
  connectTimeout: 30000 // 增加连接超时时间到30秒
});

// 创建信令服务器，传入配置好的Socket.io实例
const signalingServer = new SignalingServer(io);

// 移动设备检测函数
function isMobileDevice(userAgent) {
  return /mobile|android|iphone|ipad|ipod/i.test(userAgent);
}

// 基本路由 - 增加移动设备检测和重定向
app.get('/', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // 检测是否为移动设备
  if (isMobileDevice(userAgent)) {
    console.log(`检测到移动设备访问: ${userAgent}`);
    // 重定向到移动设备专用页面
    return res.redirect('/mobile.html');
  }
  
  res.send('太极健康WebRTC信令服务器正在运行');
});

// 添加移动设备专用页面路由
app.get('/mobile.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/mobile.html'));
});

// 添加信令状态检查路由 - 增强版，提供更详细的状态信息
app.get('/signal-status', (req, res) => {
  // 添加CORS头，确保移动设备可以访问
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // 返回更详细的状态信息
  res.status(200).json({
    status: 'ok',
    message: '信令服务器正常运行',
    server_time: new Date().toISOString(),
    socket_io_path: '/socket.io',
    transports_available: ['polling', 'websocket']
  });
});

// 添加全局错误处理，防止未捕获的异常导致服务器崩溃
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 不退出进程，保持服务器运行
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 不退出进程，保持服务器运行
});

// 监听Socket.io连接事件，添加详细日志
io.on('connection', (socket) => {
  const clientInfo = {
    id: socket.id,
    transport: socket.conn.transport.name,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent'] || 'unknown',
    isMobile: /mobile|android|iphone|ipad|ipod/i.test(socket.handshake.headers['user-agent'] || '')
  };
  
  console.log(`Socket.io客户端连接成功: ${socket.id}`);
  console.log(`连接详情: ${JSON.stringify(clientInfo, null, 2)}`);
  
  // 监听传输切换事件
  socket.conn.on('upgrade', (transport) => {
    console.log(`客户端 ${socket.id} 传输方式升级: ${transport.name}`);
  });
  
  // 监听错误事件
  socket.on('error', (error) => {
    console.error(`客户端 ${socket.id} 发生错误:`, error);
  });
  
  // 监听断开连接事件
  socket.on('disconnect', (reason) => {
    console.log(`客户端 ${socket.id} 断开连接: ${reason}`);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`=== 太极健康WebRTC信令服务器已启动 ===`);
  console.log(`服务器运行在: http://localhost:${PORT}`);
  console.log(`支持的传输方式: polling, websocket`);
  console.log(`Socket.io路径: /socket.io`);
  console.log('=========================================');
});

module.exports = server; // 导出服务器实例，方便在主应用中引用