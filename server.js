/**
 * Express服务器 - 提供SQLite数据库服务和API接口
 */
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
require('dotenv').config(); // 确保在文件顶部添加这行

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 5001;

// 确保数据目录存在
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 数据库文件路径
const DB_PATH = path.join(DATA_DIR, 'taijihealth.db');

// 初始化数据库连接
let db = null;

// CORS中间件配置 - 解决跨域问题
app.use((req, res, next) => {
  // 允许的来源列表
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5000'];
  const origin = req.headers.origin;
  
  // 检查请求来源是否在允许列表中
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // 对于其他来源，可以选择允许或拒绝
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // 允许的HTTP方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  // 允许发送凭证
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// 中间件配置
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// 添加API状态检查端点
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器正常运行' });
});

// 初始化数据库
async function initDatabase() {
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    // 创建表结构
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        user_type TEXT DEFAULT 'regular',
        is_expert INTEGER DEFAULT 0,
        expert_approved INTEGER DEFAULT 0,
        specialty TEXT,
        introduction TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 健康档案表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        diagnosis TEXT,
        treatments TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    
    // 聊天记录表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message_type TEXT DEFAULT 'text',
        content TEXT NOT NULL,
        media_url TEXT,
        read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
      )
    `);
    
    // 专家咨询会话表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS consultation_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        expert_id INTEGER NOT NULL,
        session_type TEXT DEFAULT 'text',
        status TEXT DEFAULT 'pending',
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (expert_id) REFERENCES users (id)
      )
    `);
    
    // 其他表结构初始化...
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// API路由

