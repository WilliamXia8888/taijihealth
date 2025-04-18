/**
 * 信令服务 - 用于WebRTC连接的信令交换
 */
import io from 'socket.io-client';

class SignalingService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
    this.isConnected = false;
    this.roomId = null;
    this.userId = null;
  }

  // 初始化信令服务
  async initialize(serverUrl) {
    return new Promise((resolve, reject) => {
      try {
        // 创建Socket.io连接
        this.socket = io(serverUrl);
        
        // 设置连接事件
        this.socket.on('connect', () => {
          console.log('信令服务器连接成功');
          this.isConnected = true;
          
          if (this.callbacks.onConnect) {
            this.callbacks.onConnect();
          }
          
          resolve(true);
        });
        
        // 设置断开连接事件
        this.socket.on('disconnect', () => {
          console.log('信令服务器断开连接');
          this.isConnected = false;
          
          if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect();
          }
        });
        
        // 设置错误事件
        this.socket.on('error', (error) => {
          console.error('信令服务器错误:', error);
          
          if (this.callbacks.onError) {
            this.callbacks.onError(error);
          }
          
          reject(error);
        });
        
        // 设置加入房间事件
        this.socket.on('joined', (roomId) => {
          console.log(`已加入房间: ${roomId}`);
          
          if (this.callbacks.onJoinRoom) {
            this.callbacks.onJoinRoom(roomId);
          }
        });
        
        // 设置用户加入事件
        this.socket.on('user-joined', (userId) => {
          console.log(`用户加入: ${userId}`);
          
          if (this.callbacks.onUserJoined) {
            this.callbacks.onUserJoined(userId);
          }
        });
        
        // 设置用户离开事件
        this.socket.on('user-left', (userId) => {
          console.log(`用户离开: ${userId}`);
          
          if (this.callbacks.onUserLeft) {
            this.callbacks.onUserLeft(userId);
          }
        });
        
        // 设置提议事件
        this.socket.on('offer', (offer, from) => {
          console.log(`收到提议，来自: ${from}`);
          
          if (this.callbacks.onOffer) {
            this.callbacks.onOffer(offer, from);
          }
        });
        
        // 设置应答事件
        this.socket.on('answer', (answer, from) => {
          console.log(`收到应答，来自: ${from}`);
          
          if (this.callbacks.onAnswer) {
            this.callbacks.onAnswer(answer, from);
          }
        });
        
        // 设置ICE候选事件
        this.socket.on('candidate', (candidate, from) => {
          console.log(`收到ICE候选，来自: ${from}`);
          
          if (this.callbacks.onCandidate) {
            this.callbacks.onCandidate(candidate, from);
          }
        });
        
        // 设置消息事件
        this.socket.on('message', (message, from) => {
          console.log(`收到消息，来自: ${from}`);
          
          if (this.callbacks.onMessage) {
            this.callbacks.onMessage(message, from);
          }
        });
      } catch (error) {
        console.error('初始化信令服务失败:', error);
        reject(error);
      }
    });
  }

  // 设置回调函数
  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  // 加入房间
  joinRoom(roomId, userId) {
    if (!this.isConnected) {
      console.error('信令服务未连接');
      return false;
    }
    
    this.roomId = roomId;
    this.userId = userId;
    
    this.socket.emit('join', { roomId, userId });
    return true;
  }

  // 离开房间
  leaveRoom() {
    if (!this.isConnected || !this.roomId) {
      console.error('信令服务未连接或未加入房间');
      return false;
    }
    
    this.socket.emit('leave', { roomId: this.roomId, userId: this.userId });
    this.roomId = null;
    return true;
  }

  // 发送提议
  sendOffer(offer, to) {
    if (!this.isConnected || !this.roomId) {
      console.error('信令服务未连接或未加入房间');
      return false;
    }
    
    this.socket.emit('offer', { offer, to, from: this.userId, roomId: this.roomId });
    return true;
  }

  // 发送应答
  sendAnswer(answer, to) {
    if (!this.isConnected || !this.roomId) {
      console.error('信令服务未连接或未加入房间');
      return false;
    }
    
    this.socket.emit('answer', { answer, to, from: this.userId, roomId: this.roomId });
    return true;
  }

  // 发送ICE候选
  sendCandidate(candidate, to) {
    if (!this.isConnected || !this.roomId) {
      console.error('信令服务未连接或未加入房间');
      return false;
    }
    
    this.socket.emit('candidate', { candidate, to, from: this.userId, roomId: this.roomId });
    return true;
  }

  // 发送消息
  sendMessage(message, to) {
    if (!this.isConnected || !this.roomId) {
      console.error('信令服务未连接或未加入房间');
      return false;
    }
    
    // 确保消息包含必要的信息
    const messageData = {
      message: typeof message === 'object' ? message : { type: 'chat', content: message },
      to,
      from: this.userId,
      roomId: this.roomId,
    };
    
    this.socket.emit('message', messageData);
    return true;
  }
  
  // 发送专家在线状态通知
  sendExpertStatusNotification(expertId, isOnline) {
    if (!this.isConnected) {
      console.error('信令服务未连接');
      return false;
    }
    
    const statusData = {
      type: 'expert_status',
      expertId,
      isOnline,
      timestamp: new Date().toISOString()
    };
    
    this.socket.emit('broadcast', { message: statusData });
    return true;
  }  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.roomId = null;
      this.userId = null;
    }
  }
}

// 创建单例实例
const signalingService = new SignalingService();

export default signalingService;