/**
 * WebRTC信令服务器 - 用于处理WebRTC连接的信令交换
 */

class SignalingServer {
  constructor(io) {
    console.log('初始化信令服务器，使用已配置的Socket.io实例');
    this.io = io;
    
    this.rooms = new Map(); // 存储房间信息
    this.socketToUser = new Map(); // 存储socket.id到用户信息的映射
    this.initialize();
  }
  
  // 初始化信令服务器
  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`客户端连接: ${socket.id}`);
      
      // 处理加入房间
      socket.on('join', ({ roomId, userId }) => {
        console.log(`用户 ${userId} 加入房间 ${roomId}`);
        
        // 将用户加入房间
        socket.join(roomId);
        
        // 存储用户信息
        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(userId);
        
        // 存储socket.id到用户信息的映射
        this.socketToUser.set(socket.id, { userId, roomId });
        
        // 通知用户已加入房间
        socket.emit('joined', roomId);
        
        // 通知房间内其他用户有新用户加入
        socket.to(roomId).emit('user-joined', userId);
      });
      
      // 处理离开房间
      socket.on('leave', ({ roomId, userId }) => {
        console.log(`用户 ${userId} 离开房间 ${roomId}`);
        
        // 将用户从房间移除
        socket.leave(roomId);
        
        // 更新房间信息
        if (this.rooms.has(roomId)) {
          this.rooms.get(roomId).delete(userId);
          
          // 如果房间为空，删除房间
          if (this.rooms.get(roomId).size === 0) {
            this.rooms.delete(roomId);
          }
        }
        
        // 从映射中移除socket
        this.socketToUser.delete(socket.id);
        
        // 通知房间内其他用户有用户离开
        socket.to(roomId).emit('user-left', userId);
      });
      
      // 处理WebRTC提议
      socket.on('offer', ({ offer, to, from, roomId }) => {
        console.log(`用户 ${from} 向用户 ${to} 发送提议`);
        
        // 将提议转发给目标用户
        socket.to(roomId).emit('offer', offer, from);
      });
      
      // 处理WebRTC应答
      socket.on('answer', ({ answer, to, from, roomId }) => {
        console.log(`用户 ${from} 向用户 ${to} 发送应答`);
        
        // 将应答转发给目标用户
        socket.to(roomId).emit('answer', answer, from);
      });
      
      // 处理ICE候选
      socket.on('candidate', ({ candidate, to, from, roomId }) => {
        console.log(`用户 ${from} 向用户 ${to} 发送ICE候选`);
        
        // 将ICE候选转发给目标用户
        socket.to(roomId).emit('candidate', candidate, from);
      });
      
      // 处理聊天消息
      socket.on('message', ({ message, to, from, roomId }) => {
        console.log(`用户 ${from} 向用户 ${to} 发送消息`);
        
        // 将消息转发给目标用户
        socket.to(roomId).emit('message', message, from);
      });
      
      // 处理断开连接
      socket.on('disconnect', () => {
        console.log(`客户端断开连接: ${socket.id}`);
        
        // 获取断开连接的用户信息
        const userInfo = this.socketToUser.get(socket.id);
        
        if (userInfo) {
          const { userId, roomId } = userInfo;
          console.log(`用户 ${userId} 从房间 ${roomId} 断开连接`);
          
          // 从房间中移除用户
          if (this.rooms.has(roomId)) {
            const users = this.rooms.get(roomId);
            users.delete(userId);
            
            // 通知房间内其他用户有用户离开
            this.io.to(roomId).emit('user-left', userId);
            
            // 如果房间为空，删除房间
            if (users.size === 0) {
              this.rooms.delete(roomId);
              console.log(`房间 ${roomId} 已空，已删除`);
            }
          }
          
          // 从映射中移除socket
          this.socketToUser.delete(socket.id);
        }
      });
    });
  }
}

module.exports = SignalingServer;