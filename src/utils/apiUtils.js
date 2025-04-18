/**
 * API工具函数
 * 提供API调用相关的辅助函数
 */

/**
 * 创建一个节流函数，限制函数调用频率
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间限制(毫秒)
 * @returns {Function} 节流后的函数
 */
export const createThrottledFunction = (func, limit = 1000) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
};

/**
 * 带缓存的API调用函数
 * @param {Function} apiCall API调用函数
 * @param {string} cacheKey 缓存键
 * @param {number} cacheTime 缓存时间(毫秒)
 * @returns {Promise<any>} API调用结果
 */
export const cachedApiCall = async (apiCall, cacheKey, cacheTime = 60000) => {
  // 检查缓存
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    // 检查缓存是否过期
    if (Date.now() - timestamp < cacheTime) {
      return data;
    }
  }

  // 缓存不存在或已过期，调用API
  const result = await apiCall();
  
  // 存储到缓存
  localStorage.setItem(cacheKey, JSON.stringify({
    data: result,
    timestamp: Date.now()
  }));
  
  return result;
};

/**
 * 带重试机制的API调用函数
 * @param {Function} apiCall API调用函数
 * @param {number} maxRetries 最大重试次数
 * @param {number} retryDelay 重试延迟(毫秒)
 * @returns {Promise<any>} API调用结果
 */
export const apiCallWithRetry = async (apiCall, maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      console.log(`API调用失败，尝试重试 ${i + 1}/${maxRetries}`);
      lastError = error;
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // 每次重试增加延迟时间
      retryDelay *= 1.5;
    }
  }
  
  // 所有重试都失败了，抛出最后一个错误
  throw lastError;
};

// 导入六经辨证数据和诊断函数
import { diagnoseWithSixMeridian, getSixMeridianDetail } from './sixMeridianData';