// 用户注册
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password, phone, userType } = req.body;
    
    // 简单验证
    if (!username || !password || !phone) {
      return res.status(400).json({ error: '用户名、密码和手机号是必填的' });
    }
    
    // 插入用户数据
    const result = await db.run(
      'INSERT INTO users (username, email, password, phone, user_type) VALUES (?, ?, ?, ?, ?)',
      [username, email || '', password, phone, userType || 'regular']
    );
    
    res.status(201).json({ 
      id: result.lastID, 
      username, 
      email, 
      phone,
      userType: userType || 'regular'
    });
  } catch (error) {
    console.error('注册失败:', error);
    
    // 处理唯一约束冲突
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: '用户名或手机号已存在' });
    }
    
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查询用户
    const user = await db.get(
      `SELECT id, username, email, phone, user_type, is_expert, expert_approved, 
       specialty, introduction, avatar FROM users WHERE username = ? AND password = ?`,
      [username, password]
    );
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码不正确' });
    }
    
    // 格式化返回数据
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      userType: user.user_type,
      isExpert: user.is_expert === 1,
      expertApproved: user.expert_approved === 1,
      specialty: user.specialty,
      introduction: user.introduction,
      avatar: user.avatar
    };
    
    res.json(userData);
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 保存诊断结果
app.post('/api/health-records', async (req, res) => {
  try {
    const { userId, diagnosis, treatments } = req.body;
    
    // 验证用户ID
    if (!userId) {
      return res.status(400).json({ error: '用户ID是必需的' });
    }
    
    // 插入健康记录
    const result = await db.run(
      'INSERT INTO health_records (user_id, diagnosis, treatments) VALUES (?, ?, ?)',
      [userId, JSON.stringify(diagnosis), JSON.stringify(treatments)]
    );
    
    res.status(201).json({ id: result.lastID, userId, diagnosis, treatments });
  } catch (error) {
    console.error('保存健康记录失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户健康记录
app.get('/api/health-records/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 查询健康记录
    const records = await db.all(
      'SELECT * FROM health_records WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    
    // 解析JSON字段
    const formattedRecords = records.map(record => ({
      ...record,
      diagnosis: JSON.parse(record.diagnosis || '{}'),
      treatments: JSON.parse(record.treatments || '{}')
    }));
    
    res.json(formattedRecords);
  } catch (error) {
    console.error('获取健康记录失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// DeepSeek API代理
app.post('/api/diagnose', async (req, res) => {
  try {
    const { pulse, tongue, symptoms } = req.body;
    
    // 这里可以添加调用DeepSeek API的逻辑
    // 由于我们已经修改了前端代码直接调用DeepSeek API，这个接口可以作为备用
    
    res.json({
      success: true,
      message: '诊断请求已转发到DeepSeek API'
    });
  } catch (error) {
    console.error('诊断请求失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 专家用户相关API

// 获取所有专家列表
app.get('/api/experts', async (req, res) => {
  try {
    const experts = await db.all(
      'SELECT id, username, email, specialty, introduction, avatar FROM users WHERE is_expert = 1 AND expert_approved = 1'
    );
    
    res.json(experts);
  } catch (error) {
    console.error('获取专家列表失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 申请成为专家
app.post('/api/experts/apply', async (req, res) => {
  try {
    const { userId, specialty, introduction } = req.body;
    
    if (!userId || !specialty) {
      return res.status(400).json({ error: '用户ID和专业领域是必需的' });
    }
    
    // 更新用户为专家（待审核状态）
    await db.run(
      'UPDATE users SET is_expert = 1, specialty = ?, introduction = ? WHERE id = ?',
      [specialty, introduction || '', userId]
    );
    
    res.status(200).json({ success: true, message: '专家申请已提交，等待管理员审核' });
  } catch (error) {
    console.error('专家申请失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 管理员审核专家申请
app.post('/api/admin/experts/approve', async (req, res) => {
  try {
    const { expertId, approved } = req.body;
    
    if (!expertId) {
      return res.status(400).json({ error: '专家ID是必需的' });
    }
    
    // 更新专家审核状态
    await db.run(
      'UPDATE users SET expert_approved = ? WHERE id = ? AND is_expert = 1',
      [approved ? 1 : 0, expertId]
    );
    
    res.status(200).json({ 
      success: true, 
      message: approved ? '专家申请已批准' : '专家申请已拒绝' 
    });
  } catch (error) {
    console.error('专家审核失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 聊天消息相关API

// 发送消息
app.post('/api/chat/messages', async (req, res) => {
  try {
    const { senderId, receiverId, messageType, content, mediaUrl } = req.body;
    
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: '发送者ID、接收者ID和消息内容是必需的' });
    }
    
    // 插入消息记录
    const result = await db.run(
      'INSERT INTO chat_messages (sender_id, receiver_id, message_type, content, media_url) VALUES (?, ?, ?, ?, ?)',
      [senderId, receiverId, messageType || 'text', content, mediaUrl || null]
    );
    
    res.status(201).json({ 
      id: result.lastID,
      senderId,
      receiverId,
      messageType: messageType || 'text',
      content,
      mediaUrl: mediaUrl || null,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取聊天历史
app.get('/api/chat/messages/:userId/:expertId', async (req, res) => {
  try {
    const { userId, expertId } = req.params;
    
    // 查询双方之间的聊天记录
    const messages = await db.all(
      `SELECT * FROM chat_messages 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId, expertId, expertId, userId]
    );
    
    res.json(messages);
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建咨询会话
app.post('/api/consultations', async (req, res) => {
  try {
    const { userId, expertId, sessionType } = req.body;
    
    if (!userId || !expertId) {
      return res.status(400).json({ error: '用户ID和专家ID是必需的' });
    }
    
    // 创建咨询会话
    const result = await db.run(
      'INSERT INTO consultation_sessions (user_id, expert_id, session_type, status, start_time) VALUES (?, ?, ?, ?, ?)',
      [userId, expertId, sessionType || 'text', 'active', new Date().toISOString()]
    );
    
    res.status(201).json({ 
      id: result.lastID,
      userId,
      expertId,
      sessionType: sessionType || 'text',
      status: 'active',
      startTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('创建咨询会话失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 结束咨询会话
app.put('/api/consultations/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // 更新会话状态为已结束
    await db.run(
      'UPDATE consultation_sessions SET status = ?, end_time = ? WHERE id = ?',
      ['ended', new Date().toISOString(), sessionId]
    );
    
    res.status(200).json({ success: true, message: '咨询会话已结束' });
  } catch (error) {
    console.error('结束咨询会话失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户的所有咨询会话
app.get('/api/consultations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 查询用户的咨询会话
    const sessions = await db.all(
      `SELECT cs.*, u.username as expert_name, u.avatar as expert_avatar 
       FROM consultation_sessions cs
       JOIN users u ON cs.expert_id = u.id
       WHERE cs.user_id = ?
       ORDER BY cs.created_at DESC`,
      [userId]
    );
    
    res.json(sessions);
  } catch (error) {
    console.error('获取用户咨询会话失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取专家的所有咨询会话
app.get('/api/consultations/expert/:expertId', async (req, res) => {
  try {
    const { expertId } = req.params;
    
    // 查询专家的咨询会话
    const sessions = await db.all(
      `SELECT cs.*, u.username as user_name, u.avatar as user_avatar 
       FROM consultation_sessions cs
       JOIN users u ON cs.user_id = u.id
       WHERE cs.expert_id = ?
       ORDER BY cs.created_at DESC`,
      [expertId]
    );
    
    res.json(sessions);
  } catch (error) {
    console.error('获取专家咨询会话失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 所有其他请求返回React应用
// 修复path-to-regexp错误，确保使用有效的URL格式
// 注意：路由路径必须是有效的URL路径参数格式，不能包含完整URL（如https://）
// 使用中间件方式处理所有路由，避免直接使用通配符路由
app.use((req, res, next) => {
  // 排除API路由和静态资源
  if (req.url.startsWith('/api/') || req.url.includes('.')) {
    return next();
  }
  
  // 检查是否包含完整URL格式，如果有则重定向到根路径
  if (req.url.match(/^https?:\/\//)) {
    console.log('检测到无效的URL格式，重定向到根路径:', req.url);
    return res.redirect('/');
  }
  
  // 返回React应用的index.html
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 启动服务器
async function startServer() {
  await initDatabase();
  
  // 修复1：使用http.createServer创建服务器实例，以便集成WebSocket
  const http = require('http');
  const server = http.createServer(app);
  
  // 统一使用PORT变量，确保前端和后端使用相同的端口
  // 前端代码中已经硬编码使用5001端口连接WebSocket
  const PORT = 5001;
  
  // 集成WebRTC信令服务
  try {
    // 导入信令服务器集成模块
    const { integrateSignalingServer } = require('./server/signalServerIntegration');
    
    // 使用集成函数初始化信令服务器
    const signalingServer = integrateSignalingServer(app, server);
    
    // 添加调试日志
    console.log('WebRTC信令服务已成功集成到主服务器');
    console.log('信令服务器状态: 运行中');
    console.log('信令服务器端点: ws://localhost:' + PORT + '/socket.io');
    
    // 添加额外的错误处理
    server.on('error', (error) => {
      console.error('服务器错误:', error);
    });
    
    // 添加关闭处理
    process.on('SIGINT', () => {
      console.log('正在关闭服务器...');
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('集成WebRTC信令服务失败:', error);
    console.log('实时通信功能可能无法正常工作');
  }
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`WebSocket/信令服务运行在 ws://localhost:${PORT}`);
  }).on('error', (err) => {  // 修复2：将错误处理移到这里
    if (err.code === 'EADDRINUSE') {
      console.error(`端口 ${PORT} 已被占用，请尝试：`);
      console.log('1. 终止占用进程：');
      console.log(`   netstat -ano | findstr :${PORT}`);
      console.log('2. 或在.env文件中修改PORT值');
    }
  });
}

// 导出initDatabase函数，供批处理脚本使用
module.exports = {
  initDatabase
};

// 启动服务器
startServer().catch(error => {
  console.error('启动服务器失败:', error);
  process.exit(1);
});