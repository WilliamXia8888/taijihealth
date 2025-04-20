/**
 * 移动端访问调试工具
 * 用于检查和修复移动端白屏问题
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 设置日志文件
const logFile = path.join(logDir, 'mobile_debug.txt');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// 记录日志的函数
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

log('===== 移动端访问调试工具启动 =====');
log(`运行环境: ${process.platform}, Node ${process.version}`);

// 检查build目录是否存在
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  log('错误: build目录不存在，请先运行构建命令');
  process.exit(1);
}

// 检查mobile.html文件
const mobileHtmlPath = path.join(buildDir, 'mobile.html');
if (!fs.existsSync(mobileHtmlPath)) {
  log('错误: mobile.html文件不存在');
  process.exit(1);
}

// 读取mobile.html内容并检查资源路径
const mobileHtml = fs.readFileSync(mobileHtmlPath, 'utf8');
log('检查mobile.html资源路径...');

// 检查CSS和JS资源路径
const cssPathMatch = mobileHtml.match(/href=["\'](.*?\.css)["\']/i);
const jsPathMatch = mobileHtml.match(/src=["\'](.*?\.js)["\']/i);

if (cssPathMatch) {
  log(`CSS路径: ${cssPathMatch[1]}`);
  // 检查CSS文件是否存在
  const cssPath = cssPathMatch[1].startsWith('./') 
    ? path.join(buildDir, cssPathMatch[1].substring(2)) 
    : path.join(buildDir, cssPathMatch[1].startsWith('/') ? cssPathMatch[1].substring(1) : cssPathMatch[1]);
  
  if (fs.existsSync(cssPath)) {
    log(`CSS文件存在: ${cssPath}`);
  } else {
    log(`错误: CSS文件不存在: ${cssPath}`);
    log('建议修复: 确保mobile.html中的CSS路径使用相对路径(./)');
  }
} else {
  log('警告: 未找到CSS资源路径');
}

if (jsPathMatch) {
  log(`JS路径: ${jsPathMatch[1]}`);
  // 检查JS文件是否存在
  const jsPath = jsPathMatch[1].startsWith('./') 
    ? path.join(buildDir, jsPathMatch[1].substring(2)) 
    : path.join(buildDir, jsPathMatch[1].startsWith('/') ? jsPathMatch[1].substring(1) : jsPathMatch[1]);
  
  if (fs.existsSync(jsPath)) {
    log(`JS文件存在: ${jsPath}`);
  } else {
    log(`错误: JS文件不存在: ${jsPath}`);
    log('建议修复: 确保mobile.html中的JS路径使用相对路径(./)');
  }
} else {
  log('警告: 未找到JS资源路径');
}

// 检查静态服务是否运行
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

// 检查Ngrok配置
log('检查Ngrok配置...');
const ngrokConfigPath = path.join(__dirname, 'ngrok.json');
if (fs.existsSync(ngrokConfigPath)) {
  try {
    const ngrokConfig = JSON.parse(fs.readFileSync(ngrokConfigPath, 'utf8'));
    log(`Ngrok配置: ${JSON.stringify(ngrokConfig, null, 2)}`);
    
    // 检查端口配置
    if (ngrokConfig.port && ngrokConfig.port !== 5001) {
      log(`警告: Ngrok配置的端口(${ngrokConfig.port})与静态服务端口(5001)不一致`);
      log('建议修复: 将ngrok.json中的port设置为5001');
    } else if (ngrokConfig.ports && Array.isArray(ngrokConfig.ports)) {
      let has5001 = false;
      for (const portConfig of ngrokConfig.ports) {
        if (portConfig.port === 5001) {
          has5001 = true;
          break;
        }
      }
      if (!has5001) {
        log('警告: Ngrok多端口配置中没有包含5001端口');
        log('建议修复: 在ngrok.json的ports数组中添加{"port":5001,"name":"移动优化版前端"}');
      }
    }
  } catch (err) {
    log(`错误: 无法解析Ngrok配置: ${err.message}`);
  }
} else {
  log('警告: ngrok.json配置文件不存在');
}

// 运行检查
checkStaticServer().then(isAvailable => {
  if (!isAvailable) {
    log('警告: 静态文件服务不可用，请确保已启动serve命令');
    log('建议: 运行 "npx serve -s build -l 5001 --single --cors"');
  } else {
    log('静态文件服务检查通过');
  }
  
  log('\n===== 诊断结果 =====');
  log('如果移动端仍然显示白屏，请尝试以下解决方案:');
  log('1. 确保mobile.html中的资源路径使用相对路径(./)而不是绝对路径(/)');
  log('2. 确保静态文件服务正确运行在端口5001上');
  log('3. 确保Ngrok正确转发到端口5001');
  log('4. 在移动设备上清除浏览器缓存后重试');
  log('5. 检查移动设备的网络连接是否稳定');
  log('\n详细诊断日志已保存到: ' + logFile);
  
  logStream.end();
});