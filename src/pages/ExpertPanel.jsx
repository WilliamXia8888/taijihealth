import React from 'react';
import { Container, Typography, Grid, Paper, Box, Button, Divider, Avatar, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Message as MessageIcon,
  EventNote as CalendarIcon,
  Star as RatingIcon,
  AccountBalance as EarningsIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ExpertPanel = () => {
  const navigate = useNavigate();
  const { currentUser, isExpert } = useAuth();

  // 如果不是专家，重定向到首页
  React.useEffect(() => {
    if (!currentUser || !isExpert()) {
      navigate('/');
    }
  }, [currentUser, isExpert, navigate]);

  // 专家功能卡片数据
  const expertFeatures = [
    {
      id: 1,
      title: '咨询管理',
      description: '查看和处理待回复的咨询请求',
      icon: <MessageIcon fontSize="large" color="primary" />,
      path: '/expert/consultations',
      color: '#e3f2fd'
    },
    {
      id: 2,
      title: '预约管理',
      description: '管理用户的预约请求和时间安排',
      icon: <CalendarIcon fontSize="large" color="primary" />,
      path: '/expert/appointments',
      color: '#e8f5e9'
    },
    {
      id: 3,
      title: '服务评价',
      description: '查看用户对您服务的评价和反馈',
      icon: <RatingIcon fontSize="large" color="primary" />,
      path: '/expert/ratings',
      color: '#fff8e1'
    },
    {
      id: 4,
      title: '收益管理',
      description: '查看和管理您的咨询收益',
      icon: <EarningsIcon fontSize="large" color="primary" />,
      path: '/expert/earnings',
      color: '#fce4ec'
    },
    {
      id: 5,
      title: '个人资料',
      description: '更新您的专业信息和个人简介',
      icon: <ProfileIcon fontSize="large" color="primary" />,
      path: '/expert/profile',
      color: '#e0f7fa'
    },
    {
      id: 6,
      title: '服务设置',
      description: '设置咨询价格、时间和服务类型',
      icon: <SettingsIcon fontSize="large" color="primary" />,
      path: '/expert/settings',
      color: '#f3e5f5'
    }
  ];

  // 模拟数据：待处理的咨询
  const pendingConsultations = 5;
  // 模拟数据：今日预约
  const todayAppointments = 3;
  // 模拟数据：本月收益
  const monthlyEarnings = 2800;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar
          src={currentUser?.avatar || '/pictures/men1.jpg'}
          alt={currentUser?.username}
          sx={{ width: 80, height: 80, mr: 3 }}
        />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mr: 2 }}>
              {currentUser?.username}
            </Typography>
            <Chip 
              label={currentUser?.specialty || '传统健康专家'} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            欢迎回到太极禅道健康平台专家工作台！
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom>待处理咨询</Typography>
            <Typography variant="h3" color="primary">{pendingConsultations}</Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/expert/consultations')}
              sx={{ mt: 1 }}
            >
              立即处理
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" gutterBottom>今日预约</Typography>
            <Typography variant="h3" color="primary">{todayAppointments}</Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/expert/appointments')}
              sx={{ mt: 1 }}
            >
              查看详情
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, bgcolor: '#fff8e1' }}>
            <Typography variant="h6" gutterBottom>本月收益</Typography>
            <Typography variant="h3" color="primary">¥{monthlyEarnings}</Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/expert/earnings')}
              sx={{ mt: 1 }}
            >
              收益明细
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        专家功能
      </Typography>

      <Grid container spacing={3}>
        {expertFeatures.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.id}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: feature.color,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {feature.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (feature.id === 1) { // 咨询管理
                      navigate('/expert-consultation');
                    } else {
                      navigate(feature.path);
                    }
                  }}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  进入
                </Button>
                {feature.id === 1 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/expert-consultation')}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    接收咨询
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          专家操作指南
        </Typography>
        <Typography variant="body2">
          作为太极禅道健康平台的健康专家，您可以提供专业的健康咨询服务、通过文字、语音和视频方式与用户交流、
          管理个人资料和专业信息、设置咨询服务时间和价格、查看和回复用户预约、查看服务评价和反馈、管理咨询收益等。
          请确保提供高质量的专业服务，遵守平台规则和医疗健康相关法规。
        </Typography>
      </Box>
    </Container>
  );
};

export default ExpertPanel;