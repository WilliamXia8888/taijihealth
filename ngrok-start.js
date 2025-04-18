/**
 * Ngrok启动脚本
 */
const { startNgrok } = require('./ngrok.config.js');

console.log('正在启动Ngrok服务...');

// 启动Ngrok服务
startNgrok()
  .catch(err => {
    console.error('Ngrok启动失败:', err);
    // 在退出前暂停，让用户能看到错误信息
    console.log('按任意键退出...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
  });