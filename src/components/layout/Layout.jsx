import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom'; // Make sure useNavigate is imported

function Layout() {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            太极禅道健康
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>登录</Button>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        <Outlet />
      </Container>
      
      <Box component="footer" sx={{ p: 2, mt: 'auto', backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} 太极禅道健康
        </Typography>
      </Box>
    </Box>
  );
}

export default Layout;