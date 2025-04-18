import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Divider
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';

/**
 * 太极视频分类组件
 * 用于展示太极养生视频的分类列表
 */
const TaijiVideoCategory = ({ categories, onSelectCategory, onSelectVideo }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
        太极养生视频分类
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
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
              <CardActionArea onClick={() => onSelectCategory(category)}>
                <CardMedia
                  component="img"
                  height="140"
                  image={category.thumbnail}
                  alt={category.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {category.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    mb: 2
                  }}>
                    {category.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={`${category.videoCount}个视频`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {category.level}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {categories.length > 0 && categories[0].videos && categories[0].videos.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            推荐视频
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {categories.flatMap(category => 
              category.videos.slice(0, 2).map((video) => (
                <Grid item xs={12} sm={6} md={3} key={video.id}>
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
                    <CardActionArea onClick={() => onSelectVideo(video)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={video.thumbnail}
                        alt={video.title}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                          {video.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={video.level} 
                            size="small" 
                            color={video.level === '初级' ? 'success' : video.level === '中级' ? 'primary' : 'secondary'}
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            <TimerIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {video.duration}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            ).slice(0, 4)}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TaijiVideoCategory;