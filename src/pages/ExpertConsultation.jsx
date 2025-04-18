import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Box,
  Paper,
  Avatar,
  Chip,
  Rating,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Drawer,
  Fab,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Videocam as VideoIcon,
  Message as MessageIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  CardMembership as MembershipIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import notificationSound from '../assets/notification.mp3';
import ChatInterface from '../components/chat/ChatInterface';
import ExpertMembershipJoin from '../components/membership/ExpertMembershipJoin';

// 模拟专家数据
const experts = [
  {
    id: 1,
    name: '夏健康师',
    title: '高级健康管理师',
    specialty: '传统中医健康',
    experience: '35年临床经验',
    rating: 4.9,
    reviewCount: 238,
    price: 180,
    avatar: '/pictures/men1.jpg',
    availability: ['周一', '周三', '周五'],
    introduction: '一对一咨询电话（微信同）：18611703615.研究传统中医健康多年，擅长运用传统中医理论诊治，知识范围广泛。是"一诊五疗体系"创始人。尤其是诊察、内治、食疗等。'
  },
  {
    id: 2,
    name: '夏理疗师',
    title: '高级康复理疗师',
    specialty: '传统中医健康外治',
    experience: '25年临床经验',
    rating: 4.8,
    reviewCount: 186,
    price: 160,
    avatar: '/pictures/men2.jpg',
    availability: ['周二', '周四', '周六'],
    introduction: '一对一咨询电话（微信同）：13901252188。专注传统中医健康外治，擅长循经点穴，拨筋散结，养生保健，太极气功，心神疗法等。电话18611703615'
  },
  {
    id: 3,
    name: '张调理师',
    title: '保健调理师',
    specialty: '传统中医健康经络及外治',
    experience: '20年临床经验',
    rating: 4.7,
    reviewCount: 156,
    price: 120,
    avatar: '/pictures/women1.jpg',
    availability: ['周一', '周二', '周六', '周日'],
    introduction: '一对一咨询电话（微信同）：17837683298。擅长运用中医理论和技术调理各种健康疾痛，尤其在头肩颈腰腿痛，艾灸、刮痧、拔罐、推拿保健等方面有独特技能。'
  },
  {
    id: 4,
    name: '张调理师',
    title: '传统中医健康调理师',
    specialty: '推拿保健及药浴',
    experience: '15年临床经验',
    rating: 4.6,
    reviewCount: 132,
    price: 100,
    avatar: '/pictures/women2.jpg',
    availability: ['周三', '周四', '周五', '周日'],
    introduction: '一对一咨询电话（微信同）：18611703615。专注于经络推拿和药浴调理，擅长处理颈椎病、腰椎间盘突出药浴加理疗等。'
  },
];

