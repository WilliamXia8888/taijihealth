import { Box, Container, Typography, Link, Grid, useTheme as useMuiTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  const theme = useMuiTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[200] 
          : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              太极禅道健康
            </Typography>
            <Typography variant="body2" color="text.secondary">
              传统健康一诊五疗体系，融合中医精华与现代科技
            </Typography>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              快速链接
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              首页
            </Link>
            <Link component={RouterLink} to="/diagnosis" color="inherit" display="block" sx={{ mb: 1 }}>
              传统健康智能诊察
            </Link>
            <Link component={RouterLink} to="/knowledge" color="inherit" display="block" sx={{ mb: 1 }}>
              健康知识库
            </Link>
            <Link component={RouterLink} to="/forum" color="inherit" display="block">
              社区论坛
            </Link>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              联系我们
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              邮箱: contact@taijihealth.com
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              电话: 400-123-4567
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' 太极禅道传统健康一诊五疗体系. 保留所有权利。'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;