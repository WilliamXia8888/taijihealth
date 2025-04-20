/**
 * Ngrok启动脚本 - 移动端优化版
 */
const { startNgrok } = require('./ngrok.config.js');
const fs = require('fs');
const path = require('path');

console.log('正在启动Ngrok服务（移动端优化版）...');

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 设置日志文件
const logFile = path.join(logDir, 'ngrok_log.txt');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// 记录日志的函数
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

log('系统信息：');
log(`- 操作系统: ${process.platform}`);
log(`- Node版本: ${process.version}`);
log(`- 工作目录: ${process.cwd()}`);
log(`- 脚本路径: ${__dirname}`);

// 检查静态文件服务是否可用
const http = require('http');
log('检查静态文件服务是否可用...');

const checkStaticServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5001', (res) => {
      log(`静态文件服务状态码: ${res.statusCode}`);
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    
    req.on('error', (err) => {
      log(`静态文件服务检查失败: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      log('静态文件服务检查超时');
      resolve(false);
    });
  });
};

// 启动Ngrok服务
checkStaticServer()
  .then(isAvailable => {
    if (!isAvailable) {
      log('警告: 静态文件服务似乎不可用，Ngrok可能无法正常工作');
      log('建议: 请确保静态文件服务已在端口5001上启动');
    } else {
      log('静态文件服务检查通过，继续启动Ngrok...');
    }
    
    return startNgrok();
  })
  .catch(err => {
    log(`Ngrok启动失败: ${err.message}`);
    log(`错误详情: ${err.stack || '无堆栈信息'}`);
    
    // 在退出前暂停，让用户能看到错误信息
    console.log('按任意键退出...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
  });

// 处理进程退出
process.on('exit', () => {
  log('Ngrok服务已退出');
  logStream.end();
});

process.on('SIGINT', () => {
  log('接收到中断信号，正在关闭Ngrok服务...');
  process.exit(0);
});