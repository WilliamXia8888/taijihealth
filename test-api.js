/**
 * DeepSeek API 连接测试脚本
 */
const axios = require('axios');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取API密钥和基础URL
const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';

async function testApiConnection() {
  console.log('===== DeepSeek API 连接测试 =====');
  console.log('API基础URL:', API_BASE);
  console.log('API密钥是否设置:', API_KEY ? '是' : '否');
  
  if (!API_KEY) {
    console.error('错误: API密钥未设置，请在.env文件中配置DEEPSEEK_API_KEY');
    process.exit(1);
  }
  
  // 测试不同的API端点
  const endpoints = [
    '/v1/chat/completions',
    '/v1/completions',
    '/v1/models'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n测试端点: ${endpoint}`);
      
      // 对于models端点使用GET请求
      if (endpoint === '/v1/models') {
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        });
        console.log(`✅ 成功! 状态码: ${response.status}`);
        console.log('响应数据:', JSON.stringify(response.data).substring(0, 200) + '...');
      } else {
        // 对于其他端点使用POST请求
        const requestData = {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: "Hello, how are you?"
            }
          ],
          max_tokens: 10
        };
        
        const response = await axios.post(`${API_BASE}${endpoint}`, requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          }
        });
        console.log(`✅ 成功! 状态码: ${response.status}`);
        console.log('响应数据:', JSON.stringify(response.data).substring(0, 200) + '...');
      }
    } catch (error) {
      console.error(`❌ 错误! 端点 ${endpoint} 测试失败:`);
      if (error.response) {
        console.error(`状态码: ${error.response.status}`);
        console.error('错误响应:', JSON.stringify(error.response.data).substring(0, 200) + '...');
      } else {
        console.error(error.message);
      }
    }
  }
  
  console.log('\n===== 测试完成 =====');
}

testApiConnection().catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});