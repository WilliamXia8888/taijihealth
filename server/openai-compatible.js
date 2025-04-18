/**
 * 使用OpenAI SDK访问DeepSeek API
 */
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config();

// 获取API密钥和基础URL
const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';

// 创建OpenAI客户端实例
const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: API_BASE
});

// 日志目录
const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * 记录API请求和响应日志
 * @param {string} type 日志类型
 * @param {Object} data 日志数据
 */
function logApiData(type, data) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const logFile = path.join(LOG_DIR, `openai-sdk-${type}-${timestamp}.json`);
  
  try {
    // 移除敏感信息
    const sanitizedData = JSON.parse(JSON.stringify(data));
    if (sanitizedData.headers && sanitizedData.headers.Authorization) {
      sanitizedData.headers.Authorization = 'Bearer [REDACTED]';
    }
    
    fs.writeFileSync(logFile, JSON.stringify(sanitizedData, null, 2));
    console.log(`已记录 ${type} 日志到: ${logFile}`);
  } catch (error) {
    console.error(`记录 ${type} 日志失败:`, error);
  }
}

/**
 * 使用OpenAI SDK调用DeepSeek API进行健康诊断
 * @param {string} symptoms 症状描述
 * @returns {Promise<Object>} 诊断结果
 */
async function diagnoseWithOpenAI(symptoms) {
  try {
    if (!API_KEY) {
      throw new Error('DeepSeek API密钥未设置，请在.env文件中配置DEEPSEEK_API_KEY');
    }
    
    console.log(`正在使用OpenAI SDK调用DeepSeek API进行诊断，症状: ${symptoms.substring(0, 50)}...`);
    
    // 构建请求参数
    const requestParams = {
      model: "deepseek-chat", // 使用DeepSeek-V3模型
      messages: [
        {
          role: "system",
          content: "你是一位经验丰富的医生，擅长根据症状进行初步诊断。请提供专业、谨慎的建议，并在必要时建议就医。"
        },
        {
          role: "user",
          content: `我有以下症状，请帮我进行初步诊断：${symptoms}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    };
    
    // 记录请求数据
    logApiData('request', requestParams);
    
    // 使用OpenAI SDK发送请求
    const response = await openai.chat.completions.create(requestParams);
    
    // 记录响应数据
    logApiData('response', response);
    
    console.log('OpenAI SDK响应数据结构:', Object.keys(response));
    
    // 从响应中提取结果
    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      console.error('无法从响应中提取结果，完整响应:', JSON.stringify(response, null, 2));
      throw new Error('无法从DeepSeek API响应中提取诊断结果');
    }
    
    return {
      result,
      confidence: 0.9,
      timestamp: new Date().toISOString(),
      source: 'openai-sdk'
    };
  } catch (error) {
    console.error('OpenAI SDK调用失败:', error);
    
    // 构建更详细的错误信息
    let errorMessage = 'DeepSeek API诊断失败';
    
    if (error.response) {
      errorMessage += `: ${error.response.status} ${error.response.statusText}`;
      if (error.response.data && error.response.data.error) {
        errorMessage += ` - ${error.response.data.error.message || error.response.data.error}`;
      }
    } else {
      errorMessage += `: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

module.exports = {
  diagnoseWithOpenAI
};