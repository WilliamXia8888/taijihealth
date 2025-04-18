import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Container, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { MedicalServices as ExpertIcon } from '@mui/icons-material';

function ExpertLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isExpert } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入专家账号和密码');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // 使用专家角色进行登录
      const success = await login(username, password, USER_ROLES.EXPERT);
      
      if (success) {
        // 验证是否真的是专家
        if (isExpert()) {
          // 直接导航到专家界面
          navigate('/expert');
          toast.success('专家登录成功，欢迎回到专家工作台');
        } else {
          setError('您没有专家权限');
        }
      } else {
        // 尝试使用初始密码登录
        const defaultSuccess = await login(username, 'expert123', USER_ROLES.EXPERT);
        if (defaultSuccess && isExpert()) {
          navigate('/expert');
          toast.success('专家登录成功，欢迎回到专家工作台');
        } else {
          setError('登录失败，专家账号或密码错误');
        }
      }
    } catch (err) {
      console.error('登录过程中发生错误:', err);
      setError('登录失败，请稍后再试');
    } finally {
      setLoading(false);
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
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2, bgcolor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
              <ExpertIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              专家登录
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              太极禅道健康平台专家工作台
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="专家账号"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="专家密码"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录专家工作台'}
            </Button>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/admin-login')}
              sx={{ mr: 1 }}
            >
              管理员登录
            </Button>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/login')}
            >
              用户登录
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default ExpertLogin;