# Git推送死机问题解决方案

在执行`git push -u origin master`命令时出现死机问题，通常是由以下几个原因导致的：

## 常见原因

1. **网络连接问题**：GitHub服务器连接不稳定或超时
2. **代理设置不正确**：如果使用代理上网，可能导致连接问题
3. **GitHub认证问题**：每次输入用户名密码可能导致卡死
4. **大文件传输**：如果仓库中有大文件，可能导致传输卡住

## 解决方案

### 1. 使用批处理脚本设置超时参数

创建一个名为`git-push-fix.bat`的文件，内容如下：

```batch
@echo off
echo 正在设置Git超时参数...

:: 设置Git超时参数
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 60
git config --global http.postBuffer 524288000

:: 执行推送命令
echo 正在推送代码到GitHub...
git push -u origin master --verbose

echo 操作完成
pause
```

将此文件保存到项目根目录，双击运行即可。

### 2. 使用SSH密钥代替HTTPS

1. 生成SSH密钥：
   ```
   ssh-keygen -t rsa -b 4096 -C "你的GitHub邮箱"
   ```

2. 将公钥添加到GitHub：
   - 复制`C:\Users\你的用户名\.ssh\id_rsa.pub`文件内容
   - 登录GitHub，进入Settings -> SSH and GPG keys -> New SSH key
   - 粘贴公钥内容并保存

3. 修改远程仓库URL为SSH格式：
   ```
   git remote set-url origin git@github.com:你的用户名/taijihealth.git
   ```

4. 尝试推送：
   ```
   git push -u origin master
   ```

### 3. 使用Git凭证管理器

1. 安装Git凭证管理器（Windows通常已默认安装）：
   ```
   git config --global credential.helper manager
   ```

2. 设置凭证缓存时间（单位：秒，例如设置为1小时）：
   ```
   git config --global credential.helper 'cache --timeout=3600'
   ```

3. 尝试推送，输入一次凭证后应该会被缓存：
   ```
   git push -u origin master
   ```

### 4. 检查并优化代理设置

如果你使用代理上网，确保代理设置正确：

```
git config --global http.proxy http://代理服务器地址:端口号
git config --global https.proxy http://代理服务器地址:端口号
```

如果不需要代理，可以移除代理设置：

```
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 5. 分批推送（适用于大型仓库）

如果仓库很大，可以尝试分批推送：

```batch
@echo off
echo 正在分批推送代码...

:: 先推送主分支结构
git push -u origin master --no-verify --force-with-lease

echo 推送完成
pause
```

## 创建一键推送脚本

为了简化操作，创建一个名为`一键推送到GitHub.bat`的文件，内容如下：

```batch
@echo off
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
git push -u origin master --verbose

echo ============================
echo 操作已完成！
pause
```

## 其他建议

1. **确保网络稳定**：使用稳定的网络连接，避免使用公共WiFi
2. **检查文件大小**：确保没有超过GitHub限制的大文件（通常为100MB）
3. **使用Git LFS**：如果需要管理大文件，考虑使用Git Large File Storage
4. **定期提交**：避免一次性提交大量更改

如果以上方法仍无法解决问题，可以尝试使用GitHub Desktop等图形界面工具进行代码推送。