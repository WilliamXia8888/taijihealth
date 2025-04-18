/**
 * 太极健康系统后端服务
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 创建HTTP服务器
const server = http.createServer(app);

// 解析JSON请求体
app.use(express.json());

// 启动信令服务器 - 使用正确的集成方式
const { integrateSignalingServer } = require('./signalServerIntegration');
// 集成信令服务器到当前HTTP服务器实例
integrateSignalingServer(app, server);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../build')));

// API路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 引入两种API实现
const { diagnose } = require('./deepseek-api');

// 引入备用诊断系统
const { basicDiagnosis } = require('./fallback-diagnosis');

// 尝试使用OpenAI SDK实现
// 修改为使用OpenAI SDK调用DeepSeek API
app.post('/api/diagnose', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: '请提供症状描述' });
    }
    
    console.log('收到诊断请求:', symptoms);
    
    // 尝试使用OpenAI SDK
    try {
      console.log('尝试使用OpenAI SDK调用DeepSeek API...');
      const { OpenAI } = require('openai');
      const dotenv = require('dotenv');
      dotenv.config();
      
      const API_KEY = process.env.DEEPSEEK_API_KEY;
      
      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: API_KEY
      });
      
      console.log('发送请求到DeepSeek API...');
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一位经验丰富的医生，擅长根据症状进行初步诊断。请提供专业、谨慎的建议，并在必要时建议就医。" },
          { role: "user", content: `我有以下症状，请帮我进行初步诊断：${symptoms}` }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      console.log('DeepSeek API响应:', JSON.stringify(completion, null, 2));
      
      // 增强的响应处理逻辑
      let result = '';
      if (completion && completion.choices && completion.choices.length > 0) {
        const choice = completion.choices[0];
        if (choice.message && choice.message.content) {
          result = choice.message.content;
        } else if (choice.text) {
          result = choice.text;
        } else {
          console.error('无法从响应中提取内容:', JSON.stringify(choice, null, 2));
          throw new Error('DeepSeek API返回的数据格式不正确');
        }
      } else {
        console.error('DeepSeek API响应格式不正确:', JSON.stringify(completion, null, 2));
        throw new Error('DeepSeek API返回的数据格式不正确');
      }
      
      const diagnosis = {
        result,
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        source: 'openai-sdk'
      };
      
      console.log('诊断结果:', diagnosis);
      res.json(diagnosis);
    } catch (sdkError) {
      console.error('OpenAI SDK调用失败，尝试使用原始方法:', sdkError);
      try {
        // 尝试使用原始方法
        const diagnosis = await diagnose(symptoms);
        console.log('诊断结果:', diagnosis);
        res.json(diagnosis);
      } catch (apiError) {
        console.error('原始API调用也失败，使用备用诊断系统:', apiError);
        // 使用备用诊断系统
        const fallbackDiagnosis = basicDiagnosis(symptoms);
        console.log('备用诊断结果:', fallbackDiagnosis);
        res.json(fallbackDiagnosis);
      }
    }
  } catch (error) {
    console.error('诊断错误:', error);
    
    // 提供更友好的错误信息
    let errorMessage = error.message;
    
    // 根据错误类型提供具体信息
    if (errorMessage.includes('404')) {
      errorMessage = 'DeepSeek API请求的资源不存在，请检查API地址是否正确。根据DeepSeek文档，正确的端点应为/chat/completions。';
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      errorMessage = 'DeepSeek API认证失败，请检查API密钥是否正确。';
    } else if (errorMessage.includes('429')) {
      errorMessage = 'DeepSeek API请求过于频繁，请稍后再试。';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// 处理SPA路由 - 使用Express推荐的方式处理所有路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// 处理其他所有前端路由
// 修复path-to-regexp错误，确保使用有效的URL路径格式
// 注意：不要在路由路径中使用完整URL（如https://），这会导致path-to-regexp解析错误
app.use((req, res, next) => {
  // 排除API路由和静态资源
  if (req.url.startsWith('/api/') || req.url.includes('.')) {
    return next();
  }
  // 检查是否包含完整URL格式，如果有则重定向到根路径
  if (req.url.match(/^https?:\/\//)) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`=== 太极健康系统后端服务已启动 ===`);
  console.log(`服务器运行在: http://localhost:${PORT}`);
  console.log(`API端点: http://localhost:${PORT}/api/health`);
  console.log(`诊断API: http://localhost:${PORT}/api/diagnose`);
  console.log(`信令服务器: http://localhost:5001`);
  console.log('======================================');
});