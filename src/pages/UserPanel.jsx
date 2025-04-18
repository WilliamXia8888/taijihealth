import React from 'react';
import { Container, Typography, Grid, Paper, Box, Button, Divider, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Person as ExpertIcon,
  Message as ConsultIcon,
  History as HistoryIcon,
  CardMembership as MembershipIcon,
  HealthAndSafety as HealthIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserPanel = () => {
  const navigate = useNavigate();
  const { currentUser, isMember, isExpert, isAdmin } = useAuth();

  // 如果是会员、专家或管理员，重定向到对应面板
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (isAdmin()) {
      navigate('/admin');
      return;
    }
    
    if (isExpert()) {
      navigate('/expert');
      return;
    }
    
    if (isMember()) {
      navigate('/member');
      return;
    }
  }, [currentUser, isMember, isExpert, isAdmin, navigate]);

  // 普通用户功能卡片数据
  const userFeatures = [
    {
      id: 1,
      title: '专家咨询',
      description: '浏览专家基本资料，发起文字咨询',
      icon: <ExpertIcon fontSize="large" color="primary" />,
      path: '/expert-consultation',
      color: '#e3f2fd'
    },
    {
      id: 2,
      title: '咨询记录',
      description: '查看历史咨询记录和内容',
      icon: <HistoryIcon fontSize="large" color="primary" />,
      path: '/user/consultation-history',
      color: '#fff8e1'
    },
    {
      id: 3,
      title: '健康档案',
      description: '管理个人健康档案和信息',
      icon: <HealthIcon fontSize="large" color="primary" />,
      path: '/health-records',
      color: '#fce4ec'
    },
    {
      id: 4,
      title: '升级会员',
      description: '升级为会员，享受更多专属服务',
      icon: <MembershipIcon fontSize="large" color="primary" />,
      path: '/user/upgrade',
      color: '#e0f7fa',
      highlight: true
    },
    {
      id: 5,
      title: '常见问题',
      description: '查看平台使用帮助和常见问题',
      icon: <HelpIcon fontSize="large" color="primary" />,
      path: '/user/faq',
      color: '#f3e5f5'
    }
  ];

  // 模拟数据：今日剩余咨询次数
  const consultationRemaining = 3;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          用户中心
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          欢迎回来，{currentUser?.username}！您可以在这里使用太极禅道健康平台的基础服务。
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <Avatar
              src={currentUser?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={currentUser?.username}
              sx={{ width: 80, height: 80, mx: { xs: 'auto', md: 0 } }}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Box>
              <Typography variant="h6">{currentUser?.username}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>今日剩余咨询次数：</strong> {consultationRemaining}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/user/upgrade')}
              sx={{ 
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
              }}
            >
              升级为会员
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        可用服务
      </Typography>

      <Grid container spacing={3}>
        {userFeatures.map((feature) => (
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
                border: feature.highlight ? '2px solid #FE6B8B' : 'none',
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
                sx={{
                  alignSelf: 'flex-start',
                  ...(feature.highlight && {
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
                  })
                }}
              >
                {feature.highlight ? '立即升级' : '进入'}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          会员权益介绍
        </Typography>
        <Typography variant="body2" paragraph>
          升级为会员后，您将享受以下额外权益：
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              • 无限次数的专家咨询服务
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              • 使用语音和视频咨询功能
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              • 预约特定时间段的咨询服务
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              • 享受会员专属优惠价格
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              • 优先咨询权
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              • 专属健康管理方案
            </Typography>
          </Grid>
        </Grid>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/user/upgrade')}
          sx={{ mt: 2 }}
        >
          了解详情
        </Button>
      </Box>
    </Container>
  );
};

export default UserPanel;