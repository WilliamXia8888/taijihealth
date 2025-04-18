import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 添加调试信息
console.log('index.js 执行');
console.log('当前路径:', window.location.pathname);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);