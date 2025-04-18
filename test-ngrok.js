/**
 * Ngrok测试脚本
 */
const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');

/**
 * 检查端口是否可用
 * @param {number} port 要检查的端口
 * @returns {Promise<boolean>} 端口是否可用
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '127.0.0.1');
  });
}

/**
 * 查找可用端口
 * @param {number} startPort 起始端口
 * @returns {Promise<number>} 可用端口
 */
async function findAvailablePort(startPort) {
  let port = startPort;
  while (port < startPort + 100) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  throw new Error('无法找到可用端口');
}

async function testNgrok() {
  try {
    console.log('开始测试Ngrok...');
    
    // 尝试读取配置
    let authtoken = '';
    const configPath = path.join(__dirname, 'ngrok.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        authtoken = config.authtoken || '';
      } catch (e) {
        console.error('读取配置失败:', e);
      }
    }
    
    if (!authtoken) {
      console.log('未找到认证令牌，请输入您的Ngrok认证令牌:');
      // 在实际使用时，这里应该有一个输入机制
      // 为了简单起见，我们假设用户会手动编辑这个文件
      authtoken = '请在这里填入您的认证令牌';
    }
    
    // 先关闭可能存在的连接
    await ngrok.kill();
    
    // 查找可用端口
    const port = await findAvailablePort(3000);
    console.log(`找到可用端口: ${port}`);
    
    // 启动一个简单的HTTP服务
    const server = http.createServer((req, res) => {
      // 设置正确的Content-Type和字符编码
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      
      // 返回一个完整的HTML页面，确保正确设置编码
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ngrok测试</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .success { color: green; font-size: 24px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Ngrok测试</h1>
            <p class="success">✅ Ngrok测试成功!</p>
            <p>如果您能看到这个页面，说明Ngrok已经成功连接并正常工作。</p>
            <p>当前时间: ${new Date().toLocaleString('zh-CN')}</p>
            <p>本地端口: ${port}</p>
          </div>
        </body>
        </html>
      `;
      
      res.end(html);
    });
    
    server.listen(port, '127.0.0.1', async () => {
      console.log(`本地测试服务器已启动在端口 ${port}`);
      
      try {
        const url = await ngrok.connect({
          addr: port,
          authtoken: authtoken,
          region: 'ap'
        });
        
        console.log('='.repeat(50));
        console.log(`✅ Ngrok测试成功!`);
        console.log(`🌐 公网访问地址: ${url}`);
        console.log('='.repeat(50));
        console.log('请在浏览器中访问上面的地址测试连接');
        console.log('测试完成后，按Ctrl+C退出');
      } catch (error) {
        console.error('Ngrok连接失败:', error);
        server.close();
      }
    });
    
    // 监听退出
    process.on('SIGINT', async () => {
      console.log('正在关闭服务...');
      server.close();
      await ngrok.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

testNgrok();