// 模拟诊断API调用
export const simulateDiagnosisApi = async (formData) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 分析输入的症状，判断可能存在的问题
  const symptoms = formData.symptoms?.toLowerCase() || '';
  const pulse = formData.pulse?.toLowerCase() || '';
  const tongue = formData.tongue?.toLowerCase() || '';
  
  // 使用六经辨证进行诊断
  const sixMeridianResults = diagnoseWithSixMeridian({
    symptoms,
    pulse,
    tongue
  });
  
  // 获取六经辨证的详细信息
  let sixMeridianDiagnosis = [];
  let primaryMeridian = null;
  let primaryType = null;
  let primarySyndromeType = "";
  let primaryEtiology = "";
  let primaryTreatment = "";
  
  if (sixMeridianResults.length > 0) {
    // 获取匹配度最高的六经证候
    primaryMeridian = sixMeridianResults[0].meridian;
    primaryType = sixMeridianResults[0].type;
    
    // 获取主要证候的详细信息
    const primaryDetail = getSixMeridianDetail(primaryMeridian, primaryType);
    if (primaryDetail) {
      primarySyndromeType = primaryDetail.name + (primaryType === 'cold' ? '寒化证' : primaryType === 'heat' ? '热化证' : '');
      primaryEtiology = primaryDetail.pathogenesis;
      primaryTreatment = Array.isArray(primaryDetail.treatment_principles) 
        ? primaryDetail.treatment_principles.join('、')
        : (primaryDetail.current_treatment ? primaryDetail.current_treatment.join('、') : '');
    }
    
    // 将六经辨证结果添加到诊断中
    sixMeridianResults.forEach(result => {
      if (result.matchRate >= 0.1) { // 只添加匹配度较高的结果
        sixMeridianDiagnosis.push({
          name: result.name,
          match_rate: (result.matchRate * 100).toFixed(1) + '%',
          description: result.description,
          symptoms: result.symptoms,
          treatment: result.treatment
        });
      }
    });
  }
  
  // 传统的脏腑辨证（作为补充）
  const hasLiverIssues = symptoms.includes('烦躁') || symptoms.includes('胁痛') || 
                        pulse.includes('弦') || tongue.includes('偏红');
  const hasHeartIssues = symptoms.includes('心悸') || symptoms.includes('失眠') || 
                        pulse.includes('数') || tongue.includes('红尖');
  const hasSplenIssues = symptoms.includes('食欲不振') || symptoms.includes('腹胀') || 
                        pulse.includes('缓') || tongue.includes('胖');
  const hasLungIssues = symptoms.includes('咳嗽') || symptoms.includes('气短') || 
                        pulse.includes('浮') || tongue.includes('白苔');
  const hasKidneyIssues = symptoms.includes('腰痛') || symptoms.includes('耳鸣') || 
                          pulse.includes('沉') || tongue.includes('淡');
  
  // 初始化诊断结果
  const result = {
    diagnosis: {
      tcm_analysis: "根据您提供的脉象、舌象和症状描述，结合经典中医伤寒杂病论六经辨证理论进行分析。" + 
        (primarySyndromeType ? `辨证为${primarySyndromeType}。` : ""),
      etiology_pathogenesis: primaryEtiology || "病机尚不明确，需进一步诊察。",
      syndrome_type: primarySyndromeType || "未能明确辨别证型",
      details: [],
      six_meridian_diagnosis: sixMeridianDiagnosis
    },
    herbal_therapy: {
      prescription_name: "逍遥散合八珍汤",
      composition: "当归10g，白芍10g，柴胡6g，白术10g，茯苓10g，薄荷3g，炙甘草6g，人参10g，熟地黄15g，川芎6g，炒白术12g",
      efficacy_analysis: "疏肝解郁，健脾养血，益气养阴。",
      usage_dosage: "水煎服，每日1剂，早晚分服。",
      precautions: "忌食辛辣刺激、油腻食物，避免情绪波动。",
      formula: ""
    },
    diet_therapy: {
      principle: "饮食宜清淡易消化，避免辛辣刺激、油腻食物，增加富含优质蛋白和维生素的食物。",
      recommended_ingredients: [
        {
          name: "山药",
          property: "甘平",
          effect: "补脾养胃，益肺固肾"
        },
        {
          name: "红枣",
          property: "甘温",
          effect: "补中益气，养血安神"
        },
        {
          name: "枸杞",
          property: "甘平",
          effect: "滋肾养肝，明目"
        },
        {
          name: "黑豆",
          property: "甘平",
          effect: "补肾益精"
        }
      ]
    },
    // 新增中医外治疗法
    external_therapy: {
      principle: "通过外部治疗手段，调节经络气血，平衡阴阳，促进自愈能力。",
      methods: [
        {
          name: "艾灸",
          description: "通过艾条燃烧产生的热力和药力作用于穴位，温经散寒，行气活血。",
          applicable_conditions: "适用于寒证、虚证、气滞血瘀等。",
          operation_method: "选取适宜穴位，距离皮肤2-3厘米，灸至局部皮肤潮红为度。",
          frequency: "每日或隔日1次，每次15-30分钟。",
          precautions: "孕妇、过敏体质者慎用，避开面部和皮肤破损处。"
        },
        {
          name: "刮痧",
          description: "用刮痧板蘸取适量介质，在体表特定部位进行刮拭，促进血液循环，排出体内毒素。",
          applicable_conditions: "适用于风寒感冒、肌肉酸痛、消化不良等。",
          operation_method: "沿背部、颈部或肢体经络方向，以中等力度单向刮拭至皮肤出现痧痕。",
          frequency: "视病情而定，一般3-7天一次。",
          precautions: "出血性疾病患者禁用，刮拭后避免受风受凉。"
        },
        {
          name: "拔罐",
          description: "利用负压原理将罐具吸附于体表特定部位，促进局部血液循环，疏通经络。",
          applicable_conditions: "适用于风寒湿邪、肌肉疼痛、气滞血瘀等。",
          operation_method: "选取适宜穴位或部位，留罐5-15分钟，可结合走罐或闪罐。",
          frequency: "一般3-7天一次。",
          precautions: "皮肤破损处、肿瘤部位禁用，拔罐后24小时内避免沐浴。"
        },
        {
          name: "推拿按摩",
          description: "通过手法作用于体表穴位和经络，调整脏腑功能，平衡阴阳气血。",
          applicable_conditions: "适用于颈肩腰腿痛、失眠、消化不良等多种症状。",
          operation_method: "根据不同部位和症状选择适当手法，如推、拿、按、摩、揉等。",
          frequency: "可每日或隔日进行，每次15-30分钟。",
          precautions: "骨折、严重骨质疏松、急性炎症期禁用。"
        }
      ]
    },
    // 新增气功疗法
    qigong: {
      principle: "通过呼吸调节、身体姿势和意念导引，调整气血运行，平衡阴阳，增强自愈能力。",
      methods: [
        {
          name: "八段锦",
          description: "一套由八个动作组成的传统健身气功，可全面锻炼身体各部位。",
          key_movements: "双手托天理三焦、左右开弓似射雕、调理脾胃须单举、五劳七伤往后瞧等八个动作。",
          breathing_method: "配合自然呼吸，动作舒展时吸气，收束时呼气。",
          practice_frequency: "每日晨起或睡前练习，每次15-30分钟。",
          health_benefits: "增强脏腑功能，疏通经络，提高免疫力，改善睡眠。"
        },
        {
          name: "五禽戏",
          description: "模仿虎、鹿、熊、猿、鸟五种动物的动作，结合呼吸和意念的健身功法。",
          key_movements: "虎戏（增强腰背力量）、鹿戏（增强颈部力量）、熊戏（增强脾胃功能）、猿戏（增强心肺功能）、鸟戏（增强肾功能）。",
          breathing_method: "自然呼吸与动作协调，意念集中。",
          practice_frequency: "每日练习1-2次，每次20-40分钟。",
          health_benefits: "增强体质，调节脏腑功能，延缓衰老，预防疾病。"
        },
        {
          name: "六字诀",
          description: "通过发出'嘘、呵、呼、呬、吹、嘻'六种不同的音，配合特定姿势，调节对应脏腑功能。",
          key_movements: "嘘（肝）、呵（心）、呼（脾）、呬（肺）、吹（肾）、嘻（三焦）。",
          breathing_method: "深吸气后，缓慢呼气并发出对应音，意念导引气息至相应脏腑。",
          practice_frequency: "每日晨起或睡前练习，每字3-6次，全套15-30分钟。",
          health_benefits: "调节脏腑功能，平衡阴阳，增强气血运行。"
        },
        {
          name: "站桩功",
          description: "保持特定姿势不动，通过调整呼吸和意念，达到强身健体的目的。",
          key_movements: "抱球式、三圈式、混元式等不同桩法。",
          breathing_method: "自然腹式呼吸，意守丹田。",
          practice_frequency: "初学者每次5-10分钟，逐渐增加至30-60分钟，每日1-2次。",
          health_benefits: "增强体质，调节神经系统，提高免疫力，延缓衰老。"
        }
      ]
    },
    // 新增心神疗法
    mental_therapy: {
      principle: "通过调节情志，平衡心神，达到身心和谐，增强自愈能力。",
      methods: [
        {
          name: "情志调理",
          description: "根据中医'七情'理论，调节喜、怒、忧、思、悲、恐、惊等情绪，保持心态平和。",
          specific_techniques: "学会情绪觉察，避免情绪过激；培养积极心态，保持心情舒畅；适当宣泄负面情绪，不压抑不放纵。",
          application_scenarios: "情绪波动、压力过大、心理不适等情况。",
          expected_benefits: "改善情绪状态，减轻心理压力，预防情志所伤。"
        },
        {
          name: "中医冥想",
          description: "结合传统导引术和现代冥想技术，通过调整呼吸和意念，达到宁心静神的效果。",
          specific_techniques: "盘坐或靠坐，保持脊柱挺直；调整呼吸，缓慢均匀；意守丹田或特定穴位；排除杂念，保持觉知。",
          practice_frequency: "每日晨起或睡前练习，每次15-30分钟。",
          expected_benefits: "安神定志，改善睡眠，减轻焦虑，提高注意力。"
        },
        {
          name: "生活起居调理",
          description: "根据中医养生理论，调整日常生活习惯，顺应自然规律，保持身心健康。",
          specific_suggestions: "早睡早起，顺应阴阳变化；饮食有节，不暴饮暴食；起居有常，避免过度劳累；适当运动，增强体质；保持良好心态，乐观豁达。",
          application_principles: "根据个人体质、季节变化和环境因素灵活调整。",
          expected_benefits: "增强适应能力，提高生活质量，预防疾病发生。"
        },
        {
          name: "音乐疗法",
          description: "利用不同音乐的特性，调节情绪，平衡阴阳，达到治疗效果。",
          specific_techniques: "选择适合个人体质和情绪状态的音乐；安静环境中专注聆听；可配合呼吸调节或简单冥想；保持放松状态，不要刻意分析音乐。",
          recommended_music: "古琴、古筝等传统乐器音乐；自然声音如流水、鸟鸣；节奏平稳、旋律优美的轻音乐。",
          expected_benefits: "舒缓情绪，改善睡眠，减轻焦虑，增强心理韧性。"
        }
      ]
    },
    treatment: {
      principle: "",
      methods: [],
      diet_therapy: {
        recommended_ingredients: []
      },
      herbal_therapy: {
        formula: ""
      },
      acupuncture: {
        principle: "",
        points: []
      },
      external_treatment: [],
      qigong_exercise: [],
      suitable_exercises: []
    }
  };
  
  // 根据六经辨证结果更新诊断详情和治疗方案
  if (primaryMeridian && primarySyndromeType) {
    // 添加六经辨证结果到诊断详情
    result.diagnosis.details.push(primarySyndromeType);
    
    // 更新治疗原则
    result.treatment.principle = primaryTreatment || '调和阴阳，平衡气血';
    
    // 根据六经辨证结果推荐方剂和治疗方法
    const meridianDetail = getSixMeridianDetail(primaryMeridian, primaryType);
    if (meridianDetail && meridianDetail.classic_formulas && meridianDetail.classic_formulas.length > 0) {
      // 选择最适合的方剂
      const formula = meridianDetail.classic_formulas[0];
      result.treatment.herbal_therapy.formula = formula.name;
      result.herbal_therapy.prescription_name = formula.name;
      result.herbal_therapy.efficacy_analysis = formula.indication;
    }
    
    // 根据不同六经证候推荐不同的治疗方法
    switch(primaryMeridian) {
      case 'taiyang':
        // 太阳病治疗方法
        result.treatment.methods.push('保持适当发汗，避免风寒侵袭');
        result.treatment.diet_therapy.recommended_ingredients.push(
          { name: '生姜', property: '辛温', effect: '发汗解表' },
          { name: '葱白', property: '辛温', effect: '发汗解表' }
        );
        result.treatment.acupuncture.points.push('大椎', '风门', '合谷');
        result.treatment.qigong_exercise.push({ name: '八段锦', description: '舒展经络，调畅气血' });
        break;
      
      case 'yangming':
        // 阳明病治疗方法
        result.treatment.methods.push('清热泻火，通腑泄热');
        result.treatment.diet_therapy.recommended_ingredients.push(
          { name: '绿豆', property: '甘寒', effect: '清热解毒' },
          { name: '西瓜', property: '甘寒', effect: '清热生津' }
        );
        result.treatment.acupuncture.points.push('曲池', '足三里', '内庭');
        result.treatment.qigong_exercise.push({ name: '六字诀', description: '清泻阳明之热' });
        break;
      
      case 'shaoyang':
        // 少阳病治疗方法
        result.treatment.methods.push('和解少阳，疏肝利胆');
        result.treatment.diet_therapy.recommended_ingredients.push(
          { name: '薄荷', property: '辛凉', effect: '疏肝解郁' },
          { name: '柴胡', property: '苦平', effect: '和解少阳' }
        );
        result.treatment.acupuncture.points.push('阳陵泉', '外关', '支沟');
        result.treatment.qigong_exercise.push({ name: '五禽戏', description: '调和肝胆，疏通气机' });
        break;
      
      case 'taiyin':
        // 太阴病治疗方法
        result.treatment.methods.push('温中健脾，祛寒化湿');
        result.treatment.diet_therapy.recommended_ingredients.push(
          { name: '山药', property: '甘平', effect: '健脾益胃' },
          { name: '大枣', property: '甘温', effect: '补中益气' }
        );
        result.treatment.acupuncture.points.push('足三里', '脾俞', '中脘');
        result.treatment.qigong_exercise.push({ name: '六字诀', description: '调理脾胃，增强消化功能' });
        break;
      
      case 'shaoyin':
        if (primaryType === 'cold') {
          // 少阴寒化证治疗方法
          result.treatment.methods.push('温补肾阳，回阳救逆');
          result.treatment.diet_therapy.recommended_ingredients.push(
            { name: '肉桂', property: '辛热', effect: '温补肾阳' },
            { name: '附子', property: '辛热', effect: '回阳救逆' }
          );
          result.treatment.acupuncture.points.push('关元', '命门', '肾俞');
          result.treatment.qigong_exercise.push({ name: '肾脏保健功', description: '温补肾阳，增强肾功能' });
        } else {
          // 少阴热化证治疗方法
          result.treatment.methods.push('滋养肾阴，清热降火');
          result.treatment.diet_therapy.recommended_ingredients.push(
            { name: '黑芝麻', property: '甘平', effect: '滋养肾阴' },
            { name: '银耳', property: '甘淡', effect: '滋阴润肺' }
          );
          result.treatment.acupuncture.points.push('太溪', '照海', '复溜');
          result.treatment.qigong_exercise.push({ name: '八段锦', description: '滋养肾阴，平衡阴阳' });
        }
        break;
      
      case 'jueyin':
        // 厥阴病治疗方法
        result.treatment.methods.push('调和肝胃，温中散寒');
        result.treatment.diet_therapy.recommended_ingredients.push(
          { name: '乌梅', property: '酸平', effect: '敛肝和胃' },
          { name: '生姜', property: '辛温', effect: '温中散寒' }
        );
        result.treatment.acupuncture.points.push('太冲', '内关', '中脘');
        result.treatment.qigong_exercise.push({ name: '五禽戏', description: '调和肝胃，平衡阴阳' });
        break;
      
      default:
        // 默认治疗方法
        result.treatment.methods.push('调和阴阳，平衡气血');
        break;
    }
  } else {
    // 如果六经辨证结果不明确，使用传统脏腑辨证作为补充
    if (hasLiverIssues) {
      result.diagnosis.details.push('肝气郁结，气机不畅');
      result.treatment.principle = '疏肝解郁，调畅气机';
      result.treatment.methods.push('保持情绪稳定，避免过度紧张和压力');
      result.treatment.diet_therapy.recommended_ingredients.push(
        { name: '柑橘', property: '甘温', effect: '理气健脾' },
        { name: '薄荷', property: '辛凉', effect: '疏肝解郁' }
      );
      result.treatment.herbal_therapy.formula = '柴胡疏肝散';
      result.treatment.acupuncture.points.push('太冲穴', '阳陵泉');
      result.treatment.qigong_exercise.push({ name: '八段锦', description: '舒展肝经，调畅气机' });
    }
    
    if (hasHeartIssues) {
      result.diagnosis.details.push('心火上炎，神志不宁');
      result.treatment.principle += result.treatment.principle ? '，清心泻火' : '清心泻火';
      result.treatment.methods.push('保持充足睡眠，避免过度劳累');
      result.treatment.diet_therapy.recommended_ingredients.push(
        { name: '莲子', property: '甘平', effect: '养心安神' },
        { name: '百合', property: '甘寒', effect: '清心润肺' }
      );
      result.treatment.herbal_therapy.formula += result.treatment.herbal_therapy.formula ? '，黄连温胆汤' : '黄连温胆汤';
      result.treatment.acupuncture.points.push('神门穴', '内关穴');
      result.treatment.qigong_exercise.push({ name: '五禽戏', description: '调节心神，平衡阴阳' });
    }
    
    if (hasSplenIssues) {
      result.diagnosis.details.push('脾胃虚弱，运化不足');
      result.treatment.principle += result.treatment.principle ? '，健脾益气' : '健脾益气';
      result.treatment.methods.push('规律饮食，避免生冷食物');
      result.treatment.diet_therapy.recommended_ingredients.push(
        { name: '山药', property: '甘平', effect: '健脾益胃' },
        { name: '大枣', property: '甘温', effect: '补中益气' }
      );
      result.treatment.herbal_therapy.formula += result.treatment.herbal_therapy.formula ? '，四君子汤' : '四君子汤';
      result.treatment.acupuncture.points.push('足三里', '脾俞');
      result.treatment.qigong_exercise.push({ name: '六字诀', description: '调理脾胃，增强消化功能' });
    }
    
    if (hasLungIssues) {
      result.diagnosis.details.push('肺气不足，宣降失调');
      result.treatment.principle += result.treatment.principle ? '，宣肺化痰' : '宣肺化痰';
      result.treatment.methods.push('保持室内空气流通，避免烟尘刺激');
      result.treatment.diet_therapy.recommended_ingredients.push(
        { name: '梨', property: '甘凉', effect: '润肺止咳' },
        { name: '百合', property: '甘寒', effect: '清心润肺' }
      );
      result.treatment.herbal_therapy.formula += result.treatment.herbal_therapy.formula ? '，麻杏石甘汤' : '麻杏石甘汤';
      result.treatment.acupuncture.points.push('肺俞', '列缺');
      result.treatment.qigong_exercise.push({ name: '呼吸吐纳法', description: '增强肺功能，调节呼吸系统' });
    }
    
    if (hasKidneyIssues) {
      result.diagnosis.details.push('肾气亏虚，精气不足');
      result.treatment.principle += result.treatment.principle ? '，滋补肾阴' : '滋补肾阴';
      result.treatment.methods.push('保持腰部温暖，避免过度劳累');
      result.treatment.diet_therapy.recommended_ingredients.push(
        { name: '黑豆', property: '甘平', effect: '补肾益精' },
        { name: '核桃', property: '甘温', effect: '补肾固精' }
      );
      result.treatment.herbal_therapy.formula += result.treatment.herbal_therapy.formula ? '，六味地黄丸' : '六味地黄丸';
      result.treatment.acupuncture.points.push('肾俞', '太溪');
      result.treatment.qigong_exercise.push({ name: '肾脏保健功', description: '滋养肾精，增强肾功能' });
    }
  }
  
  // 如果没有检测到具体问题，给出一般性建议
  if (result.diagnosis.details.length === 0) {
    result.diagnosis.details.push('未发现明显的健康问题，建议保持良好的生活习惯');
    result.treatment.principle = '调和阴阳，平衡气血';
    result.treatment.methods.push('保持规律作息，均衡饮食');
    result.treatment.diet_therapy.recommended_ingredients.push(
      { name: '五谷杂粮', property: '平和', effect: '补充营养' },
      { name: '时令蔬果', property: '平和', effect: '增强免疫力' }
    );
    result.treatment.herbal_therapy.formula = '暂无特殊推荐';
    result.treatment.acupuncture.points.push('百会', '气海');
    result.treatment.qigong_exercise.push({ name: '太极拳', description: '平衡阴阳，调和气血' });
  }
  
  // 添加一些通用的健康建议
  result.treatment.methods.push('保持心情愉悦，适当运动');
  result.treatment.diet_therapy.principle = '饮食宜清淡，少食辛辣刺激食物';
  result.treatment.acupuncture.principle = '调和阴阳，疏通经络';
  result.treatment.external_treatment.push(
    { name: '艾灸', description: '温经散寒，行气活血' },
    { name: '刮痧', description: '疏通经络，排出毒素' }
  );
  result.treatment.suitable_exercises.push(
    { name: '太极拳', description: '柔和缓慢，调和阴阳' },
    { name: '散步', description: '轻松自然，促进血液循环' }
  );
  
  // 将treatment中的数据复制到对应的五疗对象中
  // 确保外治疗法数据正确
  if (!result.external_therapy) {
    result.external_therapy = {
      principle: "通过外部治疗手段，调节经络气血，平衡阴阳。",
      methods: result.treatment.external_treatment || []
    };
  }
  
  // 确保气功疗法数据正确
  if (!result.qigong) {
    result.qigong = {
      principle: "通过呼吸调节、身体姿势和意念导引，调整气血运行，平衡阴阳。",
      methods: result.treatment.qigong_exercise || []
    };
  }
  
  // 确保心神疗法数据正确
  if (!result.mental_therapy) {
    result.mental_therapy = {
      principle: "通过调节情志，平衡心神，达到身心和谐。",
      methods: [
        {
          name: "情志调理",
          description: "保持心情舒畅，避免情绪波动过大。"
        },
        {
          name: "冥想练习",
          description: "每日进行15-20分钟的冥想，平静心神。"
        }
      ]
    };
  }
  
  return result;
}