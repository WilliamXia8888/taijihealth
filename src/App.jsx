import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import socketService from './services/socketService';
import './App.css';
import './styles/responsive.css'; // 引入移动端响应式样式

// 布局组件
import Navbar from './components/layout/Navbar';

// 页面组件
import Home from './pages/Home';
import Diagnosis from './pages/Diagnosis';
import ExpertConsultation from './pages/ExpertConsultation';
import TaijiExercises from './pages/TaijiExercises';
import TaijiVideos from './pages/TaijiVideos';
import Knowledge from './pages/Knowledge';
import Forum from './pages/Forum';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ExpertLogin from './pages/ExpertLogin';
import UserLogin from './pages/UserLogin';
import HealthRecords from './pages/HealthRecords';
import Points from './pages/Points';
import About from './pages/About';

// 角色面板组件
import AdminPanel from './pages/AdminPanel';
import AdminExpertApproval from './pages/AdminExpertApproval';
import ExpertPanel from './pages/ExpertPanel';
import MemberPanel from './pages/MemberPanel';
import UserPanel from './pages/UserPanel';

// 修复path-to-regexp错误，确保不使用无效的URL格式
// 注意：路由路径必须是有效的URL路径参数格式，不能包含完整URL（如https://）

// 导航包装组件，提供导航功能给AuthContext
function NavigationWrapper() {
  const navigate = useNavigate();
  
  // 将导航函数挂载到window对象，供AuthContext使用
  useEffect(() => {
    window.navigateAfterLogin = (path) => {
      navigate(path);
    };
    
    return () => {
      window.navigateAfterLogin = null;
    };
  }, [navigate]);
  
  return null;
}

function App() {
  // 检测是否为移动设备
  useEffect(() => {
    // 更全面的移动设备检测
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent) || 
                  (window.innerWidth <= 768) || 
                  ('ontouchstart' in window) || 
                  (navigator.maxTouchPoints > 0);
    if (isMobile) {
      document.documentElement.classList.add('mobile-device');
      // 强制应用移动端样式
      document.querySelector('meta[name="viewport"]')?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      console.log('检测到移动设备，已应用移动端样式');
    }
  }, []);
  
  // 初始化WebSocket连接
  useEffect(() => {
    // 尝试连接WebSocket服务
    const connectSocket = async () => {
      try {
        // 确保应用内容始终可见，无论WebSocket连接是否成功
        document.querySelector('.app-main').style.display = 'block';
        document.querySelector('.app-main').style.visibility = 'visible';
        document.querySelector('.app-main').style.opacity = '1';
        
        // 获取当前主机和端口，确保在不同环境下都能正确连接
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const host = window.location.hostname;
        
        // 检测是否为本地开发环境
        const isLocalhost = host === 'localhost' || host === '127.0.0.1';
        
        // 检测是否为Ngrok环境
        const isNgrok = host.includes('ngrok');
        
        // 根据环境确定正确的端口和连接方式
        let port = '5001';
        let serverUrl;
        
        if (isLocalhost) {
          // 本地开发环境使用固定地址
          serverUrl = 'http://localhost:5001';
        } else if (isNgrok) {
          // Ngrok环境下使用相同的主机名但不同的路径
          // 注意：Ngrok通常会将所有流量转发到同一个端口
          serverUrl = `${protocol}//${host}`;
          console.log('检测到Ngrok环境，使用特殊连接配置');
        } else {
          // 其他环境
          serverUrl = `${protocol}//${host}:${port}`;
        }
        
        console.log(`尝试连接WebSocket服务: ${serverUrl}`);
        
        // 添加重试逻辑
        let retryCount = 0;
        const maxRetries = 3;
        
        const tryConnect = async () => {
          try {
            // 连接到信令服务器
            const connected = await socketService.initialize(serverUrl, {
              id: 'guest', // 初始为访客，登录后会更新
              role: 'guest'
            });
            return connected; // 现在initialize可能返回false而不是抛出错误
          } catch (error) {
            console.warn(`WebSocket连接尝试 ${retryCount + 1}/${maxRetries} 失败:`, error.message);
            return false;
          }
        };
        
        // 尝试连接，如果失败则重试
        let connected = await tryConnect();
        while (!connected && retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`等待2秒后重试连接... (${retryCount}/${maxRetries - 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          connected = await tryConnect();
        }
        
        if (!connected) {
          console.error('WebSocket服务初始化失败，已达到最大重试次数');
          console.warn('应用将以有限功能模式运行，视频通话和实时通讯功能不可用');
          // 即使WebSocket连接失败，应用仍然可以继续运行
          // 移动设备上显示友好提示
          if (isMobile) {
            toast.info('部分实时功能可能不可用，但您仍可浏览大部分内容');
          }
        } else {
          console.log('WebSocket服务初始化成功');
        }
      } catch (error) {
        console.error('WebSocket服务初始化失败:', error);
        // 即使WebSocket连接失败，应用仍然可以继续运行
        // 只是一些实时功能（如视频通话）可能不可用
        console.warn('应用将以有限功能模式运行，实时通讯功能可能不可用');
      }
    };
    
    // 延迟一点时间再连接WebSocket，确保UI已经渲染
    setTimeout(() => {
      connectSocket();
    }, 1000);
    
    // 组件卸载时断开连接
    return () => {
      socketService.disconnect();
    };
  }, []);
  
  // 检测当前环境，确定正确的basename
  const getBasename = () => {
    // 检查当前URL是否包含/taijihealth路径
    const pathname = window.location.pathname;
    if (pathname.includes('/taijihealth')) {
      return '/taijihealth';
    }
    // 默认使用根路径作为basename
    return '/';
  };
  
  return (
    <BrowserRouter basename={getBasename()}>
      <ThemeProvider>
        <AuthProvider>
          <CssBaseline />
          <ToastContainer position="top-right" autoClose={5000} />
          <NavigationWrapper />
          <div className="app-container" id="app-container">
            <Navbar />
            <main className="app-main" style={{display: 'block', visibility: 'visible', opacity: 1}}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/diagnosis" element={<Diagnosis />} />
                <Route path="/expert-consultation" element={<ExpertConsultation />} />
                <Route path="/taiji-exercises" element={<TaijiExercises />} />
                <Route path="/taiji-videos" element={<TaijiVideos />} />
                <Route path="/knowledge" element={<Knowledge />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/expert-login" element={<ExpertLogin />} />
                <Route path="/user-login" element={<UserLogin />} />
                <Route path="/health-records" element={<HealthRecords />} />
                <Route path="/points" element={<Points />} />
                <Route path="/about" element={<About />} />
                
                {/* 角色面板路由 */}
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/expert-approval" element={<AdminExpertApproval />} />
                <Route path="/admin/users" element={<AdminPanel />} />
                <Route path="/admin/consultation-monitor" element={<AdminPanel />} />
                <Route path="/admin/feedback" element={<AdminPanel />} />
                <Route path="/admin/settings" element={<AdminPanel />} />
                <Route path="/admin/payment" element={<AdminPanel />} />
                <Route path="/expert" element={<ExpertPanel />} />
                <Route path="/member" element={<MemberPanel />} />
                <Route path="/user" element={<UserPanel />} />
              </Routes>
            </main>
            <footer className="app-footer">
              © {new Date().getFullYear()} 太极禅道传统健康一诊五疗体系
            </footer>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
