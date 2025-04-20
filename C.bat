@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===== 太极健康系统服务启动工具（移动设备优化版）=====
echo.

:: 设置工作目录
cd /d "%~dp0"

:: 创建日志文件
set LOG_FILE=startup_log.txt
echo 太极健康系统启动日志 - %date% %time% > %LOG_FILE%

echo 正在启动太极健康系统服务（移动设备优化版）...
echo 正在启动太极健康系统服务（移动设备优化版）... >> %LOG_FILE%

:: 启动后端服务
echo 启动后端服务...
echo 启动后端服务... >> %LOG_FILE%
start "太极健康系统-后端服务" cmd /c "node server\index.js"

:: 等待后端服务启动
echo 等待后端服务启动...
echo 等待后端服务启动... >> %LOG_FILE%
timeout /t 25 /nobreak > nul

:: 确保后端服务完全就绪
echo 确保后端服务完全就绪...
echo 确保后端服务完全就绪... >> %LOG_FILE%
timeout /t 5 /nobreak > nul

:: 启动前端服务（使用特殊参数优化移动设备访问）
echo 启动前端服务（移动设备优化）...
echo 启动前端服务（移动设备优化）... >> %LOG_FILE%
start "太极健康系统-前端服务" cmd /c "set REACT_APP_MOBILE_OPTIMIZED=true && npm start"

:: 等待前端服务启动
echo 等待前端服务启动...
echo 等待前端服务启动... >> %LOG_FILE%
timeout /t 35 /nobreak > nul

:: 启动Ngrok内网穿透
echo 启动Ngrok服务...
echo 启动Ngrok服务... >> %LOG_FILE%
start "太极健康系统-Ngrok服务" cmd /c "node ngrok-start.js"

echo.
echo ===== 太极健康系统启动完成（移动设备优化版）=====
echo.
echo 本地访问地址:
echo - 前端界面: http://localhost:3000
echo - 后端API: http://localhost:3001
echo.
echo 移动设备访问提示:
echo - 请确保手机和电脑在同一网络下
echo - 可通过电脑IP地址访问: http://[电脑IP]:3000
echo - 或使用Ngrok提供的公网地址访问
echo.
echo 如需查看Ngrok公网地址，请查看Ngrok服务窗口
echo.
echo 服务已启动完成 >> %LOG_FILE%
echo.
echo 按任意键退出此窗口（服务将在后台继续运行）...
pause > nul