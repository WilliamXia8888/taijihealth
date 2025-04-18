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
  Chip
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

// 初始消息数据将根据传入的专家信息动态生成
const getInitialMessages = (expert) => [
  {
    id: 1,
    sender: 'expert',
    senderName: expert?.name || '健康专家',
    content: `您好，我是${expert?.name || '健康专家'}，很高兴为您提供健康咨询服务。请问您有什么健康问题需要咨询？`,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    avatar: expert?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
  }
];

const ChatInterface = ({ expert, onClose, chatMode = 'text' }) => {
  const { isExpertOnline } = useAuth();
  const [messages, setMessages] = useState(() => getInitialMessages(expert));
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(chatMode); // 'text', 'audio', 'video'
  const [mediaStream, setMediaStream] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const [expertIsOnline, setExpertIsOnline] = useState(false);
  
  // 检查专家是否在线并初始化WebSocket连接
  useEffect(() => {
    if (expert && expert.id) {
      // 使用专家ID检查在线状态
      const online = isExpertOnline(expert.id);
      setExpertIsOnline(online);
      
      console.log(`专家 ${expert.name} (ID: ${expert.id}) 在线状态: ${online ? '在线' : '离线'}`);
      
      // 添加专家在线状态系统消息
      const systemMessage = {
        id: Date.now(),
        sender: 'system',
        content: online ? 
          `${expert.name} 在线，正在为您提供人工咨询服务` : 
          `${expert.name} 当前不在线，将由智能助手为您解答问题`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // 如果专家在线，尝试建立WebSocket连接
      if (online && window.socket) {
        // 发送聊天会话创建通知
        try {
          window.socket.emit('chat-session-created', {
            expertId: expert.id,
            userId: 'user', // 实际应用中应该使用真实用户ID
            sessionId: `chat_${Date.now()}`,
            mode: mode
          });
          console.log('已发送聊天会话创建通知');
        } catch (error) {
          console.error('发送聊天会话创建通知失败:', error);
        }
      }
    }
  }, [expert, isExpertOnline, mode]);
  
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 处理发送消息
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      senderName: '我',
      content: newMessage,
      timestamp: new Date().toISOString(),
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' // 用户头像
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    // 根据专家是否在线决定回复方式
    const replyDelay = expertIsOnline ? 2500 : 1500; // 专家回复稍慢一些，更真实
    
    setTimeout(() => {
      // 如果专家在线，显示专家正在回复
      if (expertIsOnline) {
        // 模拟专家人工回复
        const expertReply = {
          id: Date.now() + 1,
          sender: 'expert',
          senderName: expert?.name || '医师',
          content: `您好，我是${expert?.name}。我已收到您关于"${newMessage.substring(0, 20)}${newMessage.length > 20 ? '...' : ''}"的咨询。请问您能提供更多详细信息，以便我给您更准确的健康建议？`,
          timestamp: new Date().toISOString(),
          avatar: expert?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
          isHuman: true
        };
        
        setMessages(prev => [...prev, expertReply]);
        setIsLoading(false);
      } else {
        // 机器人自动回复
        // 分析用户消息内容，生成相应的回复
        let replyContent = '';
        
        if (newMessage.includes('疼痛') || newMessage.includes('痛')) {
          replyContent = '您好，关于疼痛问题，我需要了解更多信息。疼痛的位置在哪里？是持续性还是间歇性的？什么情况下会加重或缓解？';
        } else if (newMessage.includes('睡眠') || newMessage.includes('失眠')) {
          replyContent = '睡眠问题可能与多种因素有关，如作息不规律、压力大、饮食等。建议您保持规律的作息时间，睡前避免使用电子产品，可以尝试热水泡脚或轻度拉伸放松身心。';
        } else if (newMessage.includes('头痛') || newMessage.includes('头晕')) {
          replyContent = '头痛/头晕可能与多种因素有关，如疲劳、颈椎问题、眼睛疲劳等。建议您注意休息，保持良好坐姿，必要时可以按摩太阳穴和风池穴位缓解症状。';
        } else if (newMessage.includes('饮食') || newMessage.includes('吃')) {
          replyContent = '健康的饮食应当均衡多样，建议多摄入新鲜蔬果，适量优质蛋白，减少精加工食品和高糖高脂食物的摄入。根据个人体质，可以适当调整饮食结构。';
        } else if (newMessage.includes('运动') || newMessage.includes('锻炼')) {
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
        
        const botReply = {
          id: Date.now() + 1,
          sender: 'expert',
          senderName: `${expert?.name || '医师'} (自动回复)`,
          content: replyContent,
          timestamp: new Date().toISOString(),
          avatar: expert?.avatar || 'https://randomuser.me/api/portraits/women/2.jpg',
          isBot: true
        };
        
        setMessages(prev => [...prev, botReply]);
        setIsLoading(false);
      }
    }, replyDelay);
  };
  
  // 处理按键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };
  
  // 处理模式切换
  const handleModeChange = async (newMode) => {
    if (newMode === mode) return;
    
    // 如果当前有媒体流，先停止
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    setMode(newMode);
    
    // 如果切换到音频或视频模式，请求媒体权限
    if (newMode === 'audio' || newMode === 'video') {
      try {
        setIsConnecting(true);
        const constraints = {
          audio: true,
          video: newMode === 'video'
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);
        
        if (newMode === 'video' && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // 模拟连接建立
        setTimeout(() => {
          setConnectionEstablished(true);
          setIsConnecting(false);
          
          // 添加系统消息
          const systemMessage = {
            id: Date.now(),
            sender: 'system',
            content: newMode === 'video' ? '视频通话已建立' : '语音通话已建立',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, systemMessage]);
          
          // 模拟远程视频（在实际应用中，这里应该是WebRTC连接）
          if (newMode === 'video' && remoteVideoRef.current) {
            // 在实际应用中，这里应该设置远程对等方的视频流
            // 这里仅作演示，使用相同的本地流
            setTimeout(() => {
              remoteVideoRef.current.srcObject = stream;
            }, 1000);
          }
        }, 2000);
      } catch (error) {
        console.error('获取媒体设备失败:', error);
        setIsConnecting(false);
        
        // 添加错误消息
        const errorMessage = {
          id: Date.now(),
          sender: 'system',
          content: `无法启动${newMode === 'video' ? '视频' : '语音'}通话：${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // 回到文字模式
        setMode('text');
      }
    } else {
      // 如果切换回文字模式
      setConnectionEstablished(false);
      
      // 添加系统消息
      if (connectionEstablished) {
        const systemMessage = {
          id: Date.now(),
          sender: 'system',
          content: '通话已结束，已切换回文字咨询',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    }
  };
  
  // 结束通话
  const endCall = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    setConnectionEstablished(false);
    setMode('text');
    
    // 添加系统消息
    const systemMessage = {
      id: Date.now(),
      sender: 'system',
      content: '通话已结束',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, systemMessage]);
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      {/* 聊天头部 */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={expertIsOnline ? "success" : "error"}
          >
            <Avatar src={expert?.avatar} alt={expert?.name} />
          </Badge>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1">
              {expert?.name || '健康专家'}
              {expertIsOnline ? 
                <Chip size="small" label="在线" color="success" sx={{ ml: 1 }} /> : 
                <Chip size="small" label="离线" color="default" sx={{ ml: 1 }} />}
            </Typography>
            <Typography variant="caption">{expert?.specialty || '传统健康咨询'}</Typography>
          </Box>
        </Box>
        
        <Box>
          <Tooltip title="文字咨询">
            <IconButton 
              color={mode === 'text' ? 'secondary' : 'inherit'}
              onClick={() => handleModeChange('text')}
            >
              <MessageIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="语音咨询">
            <IconButton 
              color={mode === 'audio' ? 'secondary' : 'inherit'}
              onClick={() => handleModeChange('audio')}
              disabled={isConnecting}
            >
              {mode === 'audio' && connectionEstablished ? <PhoneDisabledIcon /> : <PhoneIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="视频咨询">
            <IconButton 
              color={mode === 'video' ? 'secondary' : 'inherit'}
              onClick={() => handleModeChange('video')}
              disabled={isConnecting}
            >
              {mode === 'video' && connectionEstablished ? <VideocamOffIcon /> : <VideocamIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="关闭">
            <IconButton color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* 视频通话界面 */}
      {mode === 'video' && (
        <Box sx={{ 
          p: 2, 
          bgcolor: '#000', 
          position: 'relative',
          height: connectionEstablished ? 300 : 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {isConnecting ? (
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <CircularProgress color="inherit" size={40} />
              <Typography sx={{ mt: 2 }}>正在建立视频连接...</Typography>
            </Box>
          ) : connectionEstablished ? (
            <>
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  right: 16, 
                  bottom: 16, 
                  width: 120, 
                  height: 90,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '2px solid white'
                }}
              >
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  playsInline 
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<PhoneDisabledIcon />}
                  onClick={endCall}
                >
                  结束通话
                </Button>
              </Box>
            </>
          ) : null}
        </Box>
      )}
      
      {/* 语音通话界面 */}
      {mode === 'audio' && (
        <Box sx={{ 
          p: 3, 
          bgcolor: '#f5f5f5', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          {isConnecting ? (
            <>
              <CircularProgress size={60} />
              <Typography variant="h6">正在建立语音连接...</Typography>
            </>
          ) : connectionEstablished ? (
            <>
              <Avatar 
                src={expert?.avatar} 
                alt={expert?.name} 
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h6">{expert?.name || '健康专家'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                语音通话中...
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Tooltip title="麦克风">
                  <IconButton color="primary" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                    <MicIcon />
                  </IconButton>
                </Tooltip>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<PhoneDisabledIcon />}
                  onClick={endCall}
                >
                  结束通话
                </Button>
              </Box>
            </>
          ) : null}
        </Box>
      )}
      
      {/* 消息列表 */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
        bgcolor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <List sx={{ width: '100%', pt: 0 }}>
          {messages.map((message) => (
            <ListItem 
              key={message.id} 
              alignItems="flex-start"
              sx={{ 
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                px: 1,
                mb: 1
              }}
            >
              {message.sender === 'system' ? (
                <Box sx={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  my: 1,
                }}>
                  <Chip 
                    label={message.content}
                    color={message.isError ? 'error' : 'default'}
                    size="small"
                  />
                </Box>
              ) : (
                <>
                  <ListItemAvatar sx={{ minWidth: message.sender === 'user' ? '0px' : '40px', ml: message.sender === 'user' ? 2 : 0, mr: message.sender === 'user' ? 0 : 2 }}>
                    <Avatar src={message.avatar} alt={message.senderName} />
                  </ListItemAvatar>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === 'user' ? 'primary.light' : 
                              message.isBot ? '#f0f7ff' : 'background.paper',
                      color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                      border: message.isHuman ? '1px solid #4caf50' : 
                              message.isBot ? '1px solid #2196f3' : 'none'
                    }}
                  >
                    {message.isBot && (
                      <Chip size="small" label="AI助手" color="info" sx={{ mb: 1 }} />
                    )}
                    {message.isHuman && (
                      <Chip size="small" label="专家回复" color="success" sx={{ mb: 1 }} />
                    )}
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right', opacity: 0.7 }}>
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Paper>
                </>
              )}
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 7, mt: 1 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {expertIsOnline ? 
                `${expert?.name || '医师'}正在输入...` : 
                '智能助手正在分析您的问题...'}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* 输入区域 */}
      {(mode === 'text' || !connectionEstablished) && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="输入您的咨询内容..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={newMessage.trim() === ''}
              >
                发送
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', mt: 1, justifyContent: 'flex-start' }}>
            <Tooltip title="发送图片">
              <IconButton size="small" color="primary">
                <ImageIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="发送文件">
              <IconButton size="small" color="primary">
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="表情">
              <IconButton size="small" color="primary">
                <EmojiIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ChatInterface;