/**
 * DeepSeek API 集成
 */
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config();

// 获取API密钥和基础URL
const API_KEY = process.env.DEEPSEEK_API_KEY;
// 使用与OpenAI兼容的API基础URL
const API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';

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
  const logFile = path.join(LOG_DIR, `deepseek-api-${type}-${timestamp}.json`);
  
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
 * 调用DeepSeek API进行健康诊断
 * @param {string} symptoms 症状描述
 * @returns {Promise<Object>} 诊断结果
 */
async function diagnose(symptoms) {
  try {
    if (!API_KEY) {
      throw new Error('DeepSeek API密钥未设置，请在.env文件中配置DEEPSEEK_API_KEY');
    }
    
    console.log(`正在调用DeepSeek API进行诊断，症状: ${symptoms.substring(0, 50)}...`);
    console.log(`API基础URL: ${API_BASE}`);
    
    // 构建请求 - 使用与OpenAI兼容的格式
    // 构建请求
    const requestData = {
      model: 'deepseek-chat',
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
    
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    };
    
    // 记录请求数据
    logApiData('request', { url: `${API_BASE}/chat/completions`, data: requestData, headers: requestConfig.headers });
    
    // 修改API请求路径 - 使用正确的端点
    // 根据DeepSeek API文档，正确的端点是 /chat/completions 而不是 /v1/chat/completions
    const apiEndpoint = `${API_BASE}/chat/completions`;
    console.log(`实际请求地址: ${apiEndpoint}`);
    
    // 发送请求
    const response = await axios.post(apiEndpoint, requestData, requestConfig);
    
    // 记录响应数据
    logApiData('response', response.data);
    
    console.log('DeepSeek API响应状态码:', response.status);
    console.log('DeepSeek API响应数据结构:', Object.keys(response.data));
    
    // 处理响应 - 增强的响应格式处理
    console.log('DeepSeek API原始响应:', JSON.stringify(response.data, null, 2));
    
    // 尝试多种可能的响应格式
    let result = '';
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const choice = response.data.choices[0];
      if (choice.message && choice.message.content) {
        // 标准OpenAI格式
        result = choice.message.content;
      } else if (choice.text) {
        // 替代格式1
        result = choice.text;
      } else if (choice.content) {
        // 替代格式2
        result = choice.content;
      } else if (typeof choice === 'string') {
        // 替代格式3
        result = choice;
      }
    } else if (response.data && response.data.response) {
      // 替代格式4
      result = response.data.response;
    } else if (response.data && response.data.output) {
      // 替代格式5
      result = response.data.output;
    } else if (response.data && typeof response.data === 'string') {
      // 替代格式6
      result = response.data;
    }
    
    if (!result) {
      console.error('无法从响应中提取结果，完整响应:', JSON.stringify(response.data, null, 2));
      throw new Error('DeepSeek API返回的数据格式不正确');
    }
    
    return {
      result,
      confidence: 0.9,
      timestamp: new Date().toISOString(),
      source: 'deepseek-api'
    };
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    
    // 构建更详细的错误信息
    let errorMessage = 'DeepSeek API诊断失败';
    
    if (error.response) {
      // 服务器响应了，但状态码不是2xx
      console.error('错误响应状态码:', error.response.status);
      console.error('错误响应头:', JSON.stringify(error.response.headers, null, 2));
      console.error('错误响应数据:', JSON.stringify(error.response.data, null, 2));
      
      errorMessage += `: ${error.response.status} ${error.response.statusText}`;
      if (error.response.data) {
        if (error.response.data.error && error.response.data.error.message) {
          errorMessage += ` - ${error.response.data.error.message}`;
        } else if (error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        } else if (error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        } else if (typeof error.response.data === 'string') {
          errorMessage += ` - ${error.response.data}`;
        }
      }
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error('未收到响应的请求:', error.request);
      errorMessage += ': 无法连接到DeepSeek API服务器，请检查网络连接';
    } else {
      // 请求设置时出错
      console.error('请求设置错误:', error.message);
      errorMessage += `: ${error.message}`;
    }
    
    // 添加备用诊断功能
    try {
      console.log('尝试使用备用诊断方法...');
      return await fallbackDiagnose(symptoms);
    } catch (fallbackError) {
      console.error('备用诊断也失败了:', fallbackError);
      throw new Error(errorMessage);
    }
  }
}

/**
 * 备用诊断方法 - 当DeepSeek API失败时使用
 * @param {string} symptoms 症状描述
 * @returns {Promise<Object>} 诊断结果
 */
async function fallbackDiagnose(symptoms) {
  console.log('使用备用诊断方法处理症状:', symptoms);
  
  // 这里实现一个简单的基于关键词的诊断逻辑
  const result = `基于您描述的症状"${symptoms}"，我们的系统无法连接到高级诊断服务。
  
以下是一些一般性建议：
1. 如果症状轻微，请保持充分休息和水分摄入
2. 如果症状持续超过48小时，请咨询医生
3. 如果出现高烧、剧烈疼痛或呼吸困难等严重症状，请立即就医
4. 记录您的症状变化，以便医生更好地了解您的情况

请注意，这只是一般性建议，不能替代专业医疗诊断。`;

  return {
    result,
    confidence: 0.5, // 较低的置信度
    timestamp: new Date().toISOString(),
    source: 'fallback-system'
  };
}

module.exports = {
  diagnose
};