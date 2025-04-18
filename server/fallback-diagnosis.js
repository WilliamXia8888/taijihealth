/**
 * 备用诊断服务 - 当DeepSeek API失败时使用
 */

/**
 * 提供基本的症状分析和建议
 * @param {string} symptoms 症状描述
 * @returns {Object} 诊断结果
 */
function basicDiagnosis(symptoms) {
  console.log('使用备用诊断系统处理症状:', symptoms);
  
  // 简单的关键词匹配
  const keywords = {
    '头痛': '您描述的头痛症状可能与压力、疲劳、脱水或紧张性头痛有关。建议充分休息，保持水分摄入，必要时可服用非处方止痛药。如果头痛剧烈、突然发作或伴随其他症状如发热、颈部僵硬，请立即就医。',
    '发热': '发热通常是身体对抗感染的自然反应。建议多休息，多喝水，保持室内通风。如果体温超过38.5°C或持续超过3天，请咨询医生。',
    '咳嗽': '咳嗽可能是由感冒、过敏或其他呼吸道刺激引起的。建议保持室内湿度，多喝温水，避免刺激性食物。如果咳嗽持续超过2周或伴有血痰，请及时就医。',
    '腹痛': '腹痛可能与消化不良、胃肠炎或食物不耐受有关。建议清淡饮食，避免辛辣和油腻食物。如果疼痛剧烈、持续或伴随呕吐，请立即就医。',
    '疲劳': '疲劳可能与生活压力、睡眠不足或饮食不均衡有关。建议保证充足睡眠，均衡饮食，适当运动。如果疲劳持续且影响日常生活，请咨询医生。'
  };
  
  // 检查症状描述中是否包含关键词
  let matchedAdvice = '';
  for (const [keyword, advice] of Object.entries(keywords)) {
    if (symptoms.includes(keyword)) {
      matchedAdvice += advice + '\n\n';
    }
  }
  
  // 如果没有匹配到任何关键词，提供通用建议
  if (!matchedAdvice) {
    matchedAdvice = `基于您描述的症状"${symptoms}"，我们的系统无法提供具体建议。
    
一般性健康建议：
1. 保持充分休息和水分摄入
2. 如果症状持续超过48小时，请咨询医生
3. 如果出现高烧、剧烈疼痛或呼吸困难等严重症状，请立即就医
4. 记录您的症状变化，以便医生更好地了解您的情况

请注意，这只是一般性建议，不能替代专业医疗诊断。`;
  }
  
  return {
    result: matchedAdvice,
    confidence: 0.5, // 较低的置信度
    timestamp: new Date().toISOString(),
    source: 'fallback-system'
  };
}

module.exports = {
  basicDiagnosis
};