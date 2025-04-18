@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===== 太极禅道传统健康网站Ngrok公网访问工具 =====
echo.

:: 设置工作目录
cd /d "%~dp0"

:: 检查Ngrok是否安装
where ngrok >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到Ngrok，请先安装Ngrok
  echo 您可以从 https://ngrok.com/download 下载Ngrok
  echo 安装后，请确保将Ngrok添加到系统PATH环境变量
  goto :error
)

:: 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到Node.js，请安装Node.js后重试
  goto :error
)

:: 检查ngrok.config.js是否存在
if not exist ngrok.config.js (
  echo 错误: 未找到Ngrok配置文件
  goto :error
)

:: 检查ngrok.json配置文件
if not exist ngrok.json (
  echo 创建Ngrok配置文件...
  (
    echo {
    echo   "port": 3000,
    echo   "authtoken": "",
    echo   "region": "ap"
    echo }
  ) > ngrok.json
  echo 已创建Ngrok配置文件
  echo 请编辑ngrok.json设置您的认证令牌
)

:: 显示配置选项
echo 请选择Ngrok配置选项:
echo 1. 基本配置 - 使用默认设置
echo 2. 添加访问密码保护
echo.

set /p OPTION=请输入选项 (1-2): 

if "%OPTION%"=="1" (
  echo 使用基本配置启动Ngrok服务...
  node ngrok-start.js
) else if "%OPTION%"=="2" (
  echo 请设置访问密码保护
  set /p USERNAME=请输入用户名: 
  set /p PASSWORD=请输入密码: 
  
  :: 更新ngrok.json配置
  echo 更新Ngrok配置...
  node -e "const fs = require('fs'); const config = require('./ngrok.json'); config.auth = '%USERNAME%:%PASSWORD%'; fs.writeFileSync('ngrok.json', JSON.stringify(config, null, 2));"
  
  echo 使用密码保护启动Ngrok服务...
  node ngrok-start.js
) else (
  echo 无效的选项
  goto :error
)

goto :eof

:error
echo.
echo 启动Ngrok服务失败
echo.
echo 按任意键退出...
pause > nul