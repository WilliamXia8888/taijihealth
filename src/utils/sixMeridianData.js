/**
 * 伤寒杂病论六经辨证资料
 * 用于健康诊断系统的中医辨证参考
 */

/**
 * 六经辨证数据
 * 包含太阳、阳明、少阳、太阴、少阴、厥阴六经的证候特点、主要症状、脉象、舌象、治疗原则等
 */
export const sixMeridianData = {
  // 太阳病
  taiyang: {
    name: "太阳病",
    description: "太阳为六经之首，主一身之表，主要表现为外感表证。",
    pathogenesis: "感受风寒或风热之邪侵袭肌表，卫阳被郁，肌表失和。",
    main_symptoms: [
      "恶寒重、发热轻",
      "头痛项强",
      "无汗或有汗",
      "全身酸痛",
      "鼻鸣干呕"
    ],
    pulse_characteristics: [
      "浮脉为主",
      "浮紧脉（寒邪）",
      "浮数脉（热邪）"
    ],
    tongue_characteristics: [
      "舌苔薄白（寒邪）",
      "舌苔薄黄（热邪）"
    ],
    treatment_principles: [
      "解表祛邪",
      "疏风散寒（寒邪）",
      "疏风清热（热邪）"
    ],
    classic_formulas: [
      { name: "桂枝汤", indication: "风寒表虚证，见恶风、发热、头痛、汗出、脉浮缓" },
      { name: "麻黄汤", indication: "风寒表实证，见恶寒、发热、无汗、头身痛、脉浮紧" },
      { name: "葛根汤", indication: "太阳表证兼项背强几几" },
      { name: "大青龙汤", indication: "表寒里热证，见壮热、恶寒、无汗、烦躁、口渴" }
    ],
    key_points: "太阳病以表证为主，治疗以解表为原则。根据有汗无汗、脉象等辨别表虚表实，选择发汗或解肌法。"
  },
  
  // 阳明病
  yangming: {
    name: "阳明病",
    description: "阳明为六经阳经之最盛，主一身之里，多表现为里热证。",
    pathogenesis: "邪热入里化热，热邪与胃肠燥结，或热盛伤津。",
    main_symptoms: [
      "发热重、恶寒轻或不恶寒",
      "汗出",
      "口渴喜冷饮",
      "便秘",
      "腹满痛拒按",
      "躁动不安",
      "谵语",
      "甚则高热神昏"
    ],
    pulse_characteristics: [
      "脉洪大有力",
      "脉数"
    ],
    tongue_characteristics: [
      "舌质红",
      "舌苔黄厚或黄燥",
      "甚则焦黑"
    ],
    treatment_principles: [
      "清热泻火",
      "通腑泄热",
      "养阴生津"
    ],
    classic_formulas: [
      { name: "白虎汤", indication: "阳明经证，见壮热、汗出、口渴、脉洪大" },
      { name: "调胃承气汤", indication: "阳明腑实证轻证，见便秘、口渴、腹痛、脉数实" },
      { name: "大承气汤", indication: "阳明腑实证重证，见高热、腹满痛、便秘、谵语、脉沉实" },
      { name: "小承气汤", indication: "阳明腑实证初起，见腹满痛、便秘" }
    ],
    key_points: "阳明病以里热证为主，分经证和腑证。经证以气分热盛为主，治以清热；腑证以实热积滞为主，治以通下。"
  },
  
  // 少阳病
  shaoyang: {
    name: "少阳病",
    description: "少阳居半表半里，为枢机，主一身之侧，表现为半表半里证。",
    pathogenesis: "邪气郁于少阳，气机不利，枢机不利。",
    main_symptoms: [
      "往来寒热",
      "胸胁苦满",
      "默默不欲饮食",
      "心烦喜呕",
      "口苦",
      "咽干",
      "目眩"
    ],
    pulse_characteristics: [
      "脉弦"
    ],
    tongue_characteristics: [
      "舌苔薄白或薄黄"
    ],
    treatment_principles: [
      "和解少阳",
      "疏肝利胆"
    ],
    classic_formulas: [
      { name: "小柴胡汤", indication: "少阳病，见往来寒热、胸胁苦满、默默不欲饮食、心烦喜呕" },
      { name: "柴胡加龙骨牡蛎汤", indication: "少阳病兼惊悸、烦躁、失眠" },
      { name: "大柴胡汤", indication: "少阳阳明合病，见往来寒热、胸胁苦满、腹满痛、呕吐、便秘" }
    ],
    key_points: "少阳病为半表半里证，既非表证，亦非里证，治疗不可汗、下、吐，当以和解为法。"
  },
  
  // 太阴病
  taiyin: {
    name: "太阴病",
    description: "太阴主脾，主一身之里，主要表现为脾阳虚衰、寒湿内盛证。",
    pathogenesis: "脾阳虚衰，运化失职，寒湿内生或外袭。",
    main_symptoms: [
      "腹满",
      "腹痛喜按",
      "呕吐",
      "泄泻",
      "不渴或渴喜热饮",
      "肢冷",
      "神疲懒言"
    ],
    pulse_characteristics: [
      "脉沉细",
      "脉迟",
      "脉弱"
    ],
    tongue_characteristics: [
      "舌淡胖",
      "舌苔白腻"
    ],
    treatment_principles: [
      "温中健脾",
      "祛寒化湿"
    ],
    classic_formulas: [
      { name: "理中汤", indication: "太阴虚寒证，见腹痛泄泻、四肢不温、脉沉细" },
      { name: "四逆汤", indication: "太阴虚寒重证，见手足厥冷、脉微欲绝" },
      { name: "藿香正气散", indication: "太阴湿证，见脘腹胀满、恶心呕吐、泄泻" }
    ],
    key_points: "太阴病以虚寒证为主，治疗以温中健脾为原则，忌用寒凉。"
  },
  
  // 少阴病
  shaoyin: {
    name: "少阴病",
    description: "少阴主肾，为水火之脏，主一身之里，表现为肾阳虚衰或阴虚火旺证。",
    pathogenesis: "肾阳虚衰或阴虚火旺。",
    main_symptoms: {
      "阳虚证": [
        "畏寒蜷卧",
        "神疲欲寐",
        "肢冷",
        "小便清长",
        "大便溏薄",
        "口不渴或渴喜热饮",
        "舌淡苔白",
        "脉沉细微"
      ],
      "阴虚证": [
        "口咽干燥",
        "五心烦热",
        "盗汗",
        "形体消瘦",
        "舌红少苔",
        "脉细数"
      ]
    },
    pulse_characteristics: {
      "阳虚证": ["脉沉细微"],
      "阴虚证": ["脉细数"]
    },
    tongue_characteristics: {
      "阳虚证": ["舌淡", "苔白"],
      "阴虚证": ["舌红少苔"]
    },
    treatment_principles: {
      "阳虚证": ["温补肾阳", "回阳救逆"],
      "阴虚证": ["滋养肾阴", "清热降火"]
    },
    classic_formulas: [
      { name: "四逆汤", indication: "少阴寒化证，见手足厥冷、脉微欲绝" },
      { name: "真武汤", indication: "少阴寒水泛滥证，见肢冷、小便不利、水肿、腰痛" },
      { name: "黄连阿胶汤", indication: "少阴热化证，见心烦不寐、口燥咽干、小便黄赤" },
      { name: "知柏地黄丸", indication: "少阴阴虚火旺证，见腰膝酸软、五心烦热、盗汗" }
    ],
    key_points: "少阴病分寒化证和热化证，寒化证为阳虚，治以温阳；热化证为阴虚，治以滋阴。"
  },
  
  // 厥阴病
  jueyin: {
    name: "厥阴病",
    description: "厥阴为肝经，为一身之表里，主要表现为寒热错杂证。",
    pathogenesis: "肝气郁结，寒热错杂，阴阳失调。",
    main_symptoms: [
      "四肢厥冷",
      "烦躁",
      "干呕",
      "腹痛",
      "下利",
      "消渴",
      "囊缩"
    ],
    pulse_characteristics: [
      "脉沉弦",
      "脉微细"
    ],
    tongue_characteristics: [
      "舌淡红",
      "苔薄白或薄黄"
    ],
    treatment_principles: [
      "调和肝胃",
      "温中散寒",
      "清热和营"
    ],
    classic_formulas: [
      { name: "乌梅丸", indication: "厥阴病，见腹中急痛、干呕、下利、消渴、蛔虫上窜" },
      { name: "当归四逆汤", indication: "厥阴病，见手足厥冷、脉细欲绝、或腹痛" },
      { name: "吴茱萸汤", indication: "厥阴病，见干呕吞酸、心下痞硬、四肢厥冷" }
    ],
    key_points: "厥阴病以寒热错杂为特点，治疗当调和阴阳，或温中散寒，或清热和营。"
  }
};

