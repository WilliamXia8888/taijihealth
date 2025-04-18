@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===== 太极禅道传统健康网站环境检查工具 =====
echo.

:: 设置工作目录
cd /d "%~dp0"

:: 检查Python
echo 正在检查Python环境...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [错误] 未找到Python，请安装Python 3.8或更高版本
  echo 您可以从 https://www.python.org/downloads/ 下载Python
  echo 安装时请勾选"Add Python to PATH"选项
  set ERROR=1
) else (
  for /f "tokens=2" %%a in ('python --version 2^>^&1') do set PYTHON_VERSION=%%a
  echo [成功] 检测到Python版本: %PYTHON_VERSION%
)

:: 检查Node.js
echo 正在检查Node.js环境...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [错误] 未找到Node.js，请安装Node.js 12.0或更高版本
  echo 您可以从 https://nodejs.org/ 下载Node.js
  set ERROR=1
) else (
  for /f "tokens=1" %%a in ('node --version') do set NODE_VERSION=%%a
  echo [成功] 检测到Node.js版本: %NODE_VERSION%
)

:: 检查npm
echo 正在检查npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [错误] 未找到npm，请确保Node.js正确安装
  set ERROR=1
) else (
  for /f "tokens=1" %%a in ('npm --version') do set NPM_VERSION=%%a
  echo [成功] 检测到npm版本: %NPM_VERSION%
)

:: 检查Ngrok（可选）
echo 正在检查Ngrok（可选）...
where ngrok >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [警告] 未找到Ngrok，如需公网访问功能，请安装Ngrok
  echo 您可以从 https://ngrok.com/download 下载Ngrok
) else (
  echo [成功] 检测到Ngrok已安装
)

echo.
if defined ERROR (
  echo ===== 环境检查未通过 =====
  echo 请解决上述问题后再尝试启动服务
) else (
  echo ===== 环境检查通过 =====
  echo 您的环境已满足太极禅道传统健康网站的运行要求
  echo 可以运行"一键启动服务.bat"启动系统
)

echo.
echo 按任意键退出...
pause > nul