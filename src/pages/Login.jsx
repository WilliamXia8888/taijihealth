import { useEffect } from 'react';
import { Box, CircularProgress, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isExpert, isMember } = useAuth();
  
  // 如果用户已登录，重定向到对应的面板
  useEffect(() => {
    if (currentUser) {
      if (isAdmin()) {
        navigate('/admin');
      } else if (isExpert()) {
        navigate('/expert');
      } else if (isMember()) {
        navigate('/member');
      } else {
        navigate('/user');
      }
    }
  }, [currentUser, isAdmin, isExpert, isMember, navigate]);

  // 处理角色选择
  const handleRoleSelect = (role) => {
    switch(role) {
      case 'admin':
        navigate('/admin-login');
        break;
      case 'expert':
        navigate('/expert-login');
        break;
      default:
        navigate('/user-login');
        break;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        padding: 2
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            太极禅道健康平台
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            请选择您的登录身份
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              fullWidth
              onClick={() => handleRoleSelect('user')}
              sx={{ py: 1.5 }}
            >
              用户登录
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              fullWidth
              onClick={() => handleRoleSelect('expert')}
              sx={{ py: 1.5 }}
            >
              专家登录
            </Button>
            
            <Button 
              variant="contained" 
              color="error"
              size="large"
              fullWidth
              onClick={() => handleRoleSelect('admin')}
              sx={{ py: 1.5 }}
            >
              管理员登录
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;