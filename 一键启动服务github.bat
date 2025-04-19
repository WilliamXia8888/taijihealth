@echo off
echo 正在启动太极健康系统服务...
start cmd /k "node server\index.js"
echo 等待后端服务启动...
timeout /t 10
echo 正在启动Ngrok内网穿透...
start cmd /k "node ngrok-start.js"
echo 服务已启动，请查看上方输出的URL
echo 注意：请确保后端服务已成功启动在3001端口
pause