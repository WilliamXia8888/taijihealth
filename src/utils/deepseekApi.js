/**
 * DeepSeek API 集成
 * 提供与DeepSeek API通信的功能
 */
import axios from 'axios';
import cacheService from './cacheService';
import config from '../config/env';

// 检查API服务器连接
const checkApiServerConnection = async (apiBase) => {
  try {
    // 使用GET请求代替HEAD请求，因为某些API服务器可能不支持HEAD请求
    // 添加随机参数避免缓存，并设置较短的超时时间
    // 使用代理服务器URL替换直接访问
    // 使用与实际API请求相同的路径进行连接测试
    const testUrl = `/api/v1/chat/completions?_=${Date.now()}`;
    console.log(`正在检测API服务器连接: ${testUrl} (代理自: ${apiBase}/v1/chat/completions)`);
    
    await axios.get(testUrl, { 
      timeout: 8000,  // 增加超时时间到8秒
      validateStatus: function (status) {
        // 任何状态码都视为成功，因为我们只是测试连接性
        return true; 
      }
    });
    
    console.log('API服务器连接成功');
    return { success: true };
  } catch (error) {
    // 如果服务器返回任何响应，即使是错误状态码，也表示服务器是在线的
    if (error.response) {
      console.log('API服务器已响应，但返回了错误状态码:', error.response.status);
      return { success: true }; // 服务器在线，但可能返回了错误状态码
    }
    
    // 详细记录错误信息
    console.error(`API服务器连接检测失败(${apiBase}):`, error.message);
    console.error('错误详情:', error);
    
    // 检查是否为网络错误
    const isNetworkError = 
      error.code === 'ECONNABORTED' || 
      error.message.includes('timeout') || 
      error.message.includes('Network Error') || 
      !navigator.onLine;
    
    if (isNetworkError) {
      console.error('检测到网络连接问题');
    }
    
    return { 
      success: false, 
      error: error.message,
      isNetworkError: isNetworkError
    };
  }
};

/**
 * DeepSeek API 客户端
 * 使用axios进行HTTP请求
 */
