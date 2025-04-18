import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Tabs, Tab, FormControlLabel, Checkbox, Container, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Person as UserIcon, CardMembership as MemberIcon } from '@mui/icons-material';

function UserLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 for login, 1 for register
  const location = useLocation();
  
  // 从URL参数中读取tab值
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'register') {
      setTabValue(1);
    }
  }, [location]);
  const [isExpertApplicant, setIsExpertApplicant] = useState(false);
  const [isMemberApplicant, setIsMemberApplicant] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.REGULAR); // 默认为普通用户
  const navigate = useNavigate();
  const { login, register, isAdmin, isExpert, isMember } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Clear form and errors when switching tabs
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setEmail('');
    setError('');
    setIsExpertApplicant(false);
    setIsMemberApplicant(false);
    setSpecialty('');
    setIntroduction('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // 使用选择的角色进行登录（普通用户或会员）
      const success = await login(username, password, selectedRole);
      
      if (success) {
        // 登录成功后，根据角色重定向到对应的面板
        if (isMember()) {
          navigate('/member');
          toast.success('会员登录成功，欢迎回到会员中心');
        } else {
          navigate('/user');
          toast.success('登录成功，欢迎回到用户中心');
        }
      } else {
        setError('登录失败，用户名或密码错误');
      }
    } catch (err) {
      console.error('登录过程中发生错误:', err);
      setError('登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!username || !password || !confirmPassword || !phone) {
      setError('请填写所有必填字段');
      return;
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('请输入正确的手机号码');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    // 如果申请成为专家，需要填写专业和简介
    if (isExpertApplicant && !specialty) {
      setError('申请成为专家需要填写专业领域');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      // 调用AuthContext中的register函数，传入是否专家参数和是否会员参数
      await register(username, phone, password, email, isExpertApplicant, isMemberApplicant);
      toast.success('注册成功，请登录');
      setTabValue(0); // 切换到登录选项卡
    } catch (err) {
      setError('注册失败，请稍后再试');
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
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: selectedRole === USER_ROLES.MEMBER ? 'success.main' : 'info.main', width: 56, height: 56 }}>
              {selectedRole === USER_ROLES.MEMBER ? <MemberIcon fontSize="large" /> : <UserIcon fontSize="large" />}
            </Avatar>
            <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              {selectedRole === USER_ROLES.MEMBER ? '会员登录' : '用户登录'}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              太极禅道健康平台用户中心
            </Typography>
          </Box>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{ mb: 3 }}
          >
            <Tab label="登录" />
            <Tab label="注册" />
          </Tabs>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {tabValue === 0 ? (
            // 登录表单
            <Box component="form" onSubmit={handleLogin} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="用户名"
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
                label="密码"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={selectedRole === USER_ROLES.MEMBER} 
                    onChange={(e) => setSelectedRole(e.target.checked ? USER_ROLES.MEMBER : USER_ROLES.REGULAR)}
                    color="primary"
                  />
                }
                label="以会员身份登录"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color={selectedRole === USER_ROLES.MEMBER ? "success" : "info"}
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? '登录中...' : (selectedRole === USER_ROLES.MEMBER ? '登录会员中心' : '登录用户中心')}
              </Button>
            </Box>
          ) : (
            // 注册表单
            <Box component="form" onSubmit={handleRegister} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="用户名"
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
                id="phone"
                label="手机号码"
                name="phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="电子邮箱（选填）"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="密码"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="确认密码"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={isMemberApplicant} 
                      onChange={(e) => setIsMemberApplicant(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="注册为会员"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={isExpertApplicant} 
                      onChange={(e) => setIsExpertApplicant(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="申请成为专家（需要管理员审核）"
                />
              </Box>
              
              {isExpertApplicant && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="specialty"
                    label="专业领域"
                    name="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="introduction"
                    label="个人简介"
                    name="introduction"
                    multiline
                    rows={4}
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                  />
                </Box>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </Box>
          )}
          
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
              onClick={() => navigate('/expert-login')}
            >
              专家登录
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default UserLogin;