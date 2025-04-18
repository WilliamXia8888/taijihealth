/**
 * API配置文件
 */

// DeepSeek API配置
const DEEPSEEK_API = {
  // 基础URL - 使用环境变量或默认值
  BASE_URL: process.env.REACT_APP_DEEPSEEK_API_BASE || 'https://api.deepseek.com',
  
  // API端点 - 不包含/api前缀
  ENDPOINTS: {
    CHAT_COMPLETIONS: '/v1/chat/completions',
    MODELS: '/v1/models'
  },
  
  // 默认模型
  DEFAULT_MODEL: 'deepseek-chat',
  
  // 默认参数
  DEFAULT_PARAMS: {
    temperature: 0.7,
    max_tokens: 800
  }
};

// 后端API配置
const BACKEND_API = {
  // 基础URL - 使用环境变量或默认值
  BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api',
  
  // API端点
  ENDPOINTS: {
    DIAGNOSE: '/diagnose',
    HEALTH: '/health'
  }
};

// 导出配置
export {
  DEEPSEEK_API,
  BACKEND_API
};

export default {
  DEEPSEEK_API,
  BACKEND_API
};