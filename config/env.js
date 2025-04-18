// 服务端环境变量配置
const env = {
  API_BASE: process.env.REACT_APP_API_BASE_URL || 'https://api.deepseek.com',
  API_KEY: process.env.REACT_APP_DEEPSEEK_API_KEY || 'default_key'
};

module.exports = env;