import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Tabs,
  Tab,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Book as BookIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { knowledgeService } from '../services/db';

// 文章类别
const categories = [
  { id: 'traditional-medicine', name: '传统医学理论' },
  { id: 'taiji-practice', name: '太极禅道实践' },
  { id: 'health-preservation', name: '养生保健知识' },
  { id: 'diet-nutrition', name: '饮食营养' },
  { id: 'seasonal-health', name: '四季养生' },
  { id: 'common-diseases', name: '常见疾病防治' }
];

function Knowledge() {
  const { currentUser } = useAuth();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 新增文章对话框状态
  const [openDialog, setOpenDialog] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // 加载文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const allArticles = await knowledgeService.getAllArticles();
        setArticles(allArticles);
        setFilteredArticles(allArticles);
      } catch (error) {
        console.error('获取文章失败:', error);
        setError('获取文章数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 处理类别切换
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    if (category === 'all') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article => article.category === category);
      setFilteredArticles(filtered);
    }
  };

  // 处理搜索
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    let filtered = articles;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    if (term) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(term) || 
        article.content.toLowerCase().includes(term)
      );
    }
    
    setFilteredArticles(filtered);
  };

  // 处理对话框开关
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewArticle({
      title: '',
      content: '',
      category: ''
    });
  };

  // 处理新文章表单变化
  const handleArticleChange = (e) => {
    const { name, value } = e.target;
    setNewArticle({
      ...newArticle,
      [name]: value
    });
  };

  // 提交新文章
  const handleSubmitArticle = async () => {
    if (!newArticle.title || !newArticle.content || !newArticle.category) {
      setError('请填写所有必填字段');
      return;
    }

    try {
      setSubmitLoading(true);
      await knowledgeService.addArticle(
        newArticle.title,
        newArticle.content,
        newArticle.category
      );

      // 重新加载文章
      const allArticles = await knowledgeService.getAllArticles();
      setArticles(allArticles);
      setFilteredArticles(allArticles);
      
      handleCloseDialog();
    } catch (error) {
      console.error('添加文章失败:', error);
      setError('添加文章失败，请稍后再试');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 截取内容摘要
  const getContentSummary = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          健康知识库
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          探索传统健康理论与实践知识，提升健康素养
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              知识分类
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="搜索文章..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            {currentUser && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                发布文章
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          <Chip 
            label="全部" 
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => handleCategoryChange('all')}
            sx={{ fontWeight: selectedCategory === 'all' ? 'bold' : 'normal' }}
          />
          {categories.map(category => (
            <Chip
              key={category.id}
              label={category.name}
              color={selectedCategory === category.id ? 'primary' : 'default'}
              onClick={() => handleCategoryChange(category.id)}
              sx={{ fontWeight: selectedCategory === category.id ? 'bold' : 'normal' }}
            />
          ))}
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredArticles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            暂无相关文章
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredArticles.map(article => (
            <Grid item xs={12} md={6} key={article.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {article.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      size="small" 
                      label={categories.find(c => c.id === article.category)?.name || '未分类'} 
                      color="primary" 
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(article.createdAt)}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {getContentSummary(article.content)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 添加文章对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>发布健康知识文章</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="文章标题"
            type="text"
            fullWidth
            variant="outlined"
            value={newArticle.title}
            onChange={handleArticleChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>文章分类</InputLabel>
            <Select
              name="category"
              value={newArticle.category}
              label="文章分类"
              onChange={handleArticleChange}
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="content"
            label="文章内容"
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            value={newArticle.content}
            onChange={handleArticleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button 
            onClick={handleSubmitArticle} 
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

export default Knowledge;