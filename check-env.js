require('dotenv').config();

console.log('===== 环境变量检查 =====');
console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL || '未设置');
console.log('REACT_APP_DEEPSEEK_API_KEY:', process.env.REACT_APP_DEEPSEEK_API_KEY ? '已设置' : '未设置');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '已设置' : '未设置');
console.log('DEEPSEEK_API_BASE:', process.env.DEEPSEEK_API_BASE || '未设置');
console.log('========================');

// 检查是否有问题
const issues = [];
if (!process.env.REACT_APP_DEEPSEEK_API_KEY) {
  issues.push('REACT_APP_DEEPSEEK_API_KEY 未设置');
}
if (!process.env.DEEPSEEK_API_KEY) {
  issues.push('DEEPSEEK_API_KEY 未设置');
}
if (!process.env.DEEPSEEK_API_BASE) {
  issues.push('DEEPSEEK_API_BASE 未设置');
}

if (issues.length > 0) {
  console.log('发现问题:');
  issues.forEach(issue => console.log('- ' + issue));
  console.log('请修复上述问题后重试');
  process.exit(1);
} else {
  console.log('环境变量检查通过！');
}