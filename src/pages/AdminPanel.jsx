import React from 'react';
import { Container, Typography, Grid, Paper, Box, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  PeopleAlt as UsersIcon,
  VerifiedUser as ApproveIcon,
  Settings as SettingsIcon,
  Insights as InsightsIcon,
  Feedback as FeedbackIcon,
  MonetizationOn as PaymentIcon,
  Person as ExpertIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  // 如果不是管理员，重定向到首页
  React.useEffect(() => {
    if (!currentUser || !isAdmin()) {
      navigate('/');
    }
  }, [currentUser, isAdmin, navigate]);

  // 管理功能卡片数据
  const adminFeatures = [
    {
      id: 1,
      title: '专家审核',
      description: '审核专家申请，管理专家资质',
      icon: <ApproveIcon fontSize="large" color="primary" />,
      path: '/admin/expert-approval',
      color: '#e3f2fd'
    },
    {
      id: 2,
      title: '用户管理',
      description: '管理平台用户，包括普通用户和会员',
      icon: <UsersIcon fontSize="large" color="primary" />,
      path: '/admin/users',
      color: '#e8f5e9'
    },
    {
      id: 3,
      title: '咨询监控',
      description: '监控平台咨询服务质量和数据',
      icon: <InsightsIcon fontSize="large" color="primary" />,
      path: '/admin/consultation-monitor',
      color: '#fff8e1'
    },
    {
      id: 4,
      title: '用户反馈',
      description: '处理用户投诉和反馈信息',
      icon: <FeedbackIcon fontSize="large" color="primary" />,
      path: '/admin/feedback',
      color: '#fce4ec'
    },
    {
      id: 5,
      title: '系统设置',
      description: '配置平台参数和功能设置',
      icon: <SettingsIcon fontSize="large" color="primary" />,
      path: '/admin/settings',
      color: '#e0f7fa'
    },
    {
      id: 6,
      title: '收益管理',
      description: '管理平台收益和支付设置',
      icon: <PaymentIcon fontSize="large" color="primary" />,
      path: '/admin/payment',
      color: '#f3e5f5'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          管理员控制面板
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          欢迎回来，{currentUser?.username}！您可以在这里管理太极禅道健康平台的各项功能。
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={3}>
        {adminFeatures.map((feature) => (
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
                进入管理
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          管理员操作指南
        </Typography>
        <Typography variant="body2">
          作为太极禅道健康平台的管理员，您可以管理和审核专家申请、监控平台上的咨询服务质量、
          处理用户投诉和反馈、设置和调整咨询服务参数、查看系统运营数据和报表、管理用户账户和权限等。
          请确保所有操作符合平台规定和相关法律法规。
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminPanel;