import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * 太极视频播放器组件
 * 用于展示和播放太极养生相关的视频内容
 */
const TaijiVideoPlayer = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');

  // 处理视频播放
  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  // 处理视频暂停
  const handlePauseVideo = () => {
    setIsPlaying(false);
  };
  
  // 视频错误处理状态
  const [videoError, setVideoError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 根据视频信息设置视频源
  useEffect(() => {
    if (video && video.videoUrl) {
      // 重置错误状态
      setVideoError(false);
      setErrorMessage('');
      
      try {
        // 检查是否是完整URL或相对路径
        if (video.videoUrl.startsWith('http')) {
          setVideoSrc(video.videoUrl);
        } else {
          // 构建绝对路径，确保从public目录正确引用
          // 移除开头的所有斜杠，确保路径格式正确
          let correctPath = video.videoUrl;
          while (correctPath.startsWith('/') || correctPath.startsWith('\\')) {
            correctPath = correctPath.substring(1);
          }
          
          // 使用环境变量或window.location.origin构建完整的绝对URL
          // 为GitHub Pages部署添加仓库名称路径
          const baseUrl = window.location.origin;
          const repoPath = baseUrl.includes('github.io') ? '/taijihealth' : '';
          const absolutePath = `${baseUrl}${repoPath}/${correctPath}`;
          setVideoSrc(absolutePath);
          console.log('设置视频源(绝对路径):', absolutePath);
        }
      } catch (error) {
        console.error('设置视频源时出错:', error);
        setVideoError(true);
        setErrorMessage('视频路径处理错误，请联系管理员');
      }
    }
  }, [video]);
  // 处理视频加载错误
  const handleVideoError = (e) => {
    setVideoError(true);
    // 添加更详细的错误信息
    const errorDetails = e && e.target ? `错误代码: ${e.target.error ? e.target.error.code : '未知'}` : '未知错误';
    setErrorMessage(`视频加载失败，请稍后再试。视频文件可能不存在、格式不正确或正在维护中。${errorDetails}`);
    console.error(`视频加载失败: ${videoSrc}，错误详情:`, e);
    
    // 检查视频文件格式
    if (videoSrc && !videoSrc.match(/\.(mp4|webm|ogg)$/i)) {
      console.warn('视频URL可能格式不正确:', videoSrc);
      setErrorMessage('视频格式不正确。请确保视频文件是有效的MP4、WebM或OGG格式。');
    }
    
    // 记录当前视频路径信息，帮助调试
    console.log('视频加载失败，当前路径信息:', {
      videoSrc,
      originalUrl: video?.videoUrl,
      origin: window.location.origin,
      pathname: window.location.pathname
    });
  };

  if (!video) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          请选择一个视频进行播放
        </Typography>
      </Paper>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}> {/* 16:9宽高比 */}
        {video.videoUrl ? (
          videoError ? (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                p: 3,
              }}
            >
              <InfoIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="error" gutterBottom align="center">
                视频加载失败
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {errorMessage}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => {
                  // 重试时强制使用绝对路径
                  if (video && video.videoUrl) {
                    let correctPath = video.videoUrl;
                    // 确保路径格式正确
                    while (correctPath.startsWith('/') || correctPath.startsWith('\\')) {
                      correctPath = correctPath.substring(1);
                    }
                    const absolutePath = `${window.location.origin}/${correctPath}`;
                    console.log('重试: 使用绝对路径加载视频:', absolutePath);
                    setVideoSrc(absolutePath);
                  }
                  setVideoError(false);
                }}
              >
                重试
              </Button>
            </Box>
          ) : (
            <Box
              component="video"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              controls
              poster={video.thumbnail}
              src={videoSrc}
              onPlay={handlePlayVideo}
              onPause={handlePauseVideo}
              onError={handleVideoError}
              playsInline // 支持iOS内联播放
              preload="metadata" // 预加载元数据以提高性能
              controlsList="nodownload" // 禁止下载按钮
            />
          )
        ) : (
          <CardMedia
            component="img"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            image={video.thumbnail}
            alt={video.title}
          />
        )}
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            {video.title}
          </Typography>
          <Chip 
            label={video.level} 
            color={video.level === '初级' ? 'success' : video.level === '中级' ? 'primary' : 'secondary'}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TimerIcon fontSize="small" sx={{ mr: 1 }} color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {video.duration}
          </Typography>
          {video.instructor && (
            <>
              <InfoIcon fontSize="small" sx={{ mr: 1 }} color="action" />
              <Typography variant="body2" color="text.secondary">
                讲师: {video.instructor}
              </Typography>
            </>
          )}
        </Box>
        <Typography variant="body2" paragraph>
          {video.description}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          功效与作用
        </Typography>
        <List dense>
          {video.benefits.map((benefit, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <FavoriteIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={benefit} />
            </ListItem>
          ))}
        </List>
        {!video.videoUrl && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayIcon />}
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => window.open(video.externalUrl || '#', '_blank')}
          >
            观看教学视频
          </Button>
        )}
        {video.videoUrl && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            视频已优化，支持手机端和电脑端播放
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TaijiVideoPlayer;