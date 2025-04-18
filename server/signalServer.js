/**
 * 信令服务器启动文件 - 用于启动独立的WebRTC信令服务
 */
const http = require('http');
const express = require('express');
const cors = require('cors');
const SignalingServer = require('./signalingServer');

// 创建Express应用
const app = express();
const PORT = process.env.SIGNAL_PORT || 5001;

// 配置CORS中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// 创建HTTP服务器
const server = http.createServer(app);

// 创建信令服务器
const signalingServer = new SignalingServer(server);

// 基本路由
app.get('/', (req, res) => {
  res.send('太极健康WebRTC信令服务器正在运行');
});

// 添加信令状态检查路由
app.get('/signal-status', (req, res) => {
  res.status(200).json({ status: 'ok', message: '信令服务器正常运行' });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`=== 太极健康WebRTC信令服务器已启动 ===`);
  console.log(`服务器运行在: http://localhost:${PORT}`);
  console.log('=========================================');
});

module.exports = server; // 导出服务器实例，方便在主应用中引用