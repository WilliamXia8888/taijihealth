/**
 * 信令服务器集成模块 - 用于在主服务器中启动WebRTC信令服务
 */
const http = require('http');
const { Server } = require('socket.io');
const SignalingServer = require('./signalingServer');

/**
 * 在现有Express应用上集成信令服务器
 * @param {Object} app - Express应用实例
 * @param {Object} server - HTTP服务器实例
 */
function integrateSignalingServer(app, server) {
  console.log('正在集成WebRTC信令服务...');
  
  try {
    // 确保server是有效的HTTP服务器实例
    if (!server || typeof server.listen !== 'function') {
      console.error('错误: 提供的server参数不是有效的HTTP服务器实例');
      throw new Error('无效的服务器实例');
    }
    
    // 创建Socket.io实例
    const io = new Server(server, {
      path: '/socket.io',
      serveClient: true,
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5000'],
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });
    
    // 创建信令服务器实例，传入Socket.io实例
    const signalingServer = new SignalingServer(io);
    
    // 添加信令服务器状态路由
    app.get('/signal-status', (req, res) => {
      // 添加CORS头，允许特定来源访问
      res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      res.json({
        status: 'running',
        message: '太极健康WebRTC信令服务器正在运行'
      });
    });
    
    // 添加CORS预检请求处理
    app.options('/signal-status', (req, res) => {
      res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.status(204).end();
    });
    
    console.log('WebRTC信令服务集成完成！');
    console.log('Socket.io配置已应用，支持WebSocket和长轮询');
    
    return signalingServer;
  } catch (error) {
    console.error('集成WebRTC信令服务失败:', error);
    // 返回一个空对象，避免后续代码出错
    return {};
  }
}

module.exports = { integrateSignalingServer };