function ExpertConsultation() {
  const { currentUser, isMember, isExpert, isAdmin, isExpertOnline, updateExpertOnlineStatus, onlineExpertsState } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [consultationType, setConsultationType] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [consultationDescription, setConsultationDescription] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // 聊天相关状态
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpert, setChatExpert] = useState(null);
  const [chatMode, setChatMode] = useState('text'); // 'text', 'audio', 'video'
  
  // 会员对话框状态
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  
  // 通知音效
  const [notificationAudio] = useState(new Audio(notificationSound));
  
  // 专家在线状态
  useEffect(() => {
    // 如果当前用户是专家，更新在线状态
    if (currentUser && isExpert() && currentUser.expertId) {
      // 设置专家为在线状态，使用专家ID而不是用户ID
      updateExpertOnlineStatus(currentUser.expertId, true);
      
      // 确保专家在线状态被正确设置 - 只检查一次，避免无限循环
      const checkInterval = setTimeout(() => {
        if (!isExpertOnline(currentUser.expertId)) {
          console.log(`重试设置专家 ${currentUser.username} (ID: ${currentUser.expertId}) 在线状态`);
          updateExpertOnlineStatus(currentUser.expertId, true);
        }
      }, 1000);
      
      // 组件卸载时设置为离线并清除定时器
      return () => {
        clearTimeout(checkInterval);
        updateExpertOnlineStatus(currentUser.expertId, false);
      };
    }
    
    // 监听专家状态更新事件
    const handleExpertStatusUpdate = (event) => {
      console.log('收到专家状态更新事件:', event.detail);
      // 强制重新渲染组件以更新专家在线状态
      setSearchTerm(prev => prev);
    };
    
    document.addEventListener('expert-status-updated', handleExpertStatusUpdate);
    
    return () => {
      document.removeEventListener('expert-status-updated', handleExpertStatusUpdate);
    };
  }, [currentUser, isExpert, updateExpertOnlineStatus]); // 移除isExpertOnline依赖，避免无限循环

  // 更新专家在线状态
  const expertsWithOnlineStatus = experts.map(expert => ({
    ...expert,
    isOnline: isExpertOnline(expert.id)
  }));
  
  // 过滤专家列表
  const filteredExperts = expertsWithOnlineStatus.filter(expert => 
    expert.name.includes(searchTerm) || 
    expert.specialty.includes(searchTerm) ||
    expert.introduction.includes(searchTerm)
  );

  // 处理专家选择
  const handleExpertSelect = (expert) => {
    setSelectedExpert(expert);
    setOpenDialog(true);
  };
  
  // 处理打开聊天
  const handleOpenChat = (expert, initialMode = 'text') => {
    // 检查用户是否登录
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setChatExpert(expert);
    setChatMode(initialMode);
    setChatOpen(true);
    
    // 检查专家是否在线
    const expertIsOnline = isExpertOnline(expert.id);
    console.log(`专家 ${expert.name} (ID: ${expert.id}) 在线状态: ${expertIsOnline ? '在线' : '离线'}`);
    
    if (expertIsOnline) {
      // 播放通知音效提醒专家有新咨询
      // 使用更可靠的方式播放音效
      try {
        // 先加载音频
        notificationAudio.load();
        // 设置音量确保可以听到
        notificationAudio.volume = 1.0;
        // 播放音效
        const playPromise = notificationAudio.play();
        
        // 处理播放承诺
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log('通知音效播放成功'))
            .catch(e => {
              console.error('通知音效播放失败:', e);
              // 尝试替代方案
              const backupAudio = new Audio(notificationSound);
              backupAudio.play().catch(err => console.error('备用音效也播放失败:', err));
            });
        }
      } catch (error) {
        console.error('播放通知音效失败:', error);
      }
      
      // 向专家发送实时通知
      console.log(`向专家 ${expert.name} 发送咨询通知`);
      
      // 如果有信令服务，发送实时通知给专家
      try {
        // 尝试通过WebSocket发送通知
        const notificationData = {
          type: 'new_consultation',
          expertId: expert.id,
          userId: currentUser.id,
          username: currentUser.username || '用户',
          consultationType: initialMode,
          timestamp: new Date().toISOString()
        };
        
        // 如果window对象中有socket连接，使用它发送通知
        if (window.socket) {
          window.socket.emit('expert-notification', notificationData);
          console.log('已通过WebSocket向专家发送实时通知');
        } else {
          console.warn('WebSocket连接不可用，无法发送实时通知');
        }
        
        // 显示提示消息
        setSnackbarMessage(`已连接到${expert.name}，专家将为您提供人工咨询服务`);
        setSnackbarOpen(true);
      } catch (error) {
        console.error('发送实时通知失败:', error);
      }
    } else {
      console.log(`专家 ${expert.name} 不在线，将由机器人自动回复`);
      
      // 显示提示消息
      setSnackbarMessage(`${expert.name} 当前不在线，将由智能助手为您解答问题`);
      setSnackbarOpen(true);
    }
  };
  
  // 处理关闭聊天
  const handleCloseChat = () => {
    setChatOpen(false);
  };
  
  // 处理打开会员对话框
  const handleOpenMembershipDialog = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setMembershipDialogOpen(true);
  };
  
  // 处理关闭会员对话框
  const handleCloseMembershipDialog = () => {
    setMembershipDialogOpen(false);
  };

  // 处理对话框关闭
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 处理预约提交
  const handleSubmitConsultation = () => {
    // 检查用户是否登录
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // 验证表单
    if (!consultationType || !consultationDate || !consultationTime) {
      setSnackbarMessage('请填写所有必填字段');
      setSnackbarOpen(true);
      return;
    }

    // 模拟预约成功
    setSnackbarMessage(`预约成功！您已预约${selectedExpert.name}的${consultationType}咨询`);
    setSnackbarOpen(true);
    setOpenDialog(false);
    
    // 重置表单
    setConsultationType('');
    setConsultationDate('');
    setConsultationTime('');
    setConsultationDescription('');
  };

  // 检测是否为移动设备
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 2 }}>
      {/* 页面标题 */}
      <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
          健康专家在线诊察咨询
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          与传统健康专家一对一在线咨询，获取专业健康指导
        </Typography>
      </Box>

      {/* 专家列表和聊天界面容器 */}
      <Grid container spacing={3} className="consultation-container">
        {/* 左侧专家列表 */}
        <Grid className="expert-list" sx={{ gridColumn: { xs: 'span 12', md: chatOpen ? 'span 4' : 'span 12' } }}>
          <Paper elevation={3} sx={{ p: 2, height: { xs: 'auto', md: '100%' }, maxHeight: { xs: '400px', md: '800px' }, overflow: 'auto' }}>
            {/* 搜索框 */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="搜索专家姓名或专业"
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            
            {/* 会员权益说明（针对普通用户） */}
            {currentUser && !isMember() && !isExpert() && !isAdmin() && (
              <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  会员专属权益
                </Typography>
                <Grid container spacing={2}>
                  <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VideoIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">语音和视频咨询</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">预约特定时间咨询</Typography>
                    </Box>
                  </Grid>
                  <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MessageIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">无限次咨询服务</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <StarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">优先咨询权</Typography>
                    </Box>
                  </Grid>
                  <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<MembershipIcon />}
                      onClick={handleOpenMembershipDialog}
                      sx={{ 
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
                      }}
                    >
                      立即升级为会员
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            {/* 专家列表 */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>
              专家列表
            </Typography>
            <Grid container spacing={3}>
              {filteredExperts.map(expert => (
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }} key={expert.id}>
                  <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={expert.isOnline ? "success" : "error"}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, borderRadius: '50%', mr: 2 }}
                      image={expert.avatar}
                      alt={expert.name}
                    />
                  </Badge>
                  <Box>
                    <Typography variant="h6" component="div">
                      {expert.name}
                      {expert.isOnline ? 
                        <Chip size="small" label="在线" color="success" sx={{ ml: 1, fontWeight: 'bold' }} /> : 
                        <Chip size="small" label="离线" color="default" sx={{ ml: 1 }} />}
                      {expert.isOnline && (
                        <Box 
                          component="span" 
                          sx={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: '50%', 
                            bgcolor: 'success.main',
                            display: 'inline-block',
                            animation: 'pulse 1.5s infinite',
                            '@keyframes pulse': {
                              '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                              '70%': { boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)' },
                              '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                            }
                          }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {expert.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Rating value={expert.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({expert.reviewCount})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>专业领域：</strong>{expert.specialty}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>执业经验：</strong>{expert.experience}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>咨询价格：</strong>
                  {isMember() ? (
                    <span>¥{Math.floor(expert.price * 0.8)}/次 <Chip size="small" label="会员价" color="primary" /></span>
                  ) : (
                    <span>¥{expert.price}/次</span>
                  )}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>可咨询时间：</strong>{expert.availability.join('、')}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {expert.introduction}
                </Typography>
              </CardContent>
              
              <Divider />
              
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                {/* 管理员操作 */}
                {isAdmin() && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => navigate(`/admin/expert-detail/${expert.id}`)}
                    >
                      查看详情
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate(`/admin/expert-edit/${expert.id}`)}
                    >
                      管理专家
                    </Button>
                  </Box>
                )}
                
                {/* 专家自己查看 */}
                {isExpert() && currentUser?.id === expert.id && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => navigate('/expert/profile')}
                    >
                      编辑资料
                    </Button>
                    <Box>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleOpenChat(expert)}
                        sx={{ mr: 1 }}
                      >
                        接收咨询
                      </Button>
                      <Badge badgeContent={pendingConsultations} color="error">
                        <Button 
                          variant="outlined" 
                          color="secondary"
                          onClick={() => handleOpenChat(expert)}
                        >
                          待处理
                        </Button>
                      </Badge>
                    </Box>
                  </Box>
                )}
                
                {/* 其他专家查看 */}
                {isExpert() && currentUser?.id !== expert.id && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => navigate('/expert/profile')}
                    >
                      返回工作台
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleOpenChat(expert)}
                    >
                      专家交流
                    </Button>
                  </Box>
                )}
                
                {/* 会员操作 */}
                {isMember() && !isExpert() && !isAdmin() && (
                  <>
                    <Button 
                      variant="outlined" 
                      startIcon={<CalendarIcon />}
                      onClick={() => handleExpertSelect(expert)}
                      size={isMobile ? "small" : "medium"}
                    >
                      预约
                    </Button>
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 1 : 0.5 }}>
                      <Tooltip title="文字咨询">
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<MessageIcon />}
                          onClick={() => handleOpenChat(expert)}
                          sx={{ mr: isMobile ? 0 : 1, width: isMobile ? '100%' : 'auto' }}
                          size={isMobile ? "small" : "medium"}
                        >
                          咨询
                        </Button>
                      </Tooltip>
                      <Tooltip title="语音咨询">
                        <Button 
                          variant="contained" 
                          color="secondary"
                          startIcon={<PhoneIcon />}
                          onClick={() => handleOpenChat(expert, 'audio')}
                          sx={{ mr: isMobile ? 0 : 1, width: isMobile ? '100%' : 'auto' }}
                          size={isMobile ? "small" : "medium"}
                        >
                          语音
                        </Button>
                      </Tooltip>
                      <Tooltip title="视频咨询">
                        <Button 
                          variant="contained" 
                          color="secondary"
                          startIcon={<VideoIcon />}
                          onClick={() => handleOpenChat(expert, 'video')}
                          sx={{ width: isMobile ? '100%' : 'auto' }}
                          size={isMobile ? "small" : "medium"}
                        >
                          视频
                        </Button>
                      </Tooltip>
                    </Box>
                  </>
                )}
                
                {/* 普通用户操作 */}
                {currentUser && !isMember() && !isExpert() && !isAdmin() && (
                  <>
                    <Button 
                      variant="outlined" 
                      startIcon={<MembershipIcon />}
                      onClick={handleOpenMembershipDialog}
                      color="secondary"
                    >
                      升级会员
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<MessageIcon />}
                      onClick={() => handleOpenChat(expert)}
                    >
                      文字咨询
                    </Button>
                  </>
                )}
                
                {/* 未登录用户操作 */}
                {!currentUser && (
                  <>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/login')}
                    >
                      登录后咨询
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate('/login')}
                    >
                      立即登录
                    </Button>
                  </>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* 右侧聊天界面 - 仅在聊天打开时显示 */}
        {chatOpen && (
          <Grid className="chat-interface" sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ChatInterface 
                expert={chatExpert} 
                onClose={handleCloseChat} 
                chatMode={chatMode}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 预约对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          预约{selectedExpert?.name}的咨询服务
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                咨询类型
              </Typography>
              <Grid container spacing={1}>
                <Grid item>
                  <Chip 
                    icon={<VideoIcon />} 
                    label="视频咨询" 
                    clickable
                    color={consultationType === '视频咨询' ? 'primary' : 'default'}
                    onClick={() => setConsultationType('视频咨询')}
                    sx={{ mr: 1 }}
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<MessageIcon />} 
                    label="图文咨询" 
                    clickable
                    color={consultationType === '图文咨询' ? 'primary' : 'default'}
                    onClick={() => setConsultationType('图文咨询')}
                    sx={{ mr: 1 }}
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<PhoneIcon />} 
                    label="语音咨询" 
                    clickable
                    color={consultationType === '语音咨询' ? 'primary' : 'default'}
                    onClick={() => setConsultationType('语音咨询')}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  您也可以点击专家卡片上的「立即咨询」按钮，直接开始在线交流。
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="咨询日期"
                type="date"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="咨询时间"
                type="time"
                value={consultationTime}
                onChange={(e) => setConsultationTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="健康问题描述"
                multiline
                rows={4}
                value={consultationDescription}
                onChange={(e) => setConsultationDescription(e.target.value)}
                placeholder="请详细描述您的健康问题，以便专家更好地了解您的情况"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                可预约时间: {selectedExpert?.availability.join('、')}
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmitConsultation}
          >
            确认预约
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      
      {/* 聊天抽屉 */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={handleCloseChat}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 450, md: 550 }, maxWidth: '100%' }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <ChatInterface 
            expert={chatExpert} 
            onClose={handleCloseChat} 
            chatMode={chatMode}
          />
        </Box>
      </Drawer>
      
      {/* 快速聊天按钮 */}
      {!chatOpen && (
        <Fab 
          color="primary" 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            display: { xs: 'none', md: 'flex' }
          }}
          onClick={() => {
            if (currentUser) {
              // 如果用户已登录但未选择专家，默认选择第一位专家
              handleOpenChat(experts[0]);
            } else {
              navigate('/login');
            }
          }}
        >
          <Badge color="error" variant="dot">
            <ChatIcon />
          </Badge>
        </Fab>
      )}
      
      {/* 会员注册/升级对话框 */}
      <Dialog
        open={membershipDialogOpen}
        onClose={handleCloseMembershipDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isMember() ? '会员管理' : '加入会员'}
          </Typography>
          <IconButton onClick={handleCloseMembershipDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ExpertMembershipJoin onClose={handleCloseMembershipDialog} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default ExpertConsultation;