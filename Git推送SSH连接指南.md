# Git推送SSH连接指南

## 为什么使用SSH连接

当使用HTTPS连接GitHub时，经常会遇到以下问题：
- 连接超时或不稳定
- 需要频繁输入用户名和密码
- 防火墙或网络限制导致连接失败

SSH连接提供了更稳定、更安全的GitHub访问方式，无需每次输入密码。

## SSH密钥设置步骤

### 1. 生成SSH密钥

1. 打开命令提示符或PowerShell
2. 输入以下命令（替换为你的GitHub邮箱）：
   ```
   ssh-keygen -t rsa -b 4096 -C "你的GitHub邮箱"
   ```
3. 按回车接受默认文件位置（`C:\Users\你的用户名\.ssh\id_rsa`）
4. 可以设置密码短语，也可以直接按回车跳过

### 2. 将SSH公钥添加到GitHub账户

1. 使用记事本打开公钥文件：`C:\Users\你的用户名\.ssh\id_rsa.pub`
2. 复制文件中的全部内容
3. 登录GitHub网站
4. 点击右上角头像，选择`Settings`
5. 在左侧菜单中选择`SSH and GPG keys`
6. 点击`New SSH key`按钮
7. 在`Title`字段输入一个描述（如"我的电脑