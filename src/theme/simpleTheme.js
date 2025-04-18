import { createTheme } from '@mui/material/styles';

// 创建简化的响应式主题
const simpleTheme = createTheme({
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
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
        },
      },
    },
  },
});

export default simpleTheme;