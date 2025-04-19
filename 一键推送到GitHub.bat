@echo off
chcp 65001 > nul
echo 太极健康项目 - GitHub推送助手
echo ============================

:: 设置Git超时参数
echo [1/4] 正在设置Git优化参数...
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 60
git config --global http.postBuffer 524288000

:: 检查凭证助手
echo [2/4] 正在配置凭证管理...
git config --global credential.helper manager

:: 添加所有更改
echo [3/4] 正在添加更改并提交...
git add .
set /p commit_msg=请输入提交信息（默认：更新太极健康项目）: 
if "%commit_msg%"=="" set commit_msg=更新太极健康项目
git commit -m "%commit_msg%"

:: 推送代码
echo [4/4] 正在推送到GitHub...
echo 正在使用优化参数推送，请耐心等待...
git push -u origin master --verbose

echo ============================
if %ERRORLEVEL% EQU 0 (
    echo 推送成功完成！
) else (
    echo 推送过程中出现问题，请查看上方错误信息
    echo 建议尝试使用SSH密钥方式连接，详见Git推送解决方案.md
)

pause