/**
 * 六经辨证关键词匹配规则
 * 用于根据症状、脉象、舌象等信息匹配可能的六经证候
 */
export const sixMeridianKeywords = {
  taiyang: {
    symptoms: ["恶寒", "发热", "头痛", "项强", "无汗", "汗出", "全身酸痛", "鼻鸣", "干呕"],
    pulse: ["浮", "浮紧", "浮数"],
    tongue: ["苔薄白", "苔薄黄"]
  },
  yangming: {
    symptoms: ["高热", "汗出", "口渴", "喜冷饮", "便秘", "腹满", "腹痛", "拒按", "躁动", "谵语", "神昏"],
    pulse: ["洪大", "有力", "数"],
    tongue: ["舌红", "苔黄厚", "苔黄燥", "苔焦黑"]
  },
  shaoyang: {
    symptoms: ["往来寒热", "胸胁苦满", "默默不欲饮食", "心烦", "喜呕", "口苦", "咽干", "目眩"],
    pulse: ["弦"],
    tongue: ["苔薄白", "苔薄黄"]
  },
  taiyin: {
    symptoms: ["腹满", "腹痛", "喜按", "呕吐", "泄泻", "不渴", "渴喜热饮", "肢冷", "神疲", "懒言"],
    pulse: ["沉细", "迟", "弱"],
    tongue: ["舌淡胖", "苔白腻"]
  },
  shaoyin: {
    symptoms_cold: ["畏寒", "蜷卧", "神疲", "欲寐", "肢冷", "小便清长", "大便溏薄", "不渴", "渴喜热饮"],
    symptoms_heat: ["口干", "咽干", "五心烦热", "盗汗", "形体消瘦"],
    pulse_cold: ["沉细", "微"],
    pulse_heat: ["细数"],
    tongue_cold: ["舌淡", "苔白"],
    tongue_heat: ["舌红少苔"]
  },
  jueyin: {
    symptoms: ["四肢厥冷", "烦躁", "干呕", "腹痛", "下利", "消渴", "囊缩"],
    pulse: ["沉弦", "微细"],
    tongue: ["舌淡红", "苔薄白", "苔薄黄"]
  }
};

