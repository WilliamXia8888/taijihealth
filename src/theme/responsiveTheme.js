import { createTheme } from '@mui/material/styles';

// 创建响应式主题
const responsiveTheme = createTheme({
  // 断点设置
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  // 组件默认样式
  components: {
    // 容器组件响应式设置
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width:600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
      defaultProps: {
        maxWidth: 'lg',
      },
    },
    // 卡片组件响应式设置
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    // 按钮组件响应式设置
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
  // 调色板
  palette: {
    primary: {
      main: '#4CAF50', // 太极健康绿色
      light: '#80E27E',
      dark: '#087f23',
    },
    secondary: {
      main: '#F44336', // 中医红色
      light: '#FF7961',
      dark: '#BA000D',
    },
    text: {
      primary: '#222222', // 加深主要文本颜色
      secondary: '#333333', // 加深次要文本颜色
    },
  },
  // 排版
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.3rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontSize: '1rem',
    },
  },
});

export default responsiveTheme;