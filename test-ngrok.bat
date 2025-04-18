@echo off
chcp 65001 > nul
echo ===== Ngrok测试工具 =====
echo.

:: 设置工作目录
cd /d "%~dp0"

:: 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到Node.js，请安装Node.js后重试
  pause
  exit /b 1
)

:: 检查Ngrok是否安装
echo 检查Ngrok是否正确安装...
call npm list ngrok >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 正在安装Ngrok...
  call npm install ngrok --save
  if %ERRORLEVEL% neq 0 (
    echo Ngrok安装失败，请检查网络连接或手动运行npm install ngrok --save
    pause
    exit /b 1
  )
)

:: 运行测试脚本
echo 开始测试Ngrok...
node test-ngrok.js

pause