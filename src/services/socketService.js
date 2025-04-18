/**
 * WebSocket服务 - 用于建立与信令服务器的实时连接
 */
import io from 'socket.io-client';
import { toast } from 'react-toastify';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * 初始化WebSocket连接
   * @param {string} serverUrl - 信令服务器URL
   * @param {Object} userData - 用户数据
   * @returns {Promise} 连接结果
   */
  initialize(serverUrl, userData) {
    return new Promise((resolve, reject) => {
      try {
        // 如果已经连接，先断开
        if (this.socket) {
          this.disconnect();
        }
        
        // 设置重试计数器
        this.retryCount = 0;
        
        // 检查信令服务器是否可用
        this.checkServerAvailability(serverUrl);
        
        
        // 检测是否为本地开发环境，如果是则直接使用localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        // 本地开发环境使用固定地址
        const finalServerUrl = isLocalhost ? 'http://localhost:5001' : serverUrl;
        
        console.log(`尝试连接到信令服务器: ${finalServerUrl}`);
        
        // 检查信令服务器是否可用
        this.checkServerAvailability(finalServerUrl);
        
         // 创建新的Socket.io连接
   const serverUrl = process.env.REACT_APP_SIGNAL_SERVER || finalServerUrl;
   this.socket = io(serverUrl, {
     reconnectionDelayMax: 10000,
     reconnectionAttempts: this.maxReconnectAttempts,
     timeout: 20000,
     transports: ['polling', 'websocket'], // 先尝试polling，然后尝试websocket
   });
        
        // 添加路径前缀，确保Socket.io能正确连接
        if (this.socket.io.uri.indexOf('/socket.io') === -1) {
          this.socket.io.uri = this.socket.io.uri.replace(/\/?$/, '/socket.io');
        }
        
        // 添加连接失败处理
        this.socket.io.on("error", (error) => {
          console.error("Socket.io连接错误:", error);
          // 不立即reject，允许重试机制工作
        });
        
        // 添加传输错误处理
        this.socket.io.engine.on("transport_error", (error) => {
          console.warn("传输错误，尝试其他传输方式:", error);
          // 如果websocket失败，尝试切换到polling
          if (this.socket && this.socket.io.opts.transports.includes('websocket')) {
            console.log('尝试切换到polling传输方式...');
            this.socket.io.opts.transports = ['polling'];
            this.socket.connect();
          }
        });
        
        // 添加连接超时处理，更长的超时时间
        if (this.socket.io && this.socket.io.engine) {
          this.socket.io.engine.pingTimeout = 60000; // 增加ping超时时间到60秒
        }
        
        // 设置连接超时处理
        let connectionTimeoutId = null;
        const connectionTimeout = () => {
          // 只有在未连接状态下才执行超时处理
          if (!this.isConnected) {
            console.warn('WebSocket连接超时，正在尝试重新连接...');
            // 不立即断开，而是尝试重新连接
            console.log('尝试使用备用连接方式...');
            // 如果当前连接失败，尝试使用不同的传输方式
            if (this.socket) {
              this.socket.io.opts.transports = ['polling']; // 只使用polling
              this.socket.connect();
              
              // 设置第二次尝试的超时
              setTimeout(() => {
                if (!this.isConnected) {
                  console.warn('备用连接方式也失败，尝试重新建立连接');
                  // 先断开当前连接
                  this.socket.disconnect();
                  
                  // 尝试重新连接，最多重试5次
                  if (this.retryCount < 5) {
                    this.retryCount++;
                    console.log(`尝试重新连接 (${this.retryCount}/5)...`);
                    
                    // 2秒后重试
                    setTimeout(() => {
                      this.initialize(serverUrl, userData)
                        .then(result => resolve(result))
                        .catch(error => {
                          console.error('重试连接失败:', error);
                          resolve(false);
                        });
                    }, 2000);
                    return;
                  }
                  
                  // 即使连接失败，也不阻止应用继续运行
                  console.warn('应用将以有限功能模式运行，实时通讯功能不可用');
                  toast.warning('信令服务器连接失败，视频通话功能不可用');
                  
                  // 显示启动服务器的提示
                  console.info('提示: 请确保已启动后端服务器，可以运行 "node server.js" 启动服务器');
                  
                  resolve(false); // 返回false而不是reject，允许应用继续运行
                }
              }, 10000);
            } else {
              console.warn('无法创建Socket连接，应用将以有限功能模式运行');
              resolve(false); // 返回false而不是reject，允许应用继续运行
            }
          }
        };
        
        // 设置超时计时器
        connectionTimeoutId = setTimeout(connectionTimeout, 15000); // 15秒超时

        // 设置连接事件
        this.socket.on('connect', () => {
          console.log('WebSocket连接成功');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // 清除连接超时计时器
          clearTimeout(connectionTimeoutId);
          
          // 将socket实例添加到window对象，方便全局访问
          window.socket = this.socket;
          
          if (this.callbacks.onConnect) {
            this.callbacks.onConnect();
          }
          
          resolve(true);
        });

        // 设置断开连接事件
        this.socket.on('disconnect', (reason) => {
          console.log(`WebSocket断开连接: ${reason}`);
          this.isConnected = false;
          
          if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect(reason);
          }
        });

        // 设置重连事件
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`WebSocket尝试重连 (${attemptNumber}/${this.maxReconnectAttempts})`);
          this.reconnectAttempts = attemptNumber;
          
          if (this.callbacks.onReconnectAttempt) {
            this.callbacks.onReconnectAttempt(attemptNumber);
          }
        });

        // 设置重连失败事件
        this.socket.on('reconnect_failed', () => {
          console.error('WebSocket重连失败');
          
          // 清除连接超时计时器
          clearTimeout(connectionTimeoutId);
          
          if (this.callbacks.onReconnectFailed) {
            this.callbacks.onReconnectFailed();
          }
          
          // 显示友好的错误提示
          toast.warning('服务器连接失败，部分功能可能不可用');
          
          // 不阻止应用继续运行
          if (!this.isConnected) {
            reject(new Error('WebSocket重连失败'));
          }
        });
        
        // 设置连接错误事件
        this.socket.on('connect_error', (error) => {
          console.error('WebSocket连接错误:', error);
          
          // 清除连接超时计时器
          clearTimeout(connectionTimeoutId);
          
          // 显示友好的错误提示，但不阻止应用运行
          console.warn('信令服务器连接失败，视频通话功能可能不可用');
          
          if (this.callbacks.onConnectError) {
            this.callbacks.onConnectError(error);
          }
        });

        // 设置错误事件
        this.socket.on('error', (error) => {
          console.error('WebSocket错误:', error);
          
          // 清除连接超时计时器
          clearTimeout(connectionTimeoutId);
          
          if (this.callbacks.onError) {
            this.callbacks.onError(error);
          }
          
          // 显示友好的错误提示
          toast.error('网络连接错误，部分功能可能不可用');
          
          // 不立即reject，允许应用继续运行
          if (!this.isConnected) {
            reject(error);
          }
        });

        // 设置专家通知事件
        this.socket.on('expert-notification', (data) => {
          console.log('收到专家通知:', data);
          
          // 如果是专家收到咨询通知，显示提示并播放音效
          if (userData?.isExpert && data.expertId === userData.expertId) {
            // 显示通知
            toast.info(`用户 ${data.username} 发起了${data.consultationType === 'text' ? '文字' : 
                                              data.consultationType === 'audio' ? '语音' : '视频'}咨询`);
            
            // 播放通知音效
            try {
              const audio = new Audio('/assets/notification.mp3');
              audio.play().catch(e => console.error('通知音效播放失败:', e));
            } catch (error) {
              console.error('播放通知音效失败:', error);
            }
            
            if (this.callbacks.onExpertNotification) {
              this.callbacks.onExpertNotification(data);
            }
          }
        });

        // 设置用户通知事件
        this.socket.on('user-notification', (data) => {
          console.log('收到用户通知:', data);
          
          if (this.callbacks.onUserNotification) {
            this.callbacks.onUserNotification(data);
          }
        });

      } catch (error) {
        console.error('初始化WebSocket连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 检查信令服务器是否可用
   * @param {string} serverUrl - 信令服务器URL
   * @private
   */
  checkServerAvailability(serverUrl) {
    // 使用fetch API检查服务器状态
    fetch(`${serverUrl}/signal-status`)
      .then(response => {
        if (response.ok) {
          console.log('信令服务器状态检查成功');
        } else {
          console.warn('信令服务器状态检查失败，服务器可能不可用');
          toast.warning('信令服务器连接失败，视频通话功能可能不可用');
        }
      })
      .catch(error => {
        console.warn('信令服务器状态检查失败:', error);
        // 尝试启动本地服务器的提示
        console.info('提示: 请确保已启动后端服务器，可以运行 "node server.js" 启动服务器');
        toast.warning('信令服务器连接失败，视频通话功能不可用');
      });
  }

  /**
   * 设置回调函数
   * @param {Object} callbacks - 回调函数对象
   */
  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  /**
   * 发送消息
   * @param {string} event - 事件名称
   * @param {Object} data - 消息数据
   * @returns {boolean} 发送结果
   */
  emit(event, data) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法发送消息');
      return false;
    }
    
    this.socket.emit(event, data);
    return true;
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      window.socket = null;
    }
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;