/**
 * 根据症状、脉象、舌象进行六经辨证
 * @param {Object} data - 包含症状、脉象、舌象的数据对象
 * @param {string} data.symptoms - 症状描述
 * @param {string} data.pulse - 脉象描述
 * @param {string} data.tongue - 舌象描述
 * @returns {Array} - 返回可能的六经证候及匹配度，按匹配度降序排列
 */
export function diagnoseWithSixMeridian(data) {
  const { symptoms = '', pulse = '', tongue = '' } = data;
  const lowerSymptoms = symptoms.toLowerCase();
  const lowerPulse = pulse.toLowerCase();
  const lowerTongue = tongue.toLowerCase();
  
  // 计算每个六经的匹配度
  const results = [];
  
  // 遍历六经关键词进行匹配
  for (const [meridian, keywords] of Object.entries(sixMeridianKeywords)) {
    let matchCount = 0;
    let totalKeywords = 0;
    
    // 特殊处理少阴病的寒热证
    if (meridian === 'shaoyin') {
      // 寒证关键词匹配
      const coldSymptomMatches = keywords.symptoms_cold.filter(keyword => 
        lowerSymptoms.includes(keyword.toLowerCase())
      ).length;
      const coldPulseMatches = keywords.pulse_cold.filter(keyword => 
        lowerPulse.includes(keyword.toLowerCase())
      ).length;
      const coldTongueMatches = keywords.tongue_cold.filter(keyword => 
        lowerTongue.includes(keyword.toLowerCase())
      ).length;
      
      // 热证关键词匹配
      const heatSymptomMatches = keywords.symptoms_heat.filter(keyword => 
        lowerSymptoms.includes(keyword.toLowerCase())
      ).length;
      const heatPulseMatches = keywords.pulse_heat.filter(keyword => 
        lowerPulse.includes(keyword.toLowerCase())
      ).length;
      const heatTongueMatches = keywords.tongue_heat.filter(keyword => 
        lowerTongue.includes(keyword.toLowerCase())
      ).length;
      
      // 计算寒证和热证的总匹配数和关键词总数
      const coldMatches = coldSymptomMatches + coldPulseMatches + coldTongueMatches;
      const heatMatches = heatSymptomMatches + heatPulseMatches + heatTongueMatches;
      const coldTotal = keywords.symptoms_cold.length + keywords.pulse_cold.length + keywords.tongue_cold.length;
      const heatTotal = keywords.symptoms_heat.length + keywords.pulse_heat.length + keywords.tongue_heat.length;
      
      // 判断是寒证还是热证
      if (coldMatches > heatMatches) {
        matchCount = coldMatches;
        totalKeywords = coldTotal;
        results.push({
          meridian: meridian,
          type: 'cold',
          name: sixMeridianData[meridian].name + '寒化证',
          matchCount,
          totalKeywords,
          matchRate: totalKeywords > 0 ? (matchCount / totalKeywords) : 0,
          description: sixMeridianData[meridian].description,
          symptoms: sixMeridianData[meridian].main_symptoms.阳虚证.join('、'),
          treatment: sixMeridianData[meridian].treatment_principles.阳虚证.join('、')
        });
      } else if (heatMatches > 0) {
        matchCount = heatMatches;
        totalKeywords = heatTotal;
        results.push({
          meridian: meridian,
          type: 'heat',
          name: sixMeridianData[meridian].name + '热化证',
          matchCount,
          totalKeywords,
          matchRate: totalKeywords > 0 ? (matchCount / totalKeywords) : 0,
          description: sixMeridianData[meridian].description,
          symptoms: sixMeridianData[meridian].main_symptoms.阴虚证.join('、'),
          treatment: sixMeridianData[meridian].treatment_principles.阴虚证.join('、')
        });
      }
    } else {
      // 常规六经匹配
      const symptomMatches = keywords.symptoms.filter(keyword => 
        lowerSymptoms.includes(keyword.toLowerCase())
      ).length;
      const pulseMatches = keywords.pulse.filter(keyword => 
        lowerPulse.includes(keyword.toLowerCase())
      ).length;
      const tongueMatches = keywords.tongue.filter(keyword => 
        lowerTongue.includes(keyword.toLowerCase())
      ).length;
      
      matchCount = symptomMatches + pulseMatches + tongueMatches;
      totalKeywords = keywords.symptoms.length + keywords.pulse.length + keywords.tongue.length;
      
      if (matchCount > 0) {
        results.push({
          meridian: meridian,
          name: sixMeridianData[meridian].name,
          matchCount,
          totalKeywords,
          matchRate: totalKeywords > 0 ? (matchCount / totalKeywords) : 0,
          description: sixMeridianData[meridian].description,
          symptoms: Array.isArray(sixMeridianData[meridian].main_symptoms) 
            ? sixMeridianData[meridian].main_symptoms.join('、')
            : '复杂症状组合',
          treatment: Array.isArray(sixMeridianData[meridian].treatment_principles)
            ? sixMeridianData[meridian].treatment_principles.join('、')
            : '复杂治疗原则'
        });
      }
    }
  }
  
  // 按匹配率降序排序
  return results.sort((a, b) => b.matchRate - a.matchRate);
}

/**
 * 获取六经辨证的详细信息
 * @param {string} meridian - 六经名称（taiyang, yangming, shaoyang, taiyin, shaoyin, jueyin）
 * @param {string} type - 证型类别（用于少阴病的寒热辨别）
 * @returns {Object} - 返回该六经的详细信息
 */
export function getSixMeridianDetail(meridian, type = null) {
  if (!sixMeridianData[meridian]) {
    return null;
  }
  
  const data = { ...sixMeridianData[meridian] };
  
  // 特殊处理少阴病的寒热证
  if (meridian === 'shaoyin' && type) {
    const typeKey = type === 'cold' ? '阳虚证' : '阴虚证';
    data.current_type = typeKey;
    data.current_symptoms = data.main_symptoms[typeKey];
    data.current_pulse = data.pulse_characteristics[typeKey];
    data.current_tongue = data.tongue_characteristics[typeKey];
    data.current_treatment = data.treatment_principles[typeKey];
  }
  
  return data;
}