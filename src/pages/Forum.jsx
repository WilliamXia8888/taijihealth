import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Collapse,
  Chip
} from '@mui/material';
import {
  Forum as ForumIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Comment as CommentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { forumService, userService } from '../services/db';

function Forum() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 新帖子对话框状态
  const [openDialog, setOpenDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // 评论状态
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [usersCache, setUsersCache] = useState({});

  // 加载帖子数据
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const allPosts = await forumService.getAllPosts();
        setPosts(allPosts);
        
        // 预加载帖子作者信息
        const userIds = [...new Set(allPosts.map(post => post.userId))];
        const usersData = {};
        
        for (const userId of userIds) {
          const user = await userService.getUserById(userId);
          if (user) {
            usersData[userId] = user;
          }
        }
        
        setUsersCache(usersData);
      } catch (error) {
        console.error('获取帖子失败:', error);
        setError('获取帖子数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 处理对话框开关
  const handleOpenDialog = () => {
    if (!currentUser) {
      setError('请先登录后再发布帖子');
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPost({
      title: '',
      content: ''
    });
  };

  // 处理新帖子表单变化
  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value
    });
  };

  // 提交新帖子
  const handleSubmitPost = async () => {
    if (!newPost.title || !newPost.content) {
      setError('请填写所有必填字段');
      return;
    }

    try {
      setSubmitLoading(true);
      await forumService.createPost(
        currentUser.id,
        newPost.title,
        newPost.content
      );

      // 重新加载帖子
      const allPosts = await forumService.getAllPosts();
      setPosts(allPosts);
      
      handleCloseDialog();
    } catch (error) {
      console.error('发布帖子失败:', error);
      setError('发布帖子失败，请稍后再试');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 处理展开/收起评论
  const handleExpandComments = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    
    setExpandedPost(postId);
    
    if (!comments[postId]) {
      try {
        setCommentLoading(true);
        const postComments = await forumService.getCommentsByPostId(postId);
        
        // 加载评论作者信息
        const commentUserIds = [...new Set(postComments.map(comment => comment.userId))];
        const newUsersCache = {...usersCache};
        
        for (const userId of commentUserIds) {
          if (!newUsersCache[userId]) {
            const user = await userService.getUserById(userId);
            if (user) {
              newUsersCache[userId] = user;
            }
          }
        }
        
        setUsersCache(newUsersCache);
        setComments(prev => ({
          ...prev,
          [postId]: postComments
        }));
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        setCommentLoading(false);
      }
    }
  };

  // 处理评论输入变化
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  // 提交评论
  const handleSubmitComment = async (postId) => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      setError('请先登录后再发表评论');
      return;
    }

    try {
      setCommentLoading(true);
      await forumService.addComment(postId, currentUser.id, newComment);
      
      // 重新加载评论
      const postComments = await forumService.getCommentsByPostId(postId);
      setComments(prev => ({
        ...prev,
        [postId]: postComments
      }));
      
      setNewComment('');
    } catch (error) {
      console.error('发表评论失败:', error);
      setError('发表评论失败，请稍后再试');
    } finally {
      setCommentLoading(false);
    }
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

  // 获取用户名
  const getUserName = (userId) => {
    return usersCache[userId]?.username || '未知用户';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          <ForumIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          社区论坛
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          分享健康经验，交流养生心得
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          发布新帖
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            暂无帖子，来发布第一个帖子吧！
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {posts.map(post => (
            <Grid item xs={12} key={post.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {post.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24, mr: 1 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {getUserName(post.userId)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.createdAt)}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" paragraph>
                    {post.content}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={expandedPost === post.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => handleExpandComments(post.id)}
                    size="small"
                  >
                    {expandedPost === post.id ? '收起评论' : '查看评论'}
                  </Button>
                </CardActions>
                
                <Collapse in={expandedPost === post.id} timeout="auto" unmountOnExit>
                  <CardContent>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      <CommentIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      评论区
                    </Typography>
                    
                    {commentLoading && !comments[post.id] ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : comments[post.id]?.length > 0 ? (
                      <List>
                        {comments[post.id].map(comment => (
                          <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="subtitle2">
                                    {getUserName(comment.userId)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(comment.createdAt)}
                                  </Typography>
                                </Box>
                              }
                              secondary={comment.content}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                        暂无评论，来发表第一条评论吧！
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="发表评论..."
                        value={newComment}
                        onChange={handleCommentChange}
                        disabled={!currentUser || commentLoading}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={() => handleSubmitComment(post.id)}
                        disabled={!currentUser || !newComment.trim() || commentLoading}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                    {!currentUser && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        请先登录后再发表评论
                      </Typography>
                    )}
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 发布帖子对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>发布新帖</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="帖子标题"
            type="text"
            fullWidth
            variant="outlined"
            value={newPost.title}
            onChange={handlePostChange}
            sx={{ mb: 2 }}
          />
          <TextField
            name="content"
            label="帖子内容"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
            value={newPost.content}
            onChange={handlePostChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button 
            onClick={handleSubmitPost} 
            variant="contained" 
            disabled={submitLoading}
          >
            {submitLoading ? <CircularProgress size={24} /> : '发布'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Forum;