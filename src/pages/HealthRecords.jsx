import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Favorite as FavoriteIcon,
  LocalHospital as HospitalIcon,
  Today as TodayIcon,
  Healing as HealingIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { healthRecordService } from '../services/db';

function HealthRecords() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState([]);
  const [diagnosticRecords, setDiagnosticRecords] = useState({
    pulseRecord: null,
    tongueRecord: null,
    symptomRecord: null
  });

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 加载健康记录数据
  useEffect(() => {
    // 检查用户是否登录
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchHealthRecords = async () => {
      try {
        setLoading(true);
        // 获取健康记录
        const records = await healthRecordService.getHealthRecordsByUserId(currentUser.id);
        setHealthRecords(records);

        // 获取最新的诊断记录
        const latestDiagnosticRecords = await healthRecordService.getLatestDiagnosticRecords(currentUser.id);
        setDiagnosticRecords(latestDiagnosticRecords);
      } catch (error) {
        console.error('获取健康记录失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecords();
  }, [currentUser, navigate]);

  // 格式化日期
  const formatDate = (date) => {
    if (!date) return '无记录';
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return null; // 用户未登录时不渲染内容
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          个人健康档案
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          查看您的健康记录、诊断历史和治疗方案
        </Typography>
      </Box>

      {/* 标签页 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="健康概览" icon={<FavoriteIcon />} iconPosition="start" />
          <Tab label="诊断记录" icon={<HospitalIcon />} iconPosition="start" />
          <Tab label="治疗方案" icon={<HealingIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* 健康概览 */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} color="primary" />
                      个人信息
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List dense>
                      <ListItem>
                        <ListItemText primary="用户名" secondary={currentUser.username} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="邮箱" secondary={currentUser.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="注册时间" secondary={formatDate(currentUser.createdAt)} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ mr: 1 }} color="primary" />
                      健康记录统计
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                          <Typography variant="h4">{healthRecords.length}</Typography>
                          <Typography variant="body2">健康记录总数</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                          <Typography variant="h4">{diagnosticRecords.pulseRecord ? 1 : 0}</Typography>
                          <Typography variant="body2">脉诊记录</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                          <Typography variant="h4">{diagnosticRecords.tongueRecord ? 1 : 0}</Typography>
                          <Typography variant="body2">舌诊记录</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    {healthRecords.length === 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        您还没有健康记录，请前往诊断页面进行健康诊断。
                      </Alert>
                    )}
                    {healthRecords.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          最近健康记录
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>日期</TableCell>
                                <TableCell>诊断结果</TableCell>
                                <TableCell>操作</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {healthRecords.slice(0, 3).map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>{formatDate(record.date)}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={record.diagnosis.substring(0, 15) + (record.diagnosis.length > 15 ? '...' : '')} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined" 
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      size="small" 
                                      variant="outlined" 
                                      onClick={() => setTabValue(1)}
                                    >
                                      查看详情
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* 诊断记录 */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <HospitalIcon sx={{ mr: 1 }} color="primary" />
                      诊断记录列表
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {healthRecords.length === 0 ? (
                      <Alert severity="info">
                        您还没有诊断记录，请前往诊断页面进行健康诊断。
                      </Alert>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>日期</TableCell>
                              <TableCell>诊断结果</TableCell>
                              <TableCell>治疗方案</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {healthRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{formatDate(record.date)}</TableCell>
                                <TableCell>{record.diagnosis}</TableCell>
                                <TableCell>
                                  {record.treatments.map((treatment, index) => (
                                    <Chip 
                                      key={index}
                                      label={treatment} 
                                      size="small" 
                                      color="secondary" 
                                      sx={{ mr: 0.5, mb: 0.5 }} 
                                    />
                                  ))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      最新脉诊记录
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {diagnosticRecords.pulseRecord ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          记录时间: {formatDate(diagnosticRecords.pulseRecord.date)}
                        </Typography>
                        <Typography variant="body1">
                          {diagnosticRecords.pulseRecord.description}
                        </Typography>
                      </>
                    ) : (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        暂无脉诊记录
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      最新舌诊记录
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {diagnosticRecords.tongueRecord ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          记录时间: {formatDate(diagnosticRecords.tongueRecord.date)}
                        </Typography>
                        <Typography variant="body1">
                          {diagnosticRecords.tongueRecord.description}
                        </Typography>
                      </>
                    ) : (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        暂无舌诊记录
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* 治疗方案 */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <HealingIcon sx={{ mr: 1 }} color="primary" />
                      治疗方案列表
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {healthRecords.length === 0 ? (
                      <Alert severity="info">
                        您还没有治疗方案，请前往诊断页面进行健康诊断。
                      </Alert>
                    ) : (
                      <List>
                        {healthRecords.map((record) => (
                          <Paper key={record.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <TodayIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1">
                                {formatDate(record.date)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              诊断结果: {record.diagnosis}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" gutterBottom>
                              推荐治疗方案:
                            </Typography>
                            <List dense>
                              {record.treatments.map((treatment, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <FavoriteIcon color="secondary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={treatment} />
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}

export default HealthRecords;