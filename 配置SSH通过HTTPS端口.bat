@echo off
chcp 65001 > nul
echo 配置SSH通过HTTPS端口连接GitHub
echo ============================

echo [1/2] 正在创建SSH配置文件...

if not exist "%USERPROFILE%\.ssh" (
    mkdir "%USERPROFILE%\.ssh"
    echo 已创建.ssh目录
)

echo Host github.com> "%USERPROFILE%\.ssh\config"
echo   Hostname ssh.github.com>> "%USERPROFILE%\.ssh\config"
echo   Port 443>> "%USERPROFILE%\.ssh\config"
echo   User git>> "%USERPROFILE%\.ssh\config"

echo SSH配置文件已创建：%USERPROFILE%\.ssh\config

echo [2/2] 正在测试连接...
echo 注意：首次连接时如果看到警告，请输入"yes"继续

ssh -T git@github.com

echo ============================
if %ERRORLEVEL% EQU 0 (
    echo 连接测试成功！您现在可以使用SSH方式推送代码了
) else (
    echo 连接测试可能遇到问题，请查看上方信息
    echo 如果看到"Hi 用户名! You've successfully authenticated..."，则表示配置成功
)

echo.
echo 是否要更新远程仓库URL为SSH格式？
set /p update_remote=请输入Y/N (默认N): 

if /i "%update_remote%"=="Y" (
    echo.
    echo 正在更新远程仓库URL...
    set /p username=请输入您的GitHub用户名: 
    set /p repo=请输入仓库名 (默认:taijihealth): 
    
    if "%repo%"=="" set repo=taijihealth
    
    git remote set-url origin git@github.com:%username%/%repo%.git
    echo 远程仓库URL已更新为: git@github.com:%username%/%repo%.git
)

echo.
echo 配置完成！现在您可以尝试使用一键推送到GitHub.bat脚本进行代码推送
echo.

pause