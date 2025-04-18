import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Badge,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Message as MessageIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Phone as PhoneIcon,
  PhoneDisabled as PhoneDisabledIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import webRTCService from '../../services/webRTCService';
import signalingService from '../../services/signalingService';

// 聊天模式
const CHAT_MODES = {
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video'
};

// 连接状态
const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

const ExpertConsultationChat = ({ expert, onClose, initialMode = CHAT_MODES.TEXT }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.DISCONNECTED);
  const [error, setError] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // 生成聊天室ID
  const getChatRoomId = () => {
    // 确保聊天室ID对于两个用户是相同的，无论谁发起
    const ids = [currentUser.id, expert.id].sort();
    return `chat_${ids[0]}_${ids[1]}`;
  };
  
  // 初始化聊天
  useEffect(() => {
    // 添加欢迎消息
    const welcomeMessage = {
      id: Date.now(),
      sender: 'expert',
      senderName: expert?.username || '健康专家',
      content: `您好，我是${expert?.username || '健康专家'}，很高兴为您提供健康咨询服务。请问您有什么健康问题需要咨询？`,
      timestamp: new Date().toISOString(),
      avatar: expert?.avatar || '/pictures/men1.jpg'
    };
    
    setMessages([welcomeMessage]);
    
    // 加载历史消息
    loadChatHistory();
    
    // 初始化信令服务
    initializeSignaling();
    
    return () => {
      // 组件卸载时清理资源
      cleanupResources();
    };
  }, []);
  
  // 初始化信令服务
  const initializeSignaling = async () => {
    try {
      // 初始化信令服务
      await signalingService.initialize('http://localhost:5001');
      
      // 设置回调函数
      signalingService.setCallbacks({
        onConnect: handleSignalingConnect,
        onDisconnect: handleSignalingDisconnect,
        onError: handleSignalingError,
        onJoinRoom: handleJoinRoom,
        onOffer: handleOffer,
        onAnswer: handleAnswer,
        onCandidate: handleCandidate,
        onUserJoined: handleUserJoined,
        onUserLeft: handleUserLeft,
        onMessage: handleChatMessage
      });
      
      // 加入聊天室
      const roomId = getChatRoomId();
      signalingService.joinRoom(roomId, currentUser.id);
      
      return true;
    } catch (error) {
      console.error('初始化信令服务失败:', error);
      setError('连接聊天服务失败，请稍后再试');
      return false;
    }
  };
  
  // 处理信令连接成功
  const handleSignalingConnect = () => {
    console.log('信令服务连接成功');
  };
  
  // 处理信令断开连接
  const handleSignalingDisconnect = () => {
    console.log('信令服务断开连接');
    setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
    
    // 添加系统消息
    addSystemMessage('聊天服务已断开，请刷新页面重试');
  };
  
  // 处理信令错误
  const handleSignalingError = (error) => {
    console.error('信令服务错误:', error);
    setError(`聊天服务错误: ${error}`);
    setConnectionStatus(CONNECTION_STATUS.ERROR);
  };
  
  // 处理加入房间
  const handleJoinRoom = (roomId) => {
    console.log(`已加入聊天室: ${roomId}`);
  };
  
  // 处理用户加入
  const handleUserJoined = (userId) => {
    console.log(`用户加入: ${userId}`);
    
    // 如果是专家加入，且当前用户不是专家，则发起WebRTC连接
    if (userId === expert.id && !currentUser.isExpert) {
      initializeWebRTC(true); // 作为发起方
    }
  };
  
  // 处理用户离开
  const handleUserLeft = (userId) => {
    console.log(`用户离开: ${userId}`);
    
    if (userId === expert.id) {
      // 专家离开，添加系统消息
      addSystemMessage('专家已离线，请稍后再试');
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
    }
  };
  
  // 处理聊天消息
  const handleChatMessage = (message, from) => {
    // 处理文本消息
    if (message.type === 'chat') {
      // 确定消息发送者
      const isSelf = from === currentUser.id;
      const isExpertUser = currentUser.isExpert;
      
      // 创建消息对象
      const newMessage = {
        id: Date.now(),
        sender: isSelf ? (isExpertUser ? 'expert' : 'user') : (isExpertUser ? 'user' : 'expert'),
        senderName: isSelf ? '我' : (isExpertUser ? '用户' : expert.username),
        content: message.content,
        timestamp: new Date().toISOString(),
        avatar: isSelf ? 
          (isExpertUser ? (currentUser.avatar || '/pictures/men1.jpg') : 'https://randomuser.me/api/portraits/lego/1.jpg') : 
          (isExpertUser ? 'https://randomuser.me/api/portraits/lego/1.jpg' : expert.avatar)
      };
      
      // 添加消息到列表
      setMessages(prev => [...prev, newMessage]);
      
      // 如果当前用户是专家，且收到的是用户消息，则可以回复
      if (isExpertUser && !isSelf) {
        // 专家可以在此处手动回复，不需要自动回复
        console.log('收到用户消息，专家可以回复');
      }
      
      // 如果当前用户不是专家，且收到的是专家消息，则显示
      if (!isExpertUser && !isSelf) {
        console.log('收到专家回复');
      }
    }
  };
  
  // 加载聊天历史
  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      
      // 这里应该调用API获取聊天历史
      // const response = await fetch(`/api/chat/messages/${currentUser.id}/${expert.id}`);
      // const data = await response.json();
      
      // 模拟历史消息
      const mockHistory = [
        {
          id: Date.now() - 10000,
          sender: 'user',
          senderName: '我',
          content: '最近感觉有些疲劳，请问有什么调理方法吗？',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        {
          id: Date.now() - 9000,
          sender: 'expert',
          senderName: expert?.username || '健康专家',
          content: '您好，疲劳可能与多种因素有关。请问您的作息规律如何？是否有熬夜的情况？',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          avatar: expert?.avatar || '/pictures/men1.jpg'
        }
      ];
      
      // 更新消息列表，保留欢迎消息
      setMessages(prev => [...mockHistory, ...prev]);
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      setError('加载聊天历史失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 停止媒体流
  const stopMediaStream = () => {
    if (webRTCService.localStream) {
      webRTCService.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setIsMicActive(false);
    setIsVideoActive(false);
  };
  
  // 切换聊天模式
  const switchMode = async (newMode) => {
    if (newMode === mode) return;
    
    // 停止当前媒体流
    stopMediaStream();
    
    // 设置新模式
    setMode(newMode);
    
    // 如果是音频或视频模式，启动媒体流
    if (newMode === CHAT_MODES.AUDIO || newMode === CHAT_MODES.VIDEO) {
      await startMediaStream();
    }
    
    // 添加系统消息
    addSystemMessage(`已切换到${newMode === CHAT_MODES.TEXT ? '文字' : newMode === CHAT_MODES.AUDIO ? '语音' : '视频'}聊天模式`);
  };
  
  // 切换麦克风
  const toggleMicrophone = async () => {
    if (!webRTCService.localStream) return;
    
    const audioTracks = webRTCService.localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      // 如果没有音频轨道，尝试添加
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = stream.getAudioTracks()[0];
        webRTCService.localStream.addTrack(audioTrack);
        setIsMicActive(true);
      } catch (error) {
        console.error('添加音频轨道失败:', error);
        setError('无法访问麦克风，请检查设备权限');
      }
    } else {
      // 切换现有音频轨道的状态
      const enabled = !audioTracks[0].enabled;
      audioTracks.forEach(track => {
        track.enabled = enabled;
      });
      setIsMicActive(enabled);
    }
  };
  
  // 切换摄像头
  const toggleCamera = async () => {
    if (!webRTCService.localStream) return;
    
    const videoTracks = webRTCService.localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      // 如果没有视频轨道，尝试添加
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        webRTCService.localStream.addTrack(videoTrack);
        setIsVideoActive(true);
      } catch (error) {
        console.error('添加视频轨道失败:', error);
        setError('无法访问摄像头，请检查设备权限');
      }
    } else {
      // 切换现有视频轨道的状态
      const enabled = !videoTracks[0].enabled;
      videoTracks.forEach(track => {
        track.enabled = enabled;
      });
      setIsVideoActive(enabled);
    }
  };
  
  // 发送消息
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // 创建消息对象
    const message = {
      type: 'chat',
      content: newMessage.trim()
    };
    
    // 添加到本地消息列表
    const newMessageObj = {
      id: Date.now(),
      sender: currentUser.isExpert ? 'expert' : 'user',
      senderName: currentUser.isExpert ? (currentUser.username || '健康专家') : '我',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      avatar: currentUser.isExpert ? (currentUser.avatar || '/pictures/men1.jpg') : 'https://randomuser.me/api/portraits/lego/1.jpg'
    };
    
    setMessages(prev => [...prev, newMessageObj]);
    
    // 通过WebRTC数据通道发送（如果已连接）
    if (connectionStatus === CONNECTION_STATUS.CONNECTED && webRTCService.dataChannel) {
      webRTCService.dataChannel.send(JSON.stringify(message));
    } else {
      // 否则通过信令服务器发送
      signalingService.sendMessage(message, expert.id);
    }
    
    // 如果当前用户不是专家，模拟专家回复
    if (!currentUser.isExpert) {
      // 获取专家回复内容
      const expertReplyContent = handleExpertReply(newMessage.trim());
      
      // 延迟显示专家回复，模拟真实对话
      setTimeout(() => {
        const expertReply = {
          id: Date.now(),
          sender: 'expert',
          senderName: expert?.username || '健康专家',
          content: expertReplyContent,
          timestamp: new Date().toISOString(),
          avatar: expert?.avatar || '/pictures/men1.jpg'
        };
        
        setMessages(prev => [...prev, expertReply]);
      }, 1500);
    }
    
    // 清空输入框
    setNewMessage('');
  };
  
  // 模拟专家回复，根据用户消息内容生成不同回复
  const simulateExpertReply = (userMessage) => {
    setTimeout(() => {
      // 根据用户消息内容生成不同的回复
      let replyContent = '';
      
      if (userMessage.includes('疼痛') || userMessage.includes('痛')) {
        replyContent = '您好，关于疼痛问题，我需要了解更多信息。疼痛的位置在哪里？是持续性还是间歇性的？什么情况下会加重或缓解？';
      } else if (userMessage.includes('睡眠') || userMessage.includes('失眠')) {
        replyContent = '睡眠问题可能与多种因素有关，如作息不规律、压力大、饮食等。建议您保持规律的作息时间，睡前避免使用电子产品，可以尝试热水泡脚或轻度拉伸放松身心。';
      } else if (userMessage.includes('头痛') || userMessage.includes('头晕')) {
        replyContent = '头痛/头晕可能与多种因素有关，如疲劳、颈椎问题、眼睛疲劳等。建议您注意休息，保持良好坐姿，必要时可以按摩太阳穴和风池穴位缓解症状。';
      } else if (userMessage.includes('饮食') || userMessage.includes('吃')) {
        replyContent = '健康的饮食应当均衡多样，建议多摄入新鲜蔬果，适量优质蛋白，减少精加工食品和高糖高脂食物的摄入。根据个人体质，可以适当调整饮食结构。';
      } else if (userMessage.includes('运动') || userMessage.includes('锻炼')) {
        replyContent = '适当的运动对健康非常有益。建议您根据自身情况选择合适的运动方式，如散步、太极、游泳等。每周保持3-5次，每次30分钟以上的中等强度运动。';
      } else {
        // 默认回复，但不是固定的，有多种可能
        const defaultReplies = [
          `感谢您的咨询。请问您能详细描述一下您的健康状况和具体问题吗？这样我可以给您更准确的建议。`,
          `您好，我已收到您的咨询。为了更好地了解您的情况，能否告诉我您的年龄、性别以及是否有慢性疾病史？`,
          `您的问题我已了解。从传统健康角度，我建议您注意作息规律，保持心情舒畅，适当运动。您有更具体的问题想咨询吗？`,
          `根据您提供的信息，我需要了解更多细节才能给出专业建议。您能否描述一下症状持续时间、是否有其他不适感？`
        ];
        
        // 随机选择一个回复
        const randomIndex = Math.floor(Math.random() * defaultReplies.length);
        replyContent = defaultReplies[randomIndex];
      }
      
      // 创建专家回复消息
      const expertReply = {
        id: Date.now(),
        sender: 'expert',
        senderName: expert?.username || '健康专家',
        content: replyContent,
        timestamp: new Date().toISOString(),
        avatar: expert?.avatar || '/pictures/men1.jpg'
      };
      
      // 添加到消息列表
      setMessages(prev => [...prev, expertReply]);
    }, 1500);
  };
  
  // 添加系统消息
  const addSystemMessage = (content) => {
    const systemMessage = {
      id: Date.now(),
      sender: 'system',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };
  
  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // 清理资源
  const cleanupResources = () => {
    // 停止媒体流
    stopMediaStream();
    
    // 关闭WebRTC连接
    if (webRTCService) {
      webRTCService.close();
    }
    
    // 离开聊天室
    if (signalingService && signalingService.isConnected) {
      signalingService.leaveRoom();
      signalingService.disconnect();
    }
  };
  
  // 处理输入变化
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };
  
  // 专家回复用户消息
  const handleExpertReply = (userMessageContent) => {
    // 根据用户消息内容生成专家回复
    let replyContent = '';
    
    // 分析用户消息内容，生成相应的回复
    if (userMessageContent.includes('疼痛') || userMessageContent.includes('痛')) {
      replyContent = '您好，关于疼痛问题，我需要了解更多信息。疼痛的位置在哪里？是持续性还是间歇性的？什么情况下会加重或缓解？';
    } else if (userMessageContent.includes('睡眠') || userMessageContent.includes('失眠')) {
      replyContent = '睡眠问题可能与多种因素有关，如作息不规律、压力大、饮食等。建议您保持规律的作息时间，睡前避免使用电子产品，可以尝试热水泡脚或轻度拉伸放松身心。';
    } else if (userMessageContent.includes('头痛') || userMessageContent.includes('头晕')) {
      replyContent = '头痛/头晕可能与多种因素有关，如疲劳、颈椎问题、眼睛疲劳等。建议您注意休息，保持良好坐姿，必要时可以按摩太阳穴和风池穴位缓解症状。';
    } else if (userMessageContent.includes('饮食') || userMessageContent.includes('吃')) {
      replyContent = '健康的饮食应当均衡多样，建议多摄入新鲜蔬果，适量优质蛋白，减少精加工食品和高糖高脂食物的摄入。根据个人体质，可以适当调整饮食结构。';
    } else if (userMessageContent.includes('运动') || userMessageContent.includes('锻炼')) {
      replyContent = '适当的运动对健康非常有益。建议您根据自身情况选择合适的运动方式，如散步、太极、游泳等。每周保持3-5次，每次30分钟以上的中等强度运动。';
    } else {
      // 默认回复，但不是固定的，有多种可能
      const defaultReplies = [
        `感谢您的咨询。请问您能详细描述一下您的健康状况和具体问题吗？这样我可以给您更准确的建议。`,
        `您好，我已收到您的咨询。为了更好地了解您的情况，能否告诉我您的年龄、性别以及是否有慢性疾病史？`,
        `您的问题我已了解。从传统健康角度，我建议您注意作息规律，保持心情舒畅，适当运动。您有更具体的问题想咨询吗？`,
        `根据您提供的信息，我需要了解更多细节才能给出专业建议。您能否描述一下症状持续时间、是否有其他不适感？`
      ];
      
      // 随机选择一个回复
      const randomIndex = Math.floor(Math.random() * defaultReplies.length);
      replyContent = defaultReplies[randomIndex];
    }
    
    return replyContent;
  };
  
  // 处理按键事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // 启动媒体流
  const startMediaStream = async () => {
    try {
      const constraints = {
        audio: mode === CHAT_MODES.AUDIO || mode === CHAT_MODES.VIDEO,
        video: mode === CHAT_MODES.VIDEO
      };
      
      const stream = await webRTCService.getLocalStream(constraints);
      
      if (mode === CHAT_MODES.VIDEO && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // 添加流到对等连接
      webRTCService.addLocalStream();
      
      // 设置初始状态
      setIsMicActive(constraints.audio);
      setIsVideoActive(constraints.video);
      
      return true;
    } catch (error) {
      console.error('获取媒体流失败:', error);
      setError(`无法访问${mode === CHAT_MODES.VIDEO ? '摄像头' : '麦克风'}，请检查设备权限`);
      return false;
    }
  };
  
  // 处理连接状态变化
  const handleConnectionStateChange = (state) => {
    console.log(`WebRTC连接状态: ${state}`);
    
    if (state === 'connected' || state === 'completed') {
      setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      addSystemMessage('连接已建立');
    } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      addSystemMessage('连接已断开');
    }
  };
  
  // 处理数据通道消息
  const handleDataChannelMessage = (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'chat') {
        const newMessage = {
          id: Date.now(),
          sender: 'expert',
          senderName: expert.username || '健康专家',
          content: data.content,
          timestamp: new Date().toISOString(),
          avatar: expert.avatar || '/pictures/men1.jpg'
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('处理数据通道消息失败:', error);
    }
  };
  
  // 滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 初始化WebRTC
  const initializeWebRTC = async (isInitiator) => {
    try {
      // 初始化WebRTC服务
      await webRTCService.initialize(isInitiator);
      
      // 设置回调函数
      webRTCService.setCallbacks({
        onRemoteStream: handleRemoteStream,
        onDataChannelMessage: handleDataChannelMessage,
        onConnectionStateChange: handleConnectionStateChange
      });
      
      // 如果是音频或视频模式，获取本地媒体流
      if (mode === CHAT_MODES.AUDIO || mode === CHAT_MODES.VIDEO) {
        await startMediaStream();
      }
      
      // 如果是发起方，创建并发送提议
      if (isInitiator) {
        const offer = await webRTCService.createOffer();
        if (offer) {
          signalingService.sendOffer(offer, expert.id);
        }
      }
      
      return true;
    } catch (error) {
      console.error('初始化WebRTC失败:', error);
      setError('初始化视频通话失败，请稍后再试');
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      return false;
    }
  };
  
  // 处理收到的提议
  const handleOffer = async (offer, from) => {
    if (from !== expert.id && currentUser.isExpert) return;
    
    try {
      // 初始化WebRTC（作为接收方）
      await initializeWebRTC(false);
      
      // 处理提议并创建应答
      const answer = await webRTCService.handleOffer(offer);
      if (answer) {
        signalingService.sendAnswer(answer, from);
      }
    } catch (error) {
      console.error('处理提议失败:', error);
      setError('处理视频通话提议失败，请稍后再试');
      setConnectionStatus(CONNECTION_STATUS.ERROR);
    }
  };

  // 处理收到的应答
  const handleAnswer = async (answer, from) => {
    if (from !== expert.id && currentUser.isExpert) return;
    
    try {
      await webRTCService.handleAnswer(answer);
      setConnectionStatus(CONNECTION_STATUS.CONNECTED);
    } catch (error) {
      console.error('处理应答失败:', error);
      setError('处理视频通话应答失败，请稍后再试');
      setConnectionStatus(CONNECTION_STATUS.ERROR);
    }
  };
  
  // 处理收到的ICE候选
  const handleCandidate = async (candidate, from) => {
    if (from !== expert.id && currentUser.isExpert) return;
    
    try {
      await webRTCService.handleCandidate(candidate);
    } catch (error) {
      console.error('处理ICE候选失败:', error);
    }
  };
  
  // 处理远程流添加
  const handleRemoteStream = (stream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
    setConnectionStatus(CONNECTION_STATUS.CONNECTED);
  };
  
  // 渲染聊天界面
  return (
    <Paper 
      elevation={3} 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        maxHeight: '700px',
        width: '100%',
        maxWidth: '900px',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      {/* 专家操作按钮 - 仅在专家登录时显示 */}
      {currentUser?.isExpert && (
        <Box sx={{ p: 1, bgcolor: 'primary.light', display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<MessageIcon />}
            onClick={() => addSystemMessage('已接收咨询请求')}
          >
            接收咨询
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<SendIcon />}
            onClick={() => {
              if (newMessage.trim()) {
                sendMessage();
              } else {
                setError('请先输入回复内容');
              }
            }}
          >
            回复消息
          </Button>
        </Box>
      )}
      {/* 聊天头部 */}
      <Box 
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={expert?.avatar || '/pictures/men1.jpg'} 
            alt={expert?.username || '健康专家'}
            sx={{ mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{expert?.username || '健康专家'}</Typography>
            <Typography variant="body2">
              {connectionStatus === CONNECTION_STATUS.CONNECTED ? '在线' : 
               connectionStatus === CONNECTION_STATUS.CONNECTING ? '连接中...' : 
               connectionStatus === CONNECTION_STATUS.ERROR ? '连接错误' : '离线'}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Tooltip title="文字聊天">
            <IconButton 
              color={mode === CHAT_MODES.TEXT ? 'secondary' : 'inherit'}
              onClick={() => switchMode(CHAT_MODES.TEXT)}
            >
              <MessageIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="语音聊天">
            <IconButton 
              color={mode === CHAT_MODES.AUDIO ? 'secondary' : 'inherit'}
              onClick={() => switchMode(CHAT_MODES.AUDIO)}
            >
              <PhoneIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="视频聊天">
            <IconButton 
              color={mode === CHAT_MODES.VIDEO ? 'secondary' : 'inherit'}
              onClick={() => switchMode(CHAT_MODES.VIDEO)}
            >
              <VideocamIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="关闭">
            <IconButton color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* 错误提示 */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ m: 1 }}>
          {error}
        </Alert>
      )}
      
      {/* 聊天内容区域 */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* 消息列表 */}
        <Box 
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            ...(mode === CHAT_MODES.VIDEO && { maxWidth: '60%' })
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {messages.map((message) => (
                <ListItem 
                  key={message.id}
                  alignItems="flex-start"
                  sx={{
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    p: 1
                  }}
                >
                  {message.sender !== 'system' && (
                    <ListItemAvatar>
                      <Avatar src={message.avatar} alt={message.senderName} />
                    </ListItemAvatar>
                  )}
                  
                  <ListItemText
                    primary={
                      message.sender !== 'system' ? (
                        <Typography 
                          variant="subtitle2"
                          align={message.sender === 'user' ? 'right' : 'left'}
                        >
                          {message.senderName}
                        </Typography>
                      ) : null
                    }
                    secondary={
                      <Paper 
                        elevation={1}
                        sx={{
                          p: 1.5,
                          mt: 0.5,
                          borderRadius: 2,
                          display: 'inline-block',
                          maxWidth: '80%',
                          bgcolor: message.sender === 'system' 
                            ? 'grey.100'
                            : message.sender === 'user'
                              ? 'primary.light'
                              : 'secondary.light',
                          color: message.sender === 'system'
                            ? 'text.primary'
                            : 'white'
                        }}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 0.5,
                            opacity: 0.8,
                            textAlign: message.sender === 'user' ? 'right' : 'left'
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    }
                    secondaryTypographyProps={{
                      component: 'div',
                      align: message.sender === 'user' ? 'right' : 'left'
                    }}
                    sx={{ m: 0 }}
                  />
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>
        
        {/* 视频区域 */}
        {mode === CHAT_MODES.VIDEO && (
          <Box 
            sx={{
              width: '40%',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.900'
            }}
          >
            {/* 远程视频 */}
            <Box 
              sx={{
                width: '100%',
                height: '70%',
                mb: 2,
                bgcolor: 'black',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {connectionStatus !== CONNECTION_STATUS.CONNECTED && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white'
                  }}
                >
                  {connectionStatus === CONNECTION_STATUS.CONNECTING ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <Typography>等待连接...</Typography>
                  )}
                </Box>
              )}
            </Box>
            
            {/* 本地视频 */}
            <Box 
              sx={{
                width: '40%',
                height: '30%',
                bgcolor: 'black',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {!isVideoActive && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white'
                  }}
                >
                  <Typography variant="caption">摄像头已关闭</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* 音频/视频控制 */}
      {(mode === CHAT_MODES.AUDIO || mode === CHAT_MODES.VIDEO) && (
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.100'
          }}
        >
          <Tooltip title={isMicActive ? '关闭麦克风' : '打开麦克风'}>
            <IconButton 
              color={isMicActive ? 'primary' : 'default'}
              onClick={toggleMicrophone}
            >
              {isMicActive ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
          </Tooltip>
          
          {mode === CHAT_MODES.VIDEO && (
            <Tooltip title={isVideoActive ? '关闭摄像头' : '打开摄像头'}>
              <IconButton 
                color={isVideoActive ? 'primary' : 'default'}
                onClick={toggleCamera}
              >
                {isVideoActive ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="结束通话">
            <IconButton 
              color="error"
              onClick={() => switchMode(CHAT_MODES.TEXT)}
            >
              <PhoneDisabledIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      {/* 消息输入区域 */}
      <Box 
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          placeholder="输入消息..."
          variant="outlined"
          size="small"
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={mode !== CHAT_MODES.TEXT || connectionStatus === CONNECTION_STATUS.ERROR}
          InputProps={{
            endAdornment: (
              <IconButton 
                color="primary" 
                onClick={sendMessage}
                disabled={!newMessage.trim() || mode !== CHAT_MODES.TEXT || connectionStatus === CONNECTION_STATUS.ERROR}
              >
                <SendIcon />
              </IconButton>
            )
          }}
        />
      </Box>
    </Paper>
  );
};

export default ExpertConsultationChat;