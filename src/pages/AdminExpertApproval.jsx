import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminExpertApproval() {
  const { currentUser, isAdmin, approveExpert } = useAuth();
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  // 检查是否是管理员
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!isAdmin()) {
      navigate('/');
      return;
    }
  }, [currentUser, isAdmin, navigate]);

  // 获取专家申请列表
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        // 实际项目中应该调用API获取数据
        // const response = await fetch('/api/admin/experts/pending');
        // const data = await response.json();
        
        // 模拟数据
        const mockExperts = [
          {
            id: 1,
            username: '张医师',
            phone: '13800138001',
            email: 'zhang@example.com',
            specialty: '传统中医养生',
            introduction: '从事中医养生工作20年，擅长经络调理和太极养生。',
            isExpert: true,
            expertApproved: false,
            createdAt: '2023-05-15T08:30:00Z'
          },
          {
            id: 2,
            username: '李理疗师',
            phone: '13900139002',
            email: 'li@example.com',
            specialty: '推拿按摩',
            introduction: '专注于传统推拿按摩技术，有15年临床经验。',
            isExpert: true,
            expertApproved: false,
            createdAt: '2023-05-16T10:15:00Z'
          },
          {
            id: 3,
            username: '王养生师',
            phone: '13700137003',
            email: 'wang@example.com',
            specialty: '太极气功',
            introduction: '太极气功导师，教授太极养生多年，擅长呼吸调理。',
            isExpert: true,
            expertApproved: false,
            createdAt: '2023-05-17T14:20:00Z'
          }
        ];
        
        setExperts(mockExperts);
      } catch (err) {
        console.error('获取专家申请列表失败:', err);
        setError('获取专家申请列表失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // 处理审批对话框打开
  const handleOpenDialog = (expert, action) => {
    setSelectedExpert(expert);
    setApprovalAction(action);
    setDialogOpen(true);
  };

  // 处理审批对话框关闭
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedExpert(null);
    setApprovalAction(null);
    setActionSuccess(false);
  };

  // 处理专家审批
  const handleApproveExpert = async () => {
    if (!selectedExpert) return;
    
    try {
      setActionLoading(true);
      const approved = approvalAction === 'approve';
      
      // 调用AuthContext中的approveExpert函数
      const success = await approveExpert(selectedExpert.id, approved);
      
      if (success) {
        setActionSuccess(true);
        
        // 更新本地专家列表
        setExperts(prevExperts => 
          prevExperts.filter(expert => expert.id !== selectedExpert.id)
        );
        
        // 2秒后关闭对话框
        setTimeout(() => {
          handleCloseDialog();
        }, 2000);
      } else {
        setError('操作失败，请稍后再试');
      }
    } catch (err) {
      console.error('专家审批失败:', err);
      setError('专家审批失败，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        专家申请审核
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : experts.length === 0 ? (
          <Alert severity="info">当前没有待审核的专家申请</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>用户名</TableCell>
                  <TableCell>联系方式</TableCell>
                  <TableCell>专业领域</TableCell>
                  <TableCell>申请时间</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experts.map((expert) => (
                  <TableRow key={expert.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{expert.username.charAt(0)}</Avatar>
                        {expert.username}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{expert.phone}</Typography>
                      {expert.email && (
                        <Typography variant="body2" color="text.secondary">
                          {expert.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={expert.specialty} size="small" />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {expert.introduction.length > 50 
                          ? `${expert.introduction.substring(0, 50)}...` 
                          : expert.introduction}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(expert.createdAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label="待审核" 
                        color="warning" 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleOpenDialog(expert, 'approve')}
                        >
                          批准
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<RejectIcon />}
                          onClick={() => handleOpenDialog(expert, 'reject')}
                        >
                          拒绝
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* 审批确认对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {approvalAction === 'approve' ? '批准专家申请' : '拒绝专家申请'}
        </DialogTitle>
        <DialogContent>
          {actionSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              {approvalAction === 'approve' ? '已成功批准专家申请' : '已拒绝专家申请'}
            </Alert>
          ) : (
            <>
              <DialogContentText>
                {approvalAction === 'approve' 
                  ? `您确定要批准 ${selectedExpert?.username} 的专家申请吗？批准后，该用户将获得专家权限。` 
                  : `您确定要拒绝 ${selectedExpert?.username} 的专家申请吗？`}
              </DialogContentText>
              
              {selectedExpert && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2">申请信息：</Typography>
                  <Typography variant="body2">专业领域：{selectedExpert.specialty}</Typography>
                  <Typography variant="body2">个人简介：{selectedExpert.introduction}</Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        {!actionSuccess && (
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={actionLoading}>
              取消
            </Button>
            <Button 
              onClick={handleApproveExpert} 
              color={approvalAction === 'approve' ? 'success' : 'error'}
              variant="contained"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            >
              {actionLoading 
                ? '处理中...' 
                : approvalAction === 'approve' ? '确认批准' : '确认拒绝'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Container>
  );
}

export default AdminExpertApproval;