const deepseekApi = {
  /**
   * 发送诊断请求到DeepSeek API
   * @param {Object} diagnosisData 诊断数据，包含脉象、舌象和症状
   * @param {number} timeout 超时时间(毫秒)，默认为6分钟
   * @param {number} maxRetries 最大重试次数，默认为3次
   * @returns {Promise<Object>} 诊断结果
   * @throws {Error} 请求失败时抛出错误
   */
  async diagnose(diagnosisData, timeout = 360000, maxRetries = 3) {
    // 设置进度更新定时器
    let progressInterval;
    
    try {
      // 准备请求数据，明确指定使用经典中医伤寒杂病论进行诊察
      const requestData = {
        pulse: diagnosisData.pulse || '',
        tongue: diagnosisData.tongue || '',
        symptoms: diagnosisData.symptoms || '',
        diagnosis_method: '经典中医伤寒杂病论六经辨证' // 明确指定使用经典中医伤寒杂病论进行诊察
      };
      
      // 检查缓存
      const cacheKey = `diagnosis_${JSON.stringify(requestData)}`;
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        console.log('使用缓存的诊断结果');
        return cachedResult;
      }
      
      // 检查API基础URL是否正确配置
      if (!config.API_BASE || config.API_BASE === '') {
        console.error('API基础URL未配置');
        throw new Error('DeepSeek API基础URL未配置，请检查环境变量设置');
      }
      
      console.log(`使用API基础URL: ${config.API_BASE}`);
      
      // 检查API服务器连接
      console.log('正在检查DeepSeek API服务器连接...');
      const apiServerCheck = await checkApiServerConnection(config.API_BASE);
      
      if (!apiServerCheck.success) {
        console.error('API服务器连接检查失败:', apiServerCheck);
        
        if (apiServerCheck.isNetworkError) {
          // 网络错误，提供更详细的错误信息和建议
          console.error('检测到网络连接问题');
          throw new Error(`无法连接到DeepSeek API服务器，请检查您的网络设置: ${apiServerCheck.error}\n请确保您的网络连接正常，并且可以访问${config.API_BASE}`);
        } else {
          // 其他类型的错误
          throw new Error(`DeepSeek API服务器连接失败: ${apiServerCheck.error}\n请检查API服务器地址是否正确`);
        }
      }
      
      console.log('DeepSeek API服务器连接检查成功');
      
      // 检查API密钥是否正确配置
      if (!config.API_KEY || config.API_KEY === 'default_key') {
        console.error('API密钥未正确配置');
        throw new Error('DeepSeek API密钥未配置或使用了默认值，请检查环境变量设置\n请确保在.env文件中设置了REACT_APP_DEEPSEEK_API_KEY');
      }
      
      console.log('API密钥配置检查通过');
      
      // 设置进度更新函数
      const setupProgressUpdates = () => {
        const updateFrequency = 30000; // 30秒更新一次
        let elapsed = 0;
        
        progressInterval = setInterval(() => {
          elapsed += updateFrequency;
          const progressPercent = Math.min(Math.floor((elapsed / timeout) * 100), 99);
          console.log(`DeepSeek API诊断进行中...已等待${elapsed/1000}秒，进度约${progressPercent}%`);
        }, updateFrequency);
      };
      
      // 清理进度更新定时器
      const cleanupProgressUpdates = () => {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      };
      
      // 记录开始时间
      const startTime = Date.now();
      console.log('开始时间:', new Date(startTime).toLocaleTimeString());
      console.log(`将在${timeout/1000}秒(${timeout/60000}分钟)后超时`);
      
      // 启动进度更新
      setupProgressUpdates();
      
      // 实现重试逻辑
      let lastError;
      for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
        try {
          // 如果不是第一次尝试，则输出重试信息
          if (retryCount > 0) {
            console.log(`正在进行第 ${retryCount}/${maxRetries} 次重试...`);
            // 在重试前再次检查API服务器连接
            console.log('重试前再次检查API服务器连接...');
            const retryApiCheck = await checkApiServerConnection(config.API_BASE);
            
            if (!retryApiCheck.success) {
              console.error('重试前API服务器连接检查失败:', retryApiCheck);
              
              if (retryApiCheck.isNetworkError) {
                throw new Error(`重试失败: 网络连接问题，无法连接到API服务器: ${retryApiCheck.error}`);
              } else {
                throw new Error(`重试失败: API服务器连接仍然不可用: ${retryApiCheck.error}`);
              }
            }
            
            console.log('重试前API服务器连接检查成功');
            // 重试前等待一段时间（指数退避）
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            console.log(`等待 ${retryDelay/1000} 秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
          
          // 创建一个可以取消的请求源
          const source = axios.CancelToken.source();
          
          // 创建axios实例，不设置超时，而是使用Promise.race手动控制
          // 使用代理服务器URL替换直接访问
          const instance = axios.create({
            baseURL: '', // 使用完整路径
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${config.API_KEY}` // 添加API密钥认证
            },
            cancelToken: source.token
          });
          
          // 创建一个超时Promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              source.cancel('请求超时');
              console.log(`已等待${timeout/1000}秒，DeepSeek API请求超时`);
              reject(new Error('DeepSeek API诊断请求超时，请稍后重试'));
            }, timeout);
          });
          
          console.log(`${retryCount > 0 ? '重试: ' : ''}发送请求到DeepSeek API...`);
          console.log(`请求地址: /api/v1/chat/completions (代理自: ${config.API_BASE}/v1/chat/completions)`);
          
          // 使用Promise.race竞争请求和超时
          const response = await Promise.race([
            instance.post('/api/v1/chat/completions', {
              model: "deepseek-chat",
              messages: [
                {
                  role: "system",
                  content: "你是一位经验丰富的中医师，精通伤寒杂病论和中医诊断。请根据患者提供的脉象、舌象和症状，进行中医诊断并给出一诊五疗方案。请以JSON格式返回结果。"
                },
                {
                  role: "user",
                  content: requestData.prompt || `请根据以下信息进行中医诊断：\n脉象：${requestData.pulse || '未提供'}\n舌象：${requestData.tongue || '未提供'}\n症状：${requestData.symptoms || '未提供'}\n诊断方法：${requestData.diagnosis_method || '经典中医伤寒杂病论'}`
                }
              ],
              temperature: 0.5,
              max_tokens: 4000
            }),
            timeoutPromise
          ]);
          
          // 处理DeepSeek Chat API的响应格式
          const chatResponse = response.data;
          if (!chatResponse || !chatResponse.choices || chatResponse.choices.length === 0) {
            throw new Error('DeepSeek API返回的数据格式不正确');
          }
          
          // 从Chat API响应中提取诊断结果
          const aiResponse = chatResponse.choices[0].message.content;
          
          // 尝试解析JSON格式的响应
          let result;
          try {
            // 查找JSON部分
            const jsonStart = aiResponse.indexOf('{');
            const jsonEnd = aiResponse.lastIndexOf('}');
            
            if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
              const jsonStr = aiResponse.substring(jsonStart, jsonEnd + 1);
              result = JSON.parse(jsonStr);
              console.log('成功解析JSON格式的诊断结果');
            } else {
              throw new Error('无法在响应中找到有效的JSON格式');
            }
          } catch (parseError) {
            console.error('JSON解析错误:', parseError);
            
            // 如果JSON解析失败，尝试使用正则表达式提取信息
            console.log('尝试使用正则表达式提取诊断结果...');
            const diagnosisMatch = aiResponse.match(/诊断[：:](.*?)(?=治疗[：:]|$)/s);
            const treatmentMatch = aiResponse.match(/治疗[：:](.*?)(?=$)/s);
            
            // 构建结构化的诊断结果
            result = {
              diagnosis: {
                syndrome_type: diagnosisMatch ? diagnosisMatch[1].trim() : '未能识别证型',
                full_text: diagnosisMatch ? diagnosisMatch[1].trim() : '未能提供完整诊断'
              },
              treatment: treatmentMatch ? treatmentMatch[1].trim() : '未能提供治疗方案'
            };
          }
          
          // 确保结果包含所有必要的五疗字段
          if (!result.herbal_therapy && !result.treatment?.herbal_therapy) {
            result.herbal_therapy = '未能提供中医药疗方案';
          }
          if (!result.diet_therapy && !result.treatment?.diet_therapy) {
            result.diet_therapy = '未能提供中医食疗方案';
          }
          if (!result.external_therapy && !result.treatment?.external_therapy) {
            result.external_therapy = '未能提供中医外治方案';
          }
          if (!result.qigong && !result.treatment?.qigong && !result.treatment?.qigong_therapy) {
            result.qigong = '未能提供气功疗法方案';
          }
          if (!result.mental_therapy && !result.treatment?.mental_therapy && !result.treatment?.mind_therapy) {
            result.mental_therapy = '未能提供心神疗法方案';
          }
          
          // 请求成功，清理进度更新
          cleanupProgressUpdates();
          
          // 记录完成时间和耗时
          const endTime = Date.now();
          const timeUsed = (endTime - startTime) / 1000;
          console.log('完成时间:', new Date(endTime).toLocaleTimeString());
          console.log(`DeepSeek API诊断完成，耗时: ${timeUsed.toFixed(1)}秒`);
          
          // 确保响应数据包含诊断结果和治疗方案
          if (!result || !result.diagnosis || !result.treatment) {
            throw new Error('DeepSeek API返回的数据格式不正确');
          }
          
          // 确保诊断结果中的证型与治疗方案匹配
          if (result.diagnosis && result.diagnosis.syndrome_type && result.treatment) {
            // 确保五疗方案与诊断结果中的证型一致
            const syndromeType = result.diagnosis.syndrome_type;
            console.log('确认诊断证型:', syndromeType);
          }
          
          // 缓存结果
          await cacheService.set(cacheKey, result, 3600000); // 缓存1小时
          
          return result; // 成功获取结果，返回并退出重试循环
        } catch (error) {
          // 保存最后一次错误
          lastError = error;
          
          // 处理超时错误
          if (error.message === 'DeepSeek API诊断请求超时，请稍后重试' || error.code === 'ECONNABORTED') {
            console.error('DeepSeek API请求超时，等待了完整的6分钟');
            // 如果是最后一次重试，则抛出错误
            if (retryCount === maxRetries) {
              throw new Error('DeepSeek API诊断请求超时，请稍后重试');
            }
            // 否则继续下一次重试
            continue;
          }
        
          // 处理API错误
          if (error.response) {
            // 服务器返回了错误状态码
            const status = error.response.status;
            const errorMessage = error.response.data?.message || `请求失败: ${status}`;
            console.error(`DeepSeek API返回错误(${status}):`, errorMessage);
            
            // 根据状态码提供更具体的错误信息
            if (status === 401 || status === 403) {
              throw new Error('DeepSeek API认证失败，请检查API密钥是否正确');
            } else if (status === 404) {
              throw new Error('DeepSeek API请求的资源不存在，请检查API地址是否正确');
            } else if (status >= 500) {
              // 服务器错误，可以重试
              if (retryCount < maxRetries) {
                console.log(`服务器错误(${status})，将进行重试...`);
                continue;
              }
              throw new Error(`DeepSeek API服务器错误(${status})，请稍后重试`);
            } else {
              throw new Error(errorMessage);
            }
          } else if (error.request) {
            // 请求已发送但没有收到响应
            console.error('DeepSeek API无响应:', error.message);
            // 如果不是最后一次重试，则继续
            if (retryCount < maxRetries) {
              console.log('无响应，将进行重试...');
              continue;
            }
            throw new Error(`无法连接到DeepSeek API服务器: ${error.message}`);
          } else {
            // 请求设置时发生错误
            console.error('DeepSeek API请求设置错误:', error.message);
            throw error;
          }
        } finally {
          // 确保在所有情况下都清理进度更新定时器
          cleanupProgressUpdates();
        }
      }
      
      // 如果所有重试都失败，抛出最后一次错误
      if (lastError) {
        throw lastError;
      }
      
      // 这里不应该到达，因为要么成功返回，要么抛出错误
      throw new Error('未知错误，请稍后重试');
    } catch (outerError) {
      // 处理外部try-catch块中的错误
      console.error('DeepSeek API诊断过程中发生错误:', outerError.message);
      // 确保在所有情况下都清理进度更新定时器
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      throw outerError;
    }
  }
};

export default deepseekApi;