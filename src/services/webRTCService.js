/**
 * WebRTC服务 - 用于处理实时音视频通信
 */

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isInitiator = false;
    this.isStarted = false;
    this.isChannelReady = false;
    this.dataChannel = null;
    this.onRemoteStreamCallback = null;
    this.onDataChannelMessageCallback = null;
    this.onConnectionStateChangeCallback = null;
  }

  // 初始化WebRTC连接
  async initialize(isInitiator = false) {
    this.isInitiator = isInitiator;
    
    try {
      // 创建RTCPeerConnection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      };
      
      this.peerConnection = new RTCPeerConnection(configuration);
      
      // 设置事件监听器
      this.peerConnection.onicecandidate = this.handleIceCandidate.bind(this);
      this.peerConnection.ontrack = this.handleRemoteStreamAdded.bind(this);
      this.peerConnection.oniceconnectionstatechange = this.handleConnectionStateChange.bind(this);
      
      // 如果是发起方，创建数据通道
      if (this.isInitiator) {
        this.dataChannel = this.peerConnection.createDataChannel('chat');
        this.setupDataChannel();
      } else {
        // 如果是接收方，监听数据通道
        this.peerConnection.ondatachannel = (event) => {
          this.dataChannel = event.channel;
          this.setupDataChannel();
        };
      }
      
      return true;
    } catch (error) {
      console.error('初始化WebRTC连接失败:', error);
      return false;
    }
  }

  // 设置数据通道
  setupDataChannel() {
    if (!this.dataChannel) return;
    
    this.dataChannel.onopen = () => {
      console.log('数据通道已打开');
    };
    
    this.dataChannel.onclose = () => {
      console.log('数据通道已关闭');
    };
    
    this.dataChannel.onmessage = (event) => {
      if (this.onDataChannelMessageCallback) {
        this.onDataChannelMessageCallback(event.data);
      }
    };
  }

  // 处理ICE候选
  handleIceCandidate(event) {
    if (event.candidate) {
      // 在实际应用中，这里应该通过信令服务器发送ICE候选给对方
      const candidateInfo = {
        type: 'candidate',
        candidate: event.candidate
      };
      
      // 发送到信令服务器的代码
      // signallingServer.send(JSON.stringify(candidateInfo));
      console.log('发送ICE候选:', candidateInfo);
    }
  }

  // 处理远程流添加
  handleRemoteStreamAdded(event) {
    this.remoteStream = event.streams[0];
    
    if (this.onRemoteStreamCallback) {
      this.onRemoteStreamCallback(this.remoteStream);
    }
  }

  // 处理连接状态变化
  handleConnectionStateChange() {
    const state = this.peerConnection.iceConnectionState;
    console.log('ICE连接状态变化:', state);
    
    if (this.onConnectionStateChangeCallback) {
      this.onConnectionStateChangeCallback(state);
    }
  }

  // 获取本地媒体流
  async getLocalStream(constraints = { audio: true, video: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('获取本地媒体流失败:', error);
      throw error;
    }
  }

  // 添加本地流到对等连接
  addLocalStream() {
    if (!this.localStream || !this.peerConnection) return false;
    
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    
    return true;
  }

  // 创建提议
  async createOffer() {
    if (!this.peerConnection) return null;
    
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // 在实际应用中，这里应该通过信令服务器发送提议给对方
      // signallingServer.send(JSON.stringify(offer));
      console.log('创建并发送提议:', offer);
      
      return offer;
    } catch (error) {
      console.error('创建提议失败:', error);
      return null;
    }
  }

  // 创建应答
  async createAnswer() {
    if (!this.peerConnection) return null;
    
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      // 在实际应用中，这里应该通过信令服务器发送应答给对方
      // signallingServer.send(JSON.stringify(answer));
      console.log('创建并发送应答:', answer);
      
      return answer;
    } catch (error) {
      console.error('创建应答失败:', error);
      return null;
    }
  }

  // 处理收到的提议
  async handleOffer(offer) {
    if (!this.peerConnection) return false;
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.createAnswer();
      return answer;
    } catch (error) {
      console.error('处理提议失败:', error);
      return false;
    }
  }

  // 处理收到的应答
  async handleAnswer(answer) {
    if (!this.peerConnection) return false;
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      return true;
    } catch (error) {
      console.error('处理应答失败:', error);
      return false;
    }
  }

  // 处理收到的ICE候选
  async handleCandidate(candidate) {
    if (!this.peerConnection) return false;
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      return true;
    } catch (error) {
      console.error('处理ICE候选失败:', error);
      return false;
    }
  }

  // 发送数据通道消息
  sendMessage(message) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('数据通道未打开，无法发送消息');
      return false;
    }
    
    try {
      this.dataChannel.send(message);
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  }

  // 关闭连接
  close() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
    this.isStarted = false;
    this.isChannelReady = false;
  }

  // 设置回调函数
  setCallbacks(callbacks) {
    const { onRemoteStream, onDataChannelMessage, onConnectionStateChange } = callbacks;
    
    if (onRemoteStream) {
      this.onRemoteStreamCallback = onRemoteStream;
    }
    
    if (onDataChannelMessage) {
      this.onDataChannelMessageCallback = onDataChannelMessage;
    }
    
    if (onConnectionStateChange) {
      this.onConnectionStateChangeCallback = onConnectionStateChange;
    }
  }
}

export default new WebRTCService();