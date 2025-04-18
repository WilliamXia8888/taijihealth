import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          太极禅道健康
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme}>
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        {currentUser ? (
          <Box>
            <Button color="inherit">{currentUser.username}</Button>
            <Button color="inherit" onClick={handleLogout}>
              退出
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;