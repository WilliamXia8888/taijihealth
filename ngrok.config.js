/**
 * Ngrok配置 - 提供公网访问服务
 */
const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, 'ngrok.json');

// 默认配置
const DEFAULT_CONFIG = {
  port: process.env.PORT || 3000,
  authtoken: process.env.NGROK_AUTH_TOKEN || '',
  region: 'ap' // 亚太地区，可选值: us, eu, au, ap, sa, jp, in
};

/**
 * 读取配置
 * @returns {Object} Ngrok配置
 */
function getConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error('读取Ngrok配置失败:', error);
  }
  
  return DEFAULT_CONFIG;
}

/**
 * 保存配置
 * @param {Object} config Ngrok配置
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('Ngrok配置已保存');
  } catch (error) {
    console.error('保存Ngrok配置失败:', error);
  }
}

/**
 * 启动Ngrok服务
 */
async function startNgrok() {
  try {
    console.log('开始启动Ngrok服务...');
    console.log('当前工作目录:', process.cwd());
    console.log('脚本路径:', __dirname);
    
    const config = getConfig();
    console.log('加载的配置:', JSON.stringify(config, null, 2));
    
    if (!config.authtoken) {
      console.warn('警告: 未设置Ngrok认证令牌，可能无法正常启动');
      console.warn('请访问 https://dashboard.ngrok.com/get-started/your-authtoken 获取令牌');
      console.warn('然后设置环境变量 NGROK_AUTH_TOKEN 或在 ngrok.json 中配置 authtoken');
      
      // 如果没有认证令牌，尝试从环境变量中获取
      if (process.env.NGROK_AUTH_TOKEN) {
        config.authtoken = process.env.NGROK_AUTH_TOKEN;
        console.log('已从环境变量中获取认证令牌');
      } else if (process.env.DEEPSEEK_API_KEY) {
        // 尝试使用 DEEPSEEK_API_KEY 作为备选
        console.log('尝试使用 DEEPSEEK_API_KEY 作为 Ngrok 认证令牌');
        config.authtoken = process.env.DEEPSEEK_API_KEY;
      }
    }
    
    // 先尝试关闭可能存在的旧连接
    try {
      await ngrok.kill();
      console.log('已关闭可能存在的旧Ngrok连接');
    } catch (e) {
      // 忽略关闭错误
    }
    
    // 检查是否有多端口配置
    if (config.ports && Array.isArray(config.ports) && config.ports.length > 0) {
      console.log('检测到多端口配置，尝试启动多个Ngrok隧道...');
      
      // 等待一段时间，确保本地服务已启动
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 启动多个Ngrok隧道
      for (const portConfig of config.ports) {
        console.log(`正在启动Ngrok，连接到本地端口 ${portConfig.port}(${portConfig.name || '未命名服务'})...`);
        
        const url = await ngrok.connect({
          addr: portConfig.port,
          authtoken: config.authtoken,
          region: config.region,
          onStatusChange: status => {
            console.log(`端口${portConfig.port}状态变更:`, status);
          },
          onLogEvent: log => {
            // 可以记录日志，但不输出以避免过多信息
          }
        });
        
        console.log(`✅ ${portConfig.name || '服务'} 公网访问地址: ${url}`);
      }
    } else {
      // 兼容旧配置，启动单个Ngrok隧道
      console.log(`正在检查本地端口 ${config.port} 是否已启动...`);
      
      // 等待一段时间，确保本地服务已启动
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log(`正在启动Ngrok，连接到本地端口 ${config.port}...`);
      
      // 启动Ngrok
      const url = await ngrok.connect({
        addr: config.port,
        authtoken: config.authtoken,
        region: config.region,
        onStatusChange: status => {
          console.log('Ngrok状态变更:', status);
        },
        onLogEvent: log => {
          console.log('Ngrok日志:', log);
        }
      });
    
      console.log('='.repeat(50));
      console.log(`✅ Ngrok启动成功!`);
      console.log(`🌐 公网访问地址: ${url}`);
      console.log('='.repeat(50));
    }
    
    // 保存当前配置
    saveConfig(config);
    
    // 监听进程退出事件，关闭Ngrok连接
    process.on('SIGINT', async () => {
      console.log('正在关闭Ngrok连接...');
      await ngrok.kill();
      process.exit(0);
    });
    
    // 防止脚本立即退出
    console.log('Ngrok服务已启动，按Ctrl+C退出...');
    // 保持进程运行
    process.stdin.resume();
  } catch (error) {
    console.error('启动Ngrok失败:', error);
    console.error('错误堆栈:', error.stack);
    
    // 提供更详细的错误处理建议
    if (error.code === 'ECONNREFUSED' && error.message.includes('127.0.0.1:4040')) {
      console.error('\n特定错误: 无法连接到Ngrok本地Web界面（端口4040）');
      console.error('可能的解决方案:');
      console.error('1. 确保没有其他Ngrok实例正在运行');
      console.error('2. 检查防火墙设置，确保允许Ngrok访问本地网络');
      console.error('3. 尝试重启电脑后再试');
      console.error('4. 尝试重新安装Ngrok: npm uninstall ngrok && npm install ngrok');
    }
    
    // 在退出前暂停，让用户能看到错误信息
    console.log('按任意键退出...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 1));
  }
}

module.exports = {
  startNgrok,
  getConfig,
  saveConfig
};