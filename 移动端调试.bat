@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===== 太极健康系统移动端调试工具 =====
echo.

:: 设置工作目录
cd /d "%~dp0"

echo 正在运行移动端调试工具...
echo 此工具将帮助诊断和修复移动端白屏问题
echo.

:: 检查Node.js是否安装
node --version > nul 2>&1
if %errorlevel% neq 0 (
  echo 错误: 未检测到Node.js，请先安装Node.js
  goto :end
)

:: 运行调试脚本
node mobile-debug.js

:: 提示用户修复方法
echo.
echo ===== 快速修复选项 =====
echo 1. 重新构建并启动优化版服务
echo 2. 仅重启静态文件服务
echo 3. 仅重启Ngrok服务
echo 4. 退出
echo.

set /p choice=请选择操作 (1-4): 

if "%choice%"=="1" (
  echo 正在重新构建并启动优化版服务...
  call 一键启动服务移动优化版.bat
  goto :end
)

if "%choice%"=="2" (
  echo 正在重启静态文件服务...
  taskkill /f /fi "WINDOWTITLE eq 太极健康系统-静态服务*" > nul 2>&1
  timeout /t 2 /nobreak > nul
  start "太极健康系统-静态服务" cmd /c "set PUBLIC_URL=./ && npx serve -s build -l 5001 --single --cors"
  echo 静态文件服务已重启
  goto :end
)

if "%choice%"=="3" (
  echo 正在重启Ngrok服务...
  taskkill /f /fi "WINDOWTITLE eq 太极健康系统-Ngrok服务*" > nul 2>&1
  timeout /t 2 /nobreak > nul
  start "太极健康系统-Ngrok服务" cmd /c "node ngrok-start.js"
  echo Ngrok服务已重启
  goto :end
)

:end
echo.
echo 按任意键退出...
pause > nul