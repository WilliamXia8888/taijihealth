import { createContext, useContext, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

// 创建上下文
const ThemeContext = createContext();

// 定义主题
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#2e7d32',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#81c784',
    },
    secondary: {
      main: '#a5d6a7',
    },
  },
});

// 创建提供者组件
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  
  // 切换主题函数
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // 上下文值
  const value = {
    darkMode,
    toggleTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// 自定义钩子
export function useTheme() {
  return useContext(ThemeContext);
}