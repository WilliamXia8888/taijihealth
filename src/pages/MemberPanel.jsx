import React from 'react';
import { Container, Typography, Grid, Paper, Box, Button, Divider, Avatar, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Person as ExpertIcon,
  Message as ConsultIcon,
  EventNote as AppointmentIcon,
  History as HistoryIcon,
  HealthAndSafety as HealthIcon,
  CardMembership as MembershipIcon,
  LocalActivity as ActivityIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const MemberPanel = () => {
  const navigate = useNavigate();
  const { currentUser, isMember } = useAuth();

  // 如果不是会员，重定向到首页
  React.useEffect(() => {
    if (!currentUser || !isMember()) {
      navigate('/');
    }
  }, [currentUser, isMember, navigate]);

  // 会员功能卡片数据
  const memberFeatures = [
    {
      id: 1,
      title: '专家咨询',
      description: '浏览专家信息，发起文字、语音或视频咨询',
      icon: <ExpertIcon fontSize="large" color="primary" />,
      path: '/expert-consultation',
      color: '#e3f2fd'
    },
    {
      id: 2,
      title: '预约管理',
      description: '预约特定时间段的专家咨询服务',
      icon: <AppointmentIcon fontSize="large" color="primary" />,
      path: '/member/appointments',
      color: '#e8f5e9'
    },
    {
      id: 3,
      title: '咨询记录',
      description: '查看历史咨询记录和内容',
      icon: <HistoryIcon fontSize="large" color="primary" />,
      path: '/member/consultation-history',
      color: '#fff8e1'
    },
    {
      id: 4,
      title: '健康档案',
      description: '管理个人健康档案和信息',
      icon: <HealthIcon fontSize="large" color="primary" />,
      path: '/health-records',
      color: '#fce4ec'
    },
    {
      id: 5,
      title: '会员信息',
      description: '查看会员状态、有效期和权益',
      icon: <MembershipIcon fontSize="large" color="primary" />,
      path: '/member/info',
      color: '#e0f7fa'
    },
    {
      id: 6,
      title: '会员活动',
      description: '查看会员专享的健康讲座和线下活动',
      icon: <ActivityIcon fontSize="large" color="primary" />,
      path: '/member/activities',
      color: '#f3e5f5'
    }
  ];

  // 模拟数据：会员到期时间
  const membershipExpiry = '2024-12-31';
  // 模拟数据：会员等级
  const membershipLevel = '黄金会员';
  // 模拟数据：剩余咨询次数（无限制）
  const consultationRemaining = '无限制';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          会员中心
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          欢迎回来，{currentUser?.username}！您可以在这里享受太极禅道健康平台的会员专属服务。
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#f9fbe7', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <Avatar
              src={currentUser?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={currentUser?.username}
              sx={{ width: 80, height: 80, mx: { xs: 'auto', md: 0 } }}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 2 }}>
              <Box>
                <Typography variant="h6">{currentUser?.username}</Typography>
                <Chip 
                  label={membershipLevel} 
                  color="primary" 
                  sx={{ mt: 1 }} 
                />
              </Box>
              <Box sx={{ ml: { xs: 0, sm: 4 } }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>会员有效期至：</strong> {membershipExpiry}
                </Typography>
                <Typography variant="body2">
                  <strong>剩余咨询次数：</strong> {consultationRemaining}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/member/renew')}
            >
              续费会员
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        会员专属服务
      </Typography>

      <Grid container spacing={3}>
        {memberFeatures.map((feature) => (
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
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(feature.path)}
                sx={{ alignSelf: 'flex-start' }}
              >
                进入
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          会员权益说明
        </Typography>
        <Typography variant="body2">
          作为太极禅道健康平台的会员用户，您可以浏览所有健康专家的详细资料、无限次使用专家咨询服务、
          通过文字、语音和视频方式与专家交流、预约特定时间段的咨询服务、享受会员专属优惠价格、
          获得优先咨询权、查看和管理个人咨询历史记录、对专家服务进行评价等。
          如有任何问题，请联系会员服务专线获取支持。
        </Typography>
      </Box>
    </Container>
  );
};

export default MemberPanel;