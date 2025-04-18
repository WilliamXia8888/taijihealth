import { Box, Typography, Paper, Button, Container, useTheme, useMediaQuery, Divider, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// 样式化组件
const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between', // 改为space-between以更好地分布内容
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5), // 手机端减小内边距
    marginBottom: theme.spacing(1), // 增加底部间距
  },
}));

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const features = [
    { id: 1, title: '健康诊断', description: '基于中医理论的智能健康评估', path: '/diagnosis' },
    { id: 2, title: '专家咨询', description: '连接资深中医专家在线解答', path: '/expert-consultation' },
    { id: 3, title: '太极养生', description: '太极拳教学与养生功法指导', path: '/taiji-exercises' },
    { id: 4, title: '中医知识', description: '丰富的中医理论与实践知识库', path: '/knowledge' },
    { id: 5, title: '健康论坛', description: '用户交流分享健康心得', path: '/forum' },
    { id: 6, title: '健康档案', description: '个人健康数据记录与分析', path: '/health-records' },
    { id: 7, title: '积分管理', description: '累积积分提升会员等级享受更多服务', path: '/points' },
  ];
  
  // 关于我们信息
  const aboutInfo = { title: '关于我们', description: '太极禅道传统健康一诊五疗体系，提供药疗、食疗、理疗、功疗、心疗五种调理方案', path: '/about' };

  return (
    <Container maxWidth="lg" sx={{ 
      px: isMobile ? 1 : isTablet ? 1.5 : 2,
      py: isMobile ? 1 : 2 
    }}>
      <Box sx={{ mb: 6, mt: 2, textAlign: 'center' }}>
        <Typography 
          variant={isMobile ? "h4" : isTablet ? "h3" : "h2"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: '#1B5E20',
            mb: isMobile ? 1 : 2,
            letterSpacing: '0.5px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            fontSize: isMobile ? '1.75rem' : isTablet ? '2.25rem' : '3rem',
            lineHeight: isMobile ? 1.2 : 1.3
          }}
        >
          太极禅道传统健康一诊五疗体系
        </Typography>
        
        <Typography 
          variant={isMobile ? "body1" : isTablet ? "subtitle1" : "h6"} 
          gutterBottom
          sx={{ 
            maxWidth: isMobile ? '100%' : '800px', 
            mx: 'auto', 
            mb: isMobile ? 2 : isTablet ? 3 : 4,
            color: '#333333', // 加深副标题颜色，提高可读性
            fontWeight: 500,
            fontSize: isMobile ? '0.95rem' : isTablet ? '1rem' : '1.15rem',
            px: isMobile ? 1 : 0
          }}
        >
          融合传统中医理论与现代科技，为您提供全面的健康管理解决方案
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          justifyContent: 'center', 
          gap: isMobile ? 1 : isTablet ? 1.5 : 2, 
          mb: isMobile ? 2 : isTablet ? 3 : 4,
          bgcolor: 'background.paper',
          p: isMobile ? 1.5 : isTablet ? 1.75 : 2,
          borderRadius: 1,
          boxShadow: 1,
          width: '100%',
          overflow: 'hidden'
        }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="div" 
            sx={{ 
              fontWeight: 'medium', 
              color: '#1B5E20',
              fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.25rem',
              textAlign: 'center'
            }}>
            自助、互助、师助健康社区
          </Typography>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="div" 
            sx={{ 
              fontWeight: 'medium', 
              color: 'secondary.main',
              fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.25rem',
              textAlign: 'center'
            }}>
            健康师+理疗师+IA智能
          </Typography>
        </Box>
        
        {/* 关于我们 - 第二行显示 */}
        <Box 
          sx={{ 
            mb: isMobile ? 3 : isTablet ? 4 : 5, 
            p: isMobile ? 1.5 : isTablet ? 2 : 3, 
            bgcolor: 'background.paper', 
            borderRadius: 2,
            boxShadow: 2,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 1.5 : isTablet ? 2 : 3,
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              component="h2" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1B5E20', 
                mb: isMobile ? 0.5 : 1,
                fontSize: isMobile ? '1.15rem' : isTablet ? '1.3rem' : '1.5rem'
              }}>
              {aboutInfo.title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: isMobile ? 1.5 : 2, 
                color: '#333333', 
                fontWeight: 500,
                fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem'
              }}>
              {aboutInfo.description}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate(aboutInfo.path)}
            sx={{ 
              minWidth: isMobile ? '120px' : '150px',
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 'bold',
              py: isMobile ? 0.75 : 1,
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            了解更多
          </Button>
        </Box>
      </Box>

      <Grid container spacing={isMobile ? 1.5 : isTablet ? 2.5 : 4}>
        {features.map((feature) => (
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', lg: 'span 4' } }} key={feature.id}>
            <FeatureCard elevation={3} sx={{ 
              height: isMobile ? 'auto' : '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#1B5E20',
                  fontSize: isMobile ? '1.1rem' : isTablet ? '1.15rem' : '1.25rem',
                  mb: isMobile ? 0.5 : 1
                }}
              >
                {feature.title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: isMobile ? 2 : 3, 
                  color: '#333333', 
                  fontWeight: 500,
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}>
                {feature.description}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                fullWidth
                onClick={() => navigate(feature.path)}
                sx={{ 
                  mt: 'auto',
                  borderRadius: '4px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: isMobile ? 0.75 : 1,
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}
              >
                了解更多
              </Button>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>
      
      {/* 底部区域 */}
      <Box sx={{ 
        mt: isMobile ? 3 : isTablet ? 4 : 5, 
        pt: isMobile ? 2 : 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center'
      }}>
        <Typography 
          variant={isMobile ? "body2" : "body1"} 
          sx={{ 
            color: 'text.secondary',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
            mb: isMobile ? 1 : 2
          }}
        >
          太极禅道健康 - 传承千年智慧，守护现代健康
        </Typography>
      </Box>
    </Container>
  );
}

export default Home;