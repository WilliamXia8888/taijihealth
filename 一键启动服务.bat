@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===== 太极禅道传统健康网站一键启动工具 =====
echo.

:: 设置工作目录
cd /d "%~dp0"

:: 创建日志目录
if not exist logs mkdir logs

:: 日志文件
set LOG_FILE=startup_log.txt
echo 启动时间: %date% %time% > %LOG_FILE%

:: 检查环境依赖
echo 正在检查环境依赖...
echo 检查环境依赖... >> %LOG_FILE%

:: 检查Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到Python，请安装Python 3.8或更高版本
  echo 错误: 未找到Python，请安装Python 3.8或更高版本 >> %LOG_FILE%
  goto :error
)

:: 检查Python版本
for /f "tokens=2" %%a in ('python --version 2^>^&1') do set PYTHON_VERSION=%%a
echo 检测到Python版本: %PYTHON_VERSION% >> %LOG_FILE%
echo 检测到Python版本: %PYTHON_VERSION%

:: 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到Node.js，请安装Node.js 12.0或更高版本
  echo 错误: 未找到Node.js，请安装Node.js 12.0或更高版本 >> %LOG_FILE%
  goto :error
)

:: 检查Node.js版本
for /f "tokens=2" %%a in ('node --version') do set NODE_VERSION=%%a
echo 检测到Node.js版本: %NODE_VERSION% >> %LOG_FILE%
echo 检测到Node.js版本: %NODE_VERSION%

:: 检查并创建配置文件
echo 正在检查配置文件...
echo 检查配置文件... >> %LOG_FILE%

:: 检查后端.env文件
if not exist backend\.env (
  echo 创建后端配置文件...
  echo 创建后端配置文件... >> %LOG_FILE%
  (
    echo API_KEY=your_deepseek_api_key_here
    echo ENV=development
    echo RATE_LIMIT=100
    echo SECRET_KEY=your_secret_key_here
  ) > backend\.env
  echo 已创建后端配置文件，请编辑backend\.env设置您的API密钥
  echo 已创建后端配置文件 >> %LOG_FILE%
)

:: 检查前端配置
if not exist .env (
  echo 创建前端配置文件...
  echo 创建前端配置文件... >> %LOG_FILE%
  (
    echo REACT_APP_API_BASE_URL=http://localhost:5001
    echo REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key_here
    echo DEEPSEEK_API_KEY=your_deepseek_api_key_here
    echo DEEPSEEK_API_BASE=https://api.deepseek.com
  ) > .env
  echo 已创建前端配置文件，请编辑.env设置您的API密钥
  echo 已创建前端配置文件 >> %LOG_FILE%
)

:: 检查数据库目录
if not exist data (
  echo 创建数据目录...
  mkdir data
  echo 已创建数据目录 >> %LOG_FILE%
)

:: 安装依赖
echo 正在检查依赖...
echo 检查依赖... >> %LOG_FILE%

:: 检查node_modules
if not exist node_modules (
  echo 安装前端依赖...
  echo 安装前端依赖... >> %LOG_FILE%
  call npm install >> %LOG_FILE% 2>&1
  if %ERRORLEVEL% neq 0 (
    echo 错误: 安装前端依赖失败
    echo 错误: 安装前端依赖失败 >> %LOG_FILE%
    goto :error
  )
  echo 前端依赖安装完成
)

:: 检查后端依赖
if exist backend\requirements.txt (
  echo 安装后端依赖...
  echo 安装后端依赖... >> %LOG_FILE%
  cd backend
  pip install -r requirements.txt >> ..\%LOG_FILE% 2>&1
  if %ERRORLEVEL% neq 0 (
    echo 错误: 安装后端依赖失败
    echo 错误: 安装后端依赖失败 >> ..\%LOG_FILE%
    cd ..
    goto :error
  )
  cd ..
  echo 后端依赖安装完成
)

:: 初始化数据库
echo 正在检查数据库...
echo 检查数据库... >> %LOG_FILE%

if not exist data\taijihealth.db (
  echo 初始化数据库...
  echo 初始化数据库... >> %LOG_FILE%
  node -e "const { initDatabase } = require('./server.js'); initDatabase().then(() => console.log('数据库初始化完成')).catch(err => console.error('数据库初始化失败:', err));" >> %LOG_FILE% 2>&1
  if %ERRORLEVEL% neq 0 (
    echo 警告: 数据库初始化可能未完成，将在服务启动时自动初始化
    echo 警告: 数据库初始化可能未完成 >> %LOG_FILE%
  ) else (
    echo 数据库初始化完成
  )
)

:: 启动服务
echo 正在启动服务...
echo 启动服务... >> %LOG_FILE%

:: 启动后端服务（包含信令服务器）
start "太极健康系统-后端服务" cmd /c "node server.js"
echo 后端服务和信令服务器启动中...
echo 后端服务和信令服务器启动中... >> %LOG_FILE%

:: 等待后端服务启动
timeout /t 8 /nobreak > nul

:: 启动前端服务
start "太极健康系统-前端服务" cmd /c "npm start"
echo 前端服务启动中...
echo 前端服务启动中... >> %LOG_FILE%

:: 等待前端服务启动
timeout /t 8 /nobreak > nul

echo.
echo ===== 太极禅道传统健康网站启动完成 =====
echo.
echo 本地访问地址:
echo - 前端界面: http://localhost:3000
echo - 后端API: http://localhost:5001
echo.
echo 如需公网访问，请运行"启动Ngrok服务.bat"
echo.
echo 服务已启动完成 >> %LOG_FILE%
echo.
echo 按任意键退出此窗口（服务将在后台继续运行）...
pause > nul
goto :eof

:error
echo.
echo 启动过程中出现错误，请查看日志文件 %LOG_FILE%
echo.
echo 按任意键退出...
pause > nul