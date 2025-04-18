import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  CardMembership as MembershipIcon,
  MedicalServices as ExpertIcon,
  ManageAccounts as ManageIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// 会员套餐数据
const membershipPlans = [
  {
    id: 'basic',
    name: '基础会员',
    price: 99,
    duration: 1, // 月
    features: [
      '无限次文字咨询',
      '每月5次语音咨询',
      '每月2次视频咨询',
      '专家优先回复'
    ]
  },
  {
    id: 'standard',
    name: '标准会员',
    price: 199,
    duration: 3, // 月
    features: [
      '无限次文字咨询',
      '每月10次语音咨询',
      '每月5次视频咨询',
      '专家优先回复',
      '预约咨询优先权'
    ]
  },
  {
    id: 'premium',
    name: '高级会员',
    price: 365,
    duration: 12, // 月
    features: [
      '无限次文字咨询',
      '无限次语音咨询',
      '每月10次视频咨询',
      '专家优先回复',
      '预约咨询优先权',
      '专属健康管理方案'
    ]
  }
];

// 支付方式数据
const paymentMethods = [
  { id: 'alipay', name: '支付宝' },
  { id: 'wechat', name: '微信支付' },
  { id: 'card', name: '银行卡支付' }
];

const ExpertMembershipJoin = ({ onClose }) => {
  const { currentUser, USER_ROLES, isMember, isExpert, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 步骤标题
  const steps = ['选择会员套餐', '选择支付方式', '完成支付'];
  
  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 处理套餐选择
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // 处理支付方式选择
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  // 处理下一步
  const handleNext = () => {
    if (activeStep === 0 && !selectedPlan) {
      setError('请选择一个会员套餐');
      return;
    }

    if (activeStep === 1 && !paymentMethod) {
      setError('请选择一个支付方式');
      return;
    }

    setError('');
    
    if (activeStep === 2) {
      // 模拟支付处理
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 2000);
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // 处理上一步
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // 渲染套餐选择步骤
  const renderPlanSelection = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        选择适合您的会员套餐
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {membershipPlans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card 
              elevation={selectedPlan?.id === plan.id ? 8 : 2}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                transform: selectedPlan?.id === plan.id ? 'scale(1.03)' : 'scale(1)',
                border: selectedPlan?.id === plan.id ? '2px solid #1976d2' : 'none',
                height: '100%'
              }}
              onClick={() => handlePlanSelect(plan)}
            >
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {plan.name}
                </Typography>
                
                <Typography variant="h4" color="primary" gutterBottom>
                  ¥{plan.price}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {plan.duration}个月
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  {plan.features.map((feature, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      • {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // 渲染支付方式选择步骤
  const renderPaymentSelection = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        选择支付方式
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            订单信息
          </Typography>
          <Typography variant="body1">
            会员套餐: {selectedPlan.name}
          </Typography>
          <Typography variant="body1">
            有效期: {selectedPlan.duration}个月
          </Typography>
          <Typography variant="body1">
            金额: ¥{selectedPlan.price}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <FormControl component="fieldset">
          <FormLabel component="legend">支付方式</FormLabel>
          <RadioGroup
            aria-label="payment-method"
            name="payment-method"
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            {paymentMethods.map((method) => (
              <FormControlLabel
                key={method.id}
                value={method.id}
                control={<Radio />}
                label={method.name}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>
    </Box>
  );

  // 渲染支付完成步骤
  const renderPaymentCompletion = () => (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">正在处理您的支付...</Typography>
        </Box>
      ) : success ? (
        <Box>
          <Typography variant="h5" color="primary" gutterBottom>
            恭喜！您已成功升级为{selectedPlan.name}
          </Typography>
          <Typography variant="body1" paragraph>
            您的会员有效期至: {new Date(Date.now() + selectedPlan.duration * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" paragraph>
            现在您可以享受会员专属服务了！
          </Typography>
          <Button variant="contained" color="primary" onClick={onClose}>
            开始使用
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            请完成支付
          </Typography>
          <Typography variant="body1" paragraph>
            请使用{paymentMethods.find(m => m.id === paymentMethod)?.name}扫描下方二维码完成支付
          </Typography>
          <Box 
            sx={{ 
              width: 200, 
              height: 200, 
              bgcolor: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <Typography variant="body2" color="text.secondary">
              [支付二维码占位]
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            支付金额: ¥{selectedPlan.price}
          </Typography>
        </Box>
      )}
    </Box>
  );

  // 根据当前步骤渲染内容
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPlanSelection();
      case 1:
        return renderPaymentSelection();
      case 2:
        return renderPaymentCompletion();
      default:
        return '未知步骤';
    }
  };

  // 渲染管理员界面
  const renderAdminView = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        会员管理控制台
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ManageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">会员管理</Typography>
            </Box>
            <List>
              <ListItem button onClick={() => navigate('/admin/members')}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="会员用户列表" secondary="查看和管理所有会员用户" />
              </ListItem>
              <ListItem button onClick={() => navigate('/admin/membership-plans')}>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="会员套餐设置" secondary="管理会员套餐价格和权益" />
              </ListItem>
              <ListItem button onClick={() => navigate('/admin/membership-stats')}>
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="会员统计数据" secondary="查看会员增长和续费数据" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AdminIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">系统设置</Typography>
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              作为管理员，您可以管理会员系统的各项设置和查看统计数据。
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => navigate('/admin/panel')}
            >
              进入管理控制台
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // 渲染专家界面
  const renderExpertView = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        专家会员服务管理
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ExpertIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">我的会员咨询</Typography>
            </Box>
            <List>
              <ListItem button onClick={() => navigate('/expert/member-consultations')}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="会员咨询列表" secondary="查看会员用户的咨询请求" />
              </ListItem>
              <ListItem button onClick={() => navigate('/expert/consultation-history')}>
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="咨询历史记录" secondary="查看历史咨询记录" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">服务设置</Typography>
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              作为健康专家，您可以设置您的咨询服务和查看会员咨询统计。
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => navigate('/expert/panel')}
            >
              进入专家控制台
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // 渲染会员界面
  const renderMemberView = () => (
    <Box sx={{ mt: 3 }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="会员信息" />
        <Tab label="续费/升级" />
      </Tabs>
      
      {activeTab === 0 ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            您当前是{currentUser?.membershipLevel || '基础'}会员，有效期至: {currentUser?.membershipExpiry || '2024-12-31'}
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            您的会员权益
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  咨询权益
                </Typography>
                <Typography variant="body2">
                  • 文字咨询: 无限次
                </Typography>
                <Typography variant="body2">
                  • 语音咨询: {currentUser?.audioConsultRemaining || '10'}次/月
                </Typography>
                <Typography variant="body2">
                  • 视频咨询: {currentUser?.videoConsultRemaining || '5'}次/月
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  其他权益
                </Typography>
                <Typography variant="body2">
                  • 专家优先回复
                </Typography>
                <Typography variant="body2">
                  • 预约咨询优先权
                </Typography>
                <Typography variant="body2">
                  • 健康资料库完整访问权限
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setActiveTab(1)}
              sx={{ mr: 2 }}
            >
              续费/升级会员
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate('/member/panel')}
            >
              返回会员中心
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            您已经是会员用户，可以选择续费或升级会员套餐。
          </Alert>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading || success}
              onClick={handleBack}
              variant="outlined"
            >
              上一步
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading || success}
            >
              {activeStep === steps.length - 1 ? '完成支付' : '下一步'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  // 渲染普通用户界面（注册会员）
  const renderRegularUserView = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        加入会员，享受专属健康服务
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {getStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || loading || success}
          onClick={handleBack}
          variant="outlined"
        >
          上一步
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={loading || success}
        >
          {activeStep === steps.length - 1 ? '完成支付' : '下一步'}
        </Button>
      </Box>
    </Box>
  );

  // 根据用户角色渲染不同内容
  const renderContentByRole = () => {
    if (!currentUser) {
      return renderRegularUserView();
    }
    
    if (isAdmin()) {
      return renderAdminView();
    }
    
    if (isExpert()) {
      return renderExpertView();
    }
    
    if (isMember()) {
      return renderMemberView();
    }
    
    return renderRegularUserView();
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          {isAdmin() ? '会员系统管理' : 
           isExpert() ? '专家会员服务' : 
           isMember() ? '会员中心' : 
           '加入会员，享受专属健康服务'}
        </Typography>
        
        {currentUser && (
          <Chip 
            icon={isAdmin() ? <AdminIcon /> : isExpert() ? <ExpertIcon /> : <MembershipIcon />}
            label={isAdmin() ? '管理员' : isExpert() ? '健康专家' : isMember() ? '会员用户' : '普通用户'}
            color={isAdmin() ? 'error' : isExpert() ? 'secondary' : isMember() ? 'primary' : 'default'}
          />
        )}
      </Box>
      
      {renderContentByRole()}
    </Paper>
  );
};

export default ExpertMembershipJoin;