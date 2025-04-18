import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CardMedia,
  CardActions,
  Badge,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import {
  Star as StarIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Redeem as RedeemIcon,
  Leaderboard as LeaderboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { pointsService } from '../services/db';

// 积分兑换商品数据
const redeemItems = [
  {
    id: 1,
    title: '专家咨询券',
    description: '可兑换一次专家在线咨询服务',
    points: 200,
    image: 'https://source.unsplash.com/random/300x200/?consultation'
  },
  {
    id: 2,
    title: '太极禅道课程',
    description: '线下太极禅道课程体验券',
    points: 300,
    image: 'https://source.unsplash.com/random/300x200/?taichi'
  },
  {
    id: 3,
    title: '健康检测套餐',
    description: '传统健康检测服务一次',
    points: 500,
    image: 'https://source.unsplash.com/random/300x200/?health-check'
  },
  {
    id: 4,
    title: '中草药礼包',
    description: '精选中草药养生茶礼盒',
    points: 150,
    image: 'https://source.unsplash.com/random/300x200/?herbal-tea'
  },
];

// 积分排行榜数据（模拟数据）
const leaderboardData = [
  { id: 1, username: '健康达人', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', points: 1580 },
  { id: 2, username: '太极爱好者', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', points: 1350 },
  { id: 3, username: '养生专家', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', points: 1200 },
  { id: 4, username: '禅道修行者', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', points: 980 },
  { id: 5, username: '健康先锋', avatar: 'https://randomuser.me/api/portraits/men/5.jpg', points: 850 },
];

function Points() {
  const { currentUser } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' 或 'asc'
  const [activeTab, setActiveTab] = useState(0); // 0: 积分概览, 1: 积分兑换, 2: 排行榜
  const [openRedeemDialog, setOpenRedeemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [redeemHistory, setRedeemHistory] = useState([]);
  
  // 管理员添加积分表单
  const [pointsForm, setPointsForm] = useState({
    points: 0,
    description: ''
  });

  // 积分规则
  const pointsRules = [
    { action: '每日登录', points: 5 },
    { action: '完成健康自测', points: 10 },
    { action: '发布论坛帖子', points: 15 },
    { action: '回复论坛帖子', points: 5 },
    { action: '预约专家咨询', points: 20 },
    { action: '完成太极禅道练习', points: 25 },
    { action: '分享健康知识', points: 15 },
    { action: '邀请新用户注册', points: 30 }
  ];

  // 积分等级
  const memberLevels = [
    { level: '初学者', minPoints: 0, maxPoints: 99, benefits: '基础健康资讯访问' },
    { level: '修行者', minPoints: 100, maxPoints: 299, benefits: '基础健康资讯 + 每月1次免费咨询' },
    { level: '太极师', minPoints: 300, maxPoints: 599, benefits: '全部健康资讯 + 每月2次免费咨询' },
    { level: '禅道大师', minPoints: 600, maxPoints: 999, benefits: '全部健康资讯 + 每月3次免费咨询 + 专属健康方案' },
    { level: '健康宗师', minPoints: 1000, maxPoints: Infinity, benefits: '全部服务无限制使用 + VIP专属活动' }
  ];

  // 加载用户积分数据
  useEffect(() => {
    const fetchPointsData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 获取总积分
        const total = await pointsService.getTotalPointsByUserId(currentUser.id);
        setTotalPoints(total);

        // 获取积分历史
        const history = await pointsService.getPointsHistoryByUserId(currentUser.id);
        setPointsHistory(history);
      } catch (error) {
        console.error('获取积分数据失败:', error);
        setError('获取积分数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchPointsData();
  }, [currentUser]);

  // 获取当前用户等级
  const getCurrentLevel = () => {
    for (const level of memberLevels) {
      if (totalPoints >= level.minPoints && totalPoints <= level.maxPoints) {
        return level;
      }
    }
    return memberLevels[0]; // 默认返回第一个等级
  };

  // 计算到下一等级所需积分
  const getPointsToNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const currentLevelIndex = memberLevels.findIndex(level => level.level === currentLevel.level);
    
    // 如果已经是最高等级
    if (currentLevelIndex === memberLevels.length - 1) {
      return 0;
    }
    
    const nextLevel = memberLevels[currentLevelIndex + 1];
    return nextLevel.minPoints - totalPoints;
  };

  // 处理对话框开关
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPointsForm({
      points: 0,
      description: ''
    });
  };

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPointsForm({
      ...pointsForm,
      [name]: name === 'points' ? parseInt(value) || 0 : value
    });
  };

  // 提交积分表单（仅管理员）
  const handleSubmitPoints = async () => {
    if (!pointsForm.points || !pointsForm.description) {
      setError('请填写所有必填字段');
      return;
    }

    try {
      await pointsService.addPoints(
        currentUser.id,
        pointsForm.points,
        pointsForm.description
      );

      // 重新加载积分数据
      const total = await pointsService.getTotalPointsByUserId(currentUser.id);
      setTotalPoints(total);

      const history = await pointsService.getPointsHistoryByUserId(currentUser.id);
      setPointsHistory(history);

      handleCloseDialog();
    } catch (error) {
      console.error('添加积分失败:', error);
      setError('添加积分失败，请稍后再试');
    }
  };

  // 切换排序顺序
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    // 重新排序历史记录
    const sortedHistory = [...pointsHistory].sort((a, b) => {
      if (newOrder === 'desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });
    
    setPointsHistory(sortedHistory);
  };

  // 格式化日期
  const formatDate = (date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 处理标签切换
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };
  
  // 处理积分兑换
  const handleRedeemItem = (item) => {
    setSelectedItem(item);
    setOpenRedeemDialog(true);
  };
  
  // 关闭兑换对话框
  const handleCloseRedeemDialog = () => {
    setOpenRedeemDialog(false);
    setSelectedItem(null);
  };
  
  // 确认兑换
  const handleConfirmRedeem = () => {
    // 检查积分是否足够
    if (totalPoints < selectedItem.points) {
      setSnackbarMessage('积分不足，无法兑换');
      setSnackbarOpen(true);
      return;
    }
    
    // 模拟兑换操作
    // 在实际应用中，这里应该调用API进行兑换操作
    const newRedeemHistory = [
      ...redeemHistory,
      {
        id: Date.now(),
        itemId: selectedItem.id,
        itemTitle: selectedItem.title,
        points: selectedItem.points,
        redeemDate: new Date()
      }
    ];
    setRedeemHistory(newRedeemHistory);
    
    // 扣除积分
    const newPoints = totalPoints - selectedItem.points;
    setTotalPoints(newPoints);
    
    // 添加积分记录
    const newPointsHistory = [
      {
        id: Date.now(),
        points: -selectedItem.points,
        description: `兑换商品: ${selectedItem.title}`,
        createdAt: new Date()
      },
      ...pointsHistory
    ];
    setPointsHistory(newPointsHistory);
    
    // 显示成功消息
    setSnackbarMessage(`成功兑换: ${selectedItem.title}`);
    setSnackbarOpen(true);
    
    // 关闭对话框
    handleCloseRedeemDialog();
  };
  
  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          <StarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          积分管理
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          累积积分，提升会员等级，享受更多健康服务
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!currentUser ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            请先登录后查看您的积分信息
          </Typography>
        </Paper>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* 导航标签 */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  borderBottom: activeTab === 0 ? 2 : 0,
                  borderColor: 'primary.main',
                  color: activeTab === 0 ? 'primary.main' : 'inherit',
                  fontWeight: activeTab === 0 ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => handleTabChange(0)}
              >
                <StarIcon sx={{ mr: 1 }} />
                积分概览
              </Box>
              <Box 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  borderBottom: activeTab === 1 ? 2 : 0,
                  borderColor: 'primary.main',
                  color: activeTab === 1 ? 'primary.main' : 'inherit',
                  fontWeight: activeTab === 1 ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => handleTabChange(1)}
              >
                <RedeemIcon sx={{ mr: 1 }} />
                积分兑换
              </Box>
              <Box 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  borderBottom: activeTab === 2 ? 2 : 0,
                  borderColor: 'primary.main',
                  color: activeTab === 2 ? 'primary.main' : 'inherit',
                  fontWeight: activeTab === 2 ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => handleTabChange(2)}
              >
                <LeaderboardIcon sx={{ mr: 1 }} />
                积分排行
              </Box>
            </Box>
          </Paper>
          
          {/* 积分概览标签页 */}
          {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* 积分概览 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  积分概览
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    {totalPoints}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    当前积分
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    当前等级: 
                    <Chip 
                      label={getCurrentLevel().level} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    等级特权: {getCurrentLevel().benefits}
                  </Typography>
                  {getPointsToNextLevel() > 0 && (
                    <Typography variant="body2">
                      距离下一等级还需: <strong>{getPointsToNextLevel()}</strong> 积分
                    </Typography>
                  )}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    fullWidth
                  >
                    手动添加积分
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 积分规则 */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    积分规则
                  </Typography>
                  <Tooltip title="完成相应操作可获得积分奖励">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {pointsRules.map((rule, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">{rule.action}</Typography>
                        <Chip label={`+${rule.points}`} color="success" />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 积分历史 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    积分历史
                  </Typography>
                  <Tooltip title={sortOrder === 'desc' ? '最新在前' : '最早在前'}>
                    <IconButton onClick={toggleSortOrder} size="small">
                      {sortOrder === 'desc' ? <ArrowDownIcon /> : <ArrowUpIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {pointsHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    暂无积分记录
                  </Typography>
                ) : (
                  <List>
                    {pointsHistory.map((record) => (
                      <ListItem key={record.id} divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body1">{record.description}</Typography>
                              <Typography 
                                variant="body1" 
                                color={record.points > 0 ? 'success.main' : 'error.main'}
                                fontWeight="bold"
                              >
                                {record.points > 0 ? `+${record.points}` : record.points}
                              </Typography>
                            </Box>
                          }
                          secondary={formatDate(record.createdAt)}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          )}
          
          {/* 积分兑换标签页 */}
          {activeTab === 1 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <RedeemIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  积分兑换商城
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  使用您的积分兑换各种健康服务和产品，当前可用积分: <Chip label={totalPoints} color="primary" size="small" />
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {redeemItems.map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={item.image}
                        alt={item.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {item.description}
                        </Typography>
                        <Chip 
                          icon={<StarIcon />} 
                          label={`${item.points} 积分`} 
                          color="primary" 
                          variant="outlined"
                        />
                      </CardContent>
                      <CardActions>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          color="primary"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleRedeemItem(item)}
                          disabled={totalPoints < item.points}
                        >
                          立即兑换
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* 兑换历史记录 */}
              {redeemHistory.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    兑换历史
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>商品名称</TableCell>
                          <TableCell>消耗积分</TableCell>
                          <TableCell>兑换时间</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {redeemHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.itemTitle}</TableCell>
                            <TableCell>{record.points}</TableCell>
                            <TableCell>{formatDate(record.redeemDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          )}
          
          {/* 积分排行榜标签页 */}
          {activeTab === 2 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <LeaderboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  积分排行榜
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  查看平台用户积分排名，努力提升您的排名吧！
                </Typography>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>排名</TableCell>
                      <TableCell>用户</TableCell>
                      <TableCell>积分</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboardData.map((user, index) => (
                      <TableRow key={user.id} sx={{
                        backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'inherit'
                      }}>
                        <TableCell>
                          <Chip 
                            label={index + 1} 
                            color={index === 0 ? 'secondary' : index < 3 ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={user.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
                            {user.username}
                            {index === 0 && (
                              <Chip size="small" label="榜首" color="secondary" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold" color="primary">
                            {user.points}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* 当前用户排名（模拟） */}
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 255, 0.05)' }}>
                      <TableCell>
                        <Chip label="12" size="small" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {currentUser?.username?.charAt(0) || 'U'}
                          </Avatar>
                          {currentUser?.username || '当前用户'}
                          <Chip size="small" label="我" color="primary" sx={{ ml: 1 }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {totalPoints}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}

      {/* 添加积分对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>添加积分</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="points"
            label="积分数量"
            type="number"
            fullWidth
            variant="outlined"
            value={pointsForm.points}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            helperText="输入正数增加积分，负数减少积分"
          />
          <TextField
            name="description"
            label="积分描述"
            fullWidth
            variant="outlined"
            value={pointsForm.description}
            onChange={handleFormChange}
            placeholder="例如：完成健康自测"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmitPoints} variant="contained">
            确认
          </Button>
        </DialogActions>
      </Dialog>

      {/* 积分兑换确认对话框 */}
      <Dialog open={openRedeemDialog} onClose={handleCloseRedeemDialog} maxWidth="xs" fullWidth>
        <DialogTitle>确认兑换</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {selectedItem.title}
              </Typography>
              <Box sx={{ my: 2 }}>
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title} 
                  style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }} 
                />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedItem.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">所需积分:</Typography>
                <Chip 
                  icon={<StarIcon />} 
                  label={selectedItem.points} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">您的积分:</Typography>
                <Typography 
                  variant="body1" 
                  color={totalPoints >= selectedItem.points ? 'success.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {totalPoints}
                </Typography>
              </Box>
              {totalPoints < selectedItem.points && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  积分不足，无法兑换此商品
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRedeemDialog}>取消</Button>
          <Button 
            onClick={handleConfirmRedeem} 
            variant="contained" 
            color="primary"
            disabled={!selectedItem || totalPoints < selectedItem.points}
          >
            确认兑换
          </Button>
        </DialogActions>
      </Dialog>

      {/* 积分变动通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          icon={<NotificationsIcon />}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Points;