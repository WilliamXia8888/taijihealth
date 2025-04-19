@echo off
chcp 65001 > nul
echo 太极健康项目 - Git推送修复工具
echo ============================

:: 设置Git网络优化参数
echo [1/3] 正在设置Git网络优化参数...
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 60
git config --global http.postBuffer 524288000
git config --global core.compression 9
git config --global http.maxRequestBuffer 100M

:: 检查是否需要设置或清除代理
set /p proxy_choice=是否需要设置代理？(Y/N，默认N): 
if /i "%proxy_choice%"=="Y" (
    set /p proxy_addr=请输入代理地址和端口(格式如 127.0.0.1:7890): 
    git config --global http.proxy http://%proxy_addr%
    git config --global https.proxy http://%proxy_addr%
    echo 已设置代理: %proxy_addr%
) else (
    git config --global --unset http.proxy
    git config --global --unset https.proxy
    echo 已清除所有代理设置
)

:: 设置凭证缓存
echo [2/3] 正在配置凭证管理...
git config --global credential.helper manager

:: 执行推送
echo [3/3] 正在推送到GitHub...
echo 正在使用优化参数推送，请耐心等待...
echo 如果长时间无响应，请按Ctrl+C中断，然后尝试使用SSH方式连接

:: 设置超时环境变量
set GIT_TRACE=1
set GIT_CURL_VERBOSE=1

:: 执行推送命令
git push -u origin master --verbose

echo ============================
if %ERRORLEVEL% EQU 0 (
    echo 推送成功完成！
) else (
    echo 推送过程中出现问题，请查看上方错误信息
    echo 建议尝试使用SSH密钥方式连接，详见Git推送解决方案.md
)

pause