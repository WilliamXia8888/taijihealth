@echo off
chcp 65001 > nul
echo ===== 太极健康系统依赖安装工具 =====
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

:: 安装项目依赖
echo 正在安装项目依赖...
call npm install

:: 安装OpenAI SDK
echo 正在安装OpenAI SDK...
call npm install openai@^4.0.0 --save

echo.
echo 依赖安装完成！
echo.
pause