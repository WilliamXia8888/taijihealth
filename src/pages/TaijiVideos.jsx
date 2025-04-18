import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import TaijiVideoPlayer from '../components/taiji/TaijiVideoPlayer';
import TaijiVideoCategory from '../components/taiji/TaijiVideoCategory';
import { taijiVideos, videoCategories } from '../data/taijiVideos';

/**
 * 太极养生视频页面
 * 用于展示和播放太极养生相关的视频内容
 */
function TaijiVideos() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 处理分类选择
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setTabValue(1); // 切换到分类视频标签页
  };

  // 处理视频选择
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setTabValue(2); // 切换到视频播放标签页
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          太极养生视频
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          传统太极养生视频教学，平衡身心，强健体魄
        </Typography>
      </Box>

      {/* 面包屑导航 */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="/"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          首页
        </Link>
        <Typography color="text.primary">太极养生视频</Typography>
        {selectedCategory && tabValue === 1 && (
          <Typography color="text.primary">{selectedCategory.title}</Typography>
        )}
        {selectedVideo && tabValue === 2 && (
          <Typography color="text.primary">{selectedVideo.title}</Typography>
        )}
      </Breadcrumbs>

      {/* 标签页 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="视频分类" />
          <Tab label="分类视频" disabled={!selectedCategory} />
          <Tab label="视频播放" disabled={!selectedVideo} />
        </Tabs>
      </Paper>

      {/* 视频分类 */}
      {tabValue === 0 && (
        <TaijiVideoCategory 
          categories={videoCategories} 
          onSelectCategory={handleCategorySelect} 
          onSelectVideo={handleVideoSelect} 
        />
      )}

      {/* 分类视频 */}
      {tabValue === 1 && selectedCategory && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            {selectedCategory.title}视频
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedCategory.description}
          </Typography>
          
          <Grid container spacing={3}>
            {selectedCategory.videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => handleVideoSelect(video)}
                >
                  <Box 
                    component="img" 
                    src={video.thumbnail} 
                    alt={video.title}
                    sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                  />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {video.duration} | {video.instructor}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 视频播放 */}
      {tabValue === 2 && selectedVideo && (
        <TaijiVideoPlayer video={selectedVideo} />
      )}
    </Container>
  );
}

export default TaijiVideos;