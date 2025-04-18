import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import NotificationBar from './NotificationBar';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
  HealthAndSafety as HealthIcon,
  Person as PersonIcon,
  Forum as ForumIcon,
  Book as BookIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const pages = [
  { name: '首页', path: '/', icon: <HomeIcon /> },
  { name: '传统健康智能诊察', path: '/diagnosis', icon: <HealthIcon /> },
  { name: '健康专家在线诊察咨询', path: '/expert-consultation', icon: <PersonIcon /> },
  { name: '太极禅道健身功法', path: '/taiji-exercises', icon: <HealthIcon /> },
  { name: '太极养生视频', path: '/taiji-videos', icon: <HealthIcon /> },
  { name: '传统健康知识库', path: '/knowledge', icon: <BookIcon /> },
  { name: '社区论坛', path: '/forum', icon: <ForumIcon /> },
  { name: '关于我们', path: '/about', icon: <InfoIcon /> },
];

const settings = [
  { name: '个人资料', path: '/profile' },
  { name: '健康档案', path: '/health-records' },
  { name: '积分管理', path: '/points' },
];

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          太极禅道健康
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 1 }}>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={page.path}
              onClick={handleDrawerToggle}
              sx={{ py: { xs: 1.5, sm: 1 } }} // 增加移动端的点击区域高度
            >
              <ListItemIcon>
                {page.icon}
              </ListItemIcon>
              <ListItemText 
                primary={page.name} 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  fontWeight: 500
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {currentUser ? (
        <List sx={{ py: 0.5 }}>
          {settings.map((setting) => (
            <ListItem key={setting.name} disablePadding>
              <ListItemButton 
                component={RouterLink} 
                to={setting.path}
                onClick={handleDrawerToggle}
                sx={{ py: { xs: 1.5, sm: 1 } }} // 增加移动端的点击区域高度
              >
                <ListItemText 
                  primary={setting.name} 
                  primaryTypographyProps={{ 
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    fontWeight: 500
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{ py: { xs: 1.5, sm: 1 } }} // 增加移动端的点击区域高度
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="退出登录" 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  fontWeight: 500
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      ) : (
        <List sx={{ py: 0.5 }}>
          <ListItem disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to="/user-login"
              onClick={handleDrawerToggle}
              sx={{ py: { xs: 1.5, sm: 1 } }} // 增加移动端的点击区域高度
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText 
                primary="登录" 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  fontWeight: 500
                }} 
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to="/user-login?tab=register"
              onClick={handleDrawerToggle}
              sx={{ py: { xs: 1.5, sm: 1 } }} // 增加移动端的点击区域高度
            >
              <ListItemText 
                primary="注册" 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  fontWeight: 500
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
          {/* 桌面版 Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            太极禅道健康
          </Typography>

          {/* 移动版导航菜单 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="菜单"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={handleDrawerToggle}
            >
              {drawer}
            </Drawer>
          </Box>

          {/* 移动版 Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            太极禅道健康
          </Typography>

          {/* 桌面版导航菜单 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                startIcon={page.icon}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* 主题切换按钮 */}
          <Box sx={{ mr: 2 }}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>

          {/* 用户菜单 */}
          {currentUser ? (
            <>
              {/* 消息通知组件 */}
              <Box sx={{ ml: 1 }}>
                <NotificationBar />
              </Box>
              
              <Box sx={{ flexGrow: 0, ml: 1 }}>
                <Tooltip title="打开设置">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={currentUser.username} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting.name} onClick={() => {
                      handleCloseUserMenu();
                      navigate(setting.path);
                    }}>
                      <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">退出登录</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/user-login"
                startIcon={<LoginIcon />}
                sx={{ ml: 2 }}
              >
                登录
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                component={RouterLink}
                to="/user-login?tab=register"
                sx={{ ml: 1 }}
              >
                注册
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;