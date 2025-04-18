import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Grid, CircularProgress, Alert, FormGroup, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { createThrottledFunction, cachedApiCall, apiCallWithRetry, simulateDiagnosisApi } from '../utils/apiUtils';
import { sixMeridianData } from '../utils/sixMeridianData';
import cacheService from '../utils/cacheService';
import { useAuth } from '../contexts/AuthContext';
import { healthRecordService } from '../services/db';

// 添加一个基本的响应式样式
// 修改样式对象，优化移动端显示
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '15px', // 减小内边距
    fontFamily: '"Microsoft YaHei", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#1B5E20', // 修改为墨绿色
    marginBottom: '15px', // 减小底部间距
  },
  mainTitle: {
    fontSize: 'calc(1.3rem + 1vw)', // 减小字体大小
    marginBottom: '0', // 移除底部间距
    lineHeight: '1.3', // 增加行高
    color: '#1B5E20', // 修改为墨绿色
  },
  subTitle: {
    fontSize: 'calc(0.8rem + 0.5vw)', // 减小字体大小
    color: '#2E7D32', // 稍微浅一点的墨绿色
    marginTop: '5px',
  },
  formContainer: {
    background: '#f5f5f5',
    padding: '15px', // 减小内边距
    borderRadius: '8px',
    marginBottom: '15px', // 减小底部间距
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formTitle: {
    borderBottom: '1px solid #ddd',
    paddingBottom: '8px', // 减小底部内边距
    color: '#1B5E20', // 修改为墨绿色
    fontSize: 'calc(1rem + 0.5vw)', // 减小字体大小
  },
  formGroup: {
    marginBottom: '12px', // 减小底部间距
  },
  label: {
    display: 'block',
    marginBottom: '4px', // 减小底部间距
    fontWeight: 'bold',
    fontSize: '0.95rem', // 减小字体大小
  },
  input: {
    width: '100%',
    padding: '8px', // 减小内边距
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.95rem', // 减小字体大小
  },
  inputPlaceholder: {
    fontSize: '0.8rem', // 减小placeholder字体
  },
  textarea: {
    width: '100%',
    padding: '8px', // 减小内边距
    borderRadius: '4px',
    border: '1px solid #ddd',
    minHeight: '100px', // 减小最小高度
    fontSize: '0.85rem', // 减小字体大小
    lineHeight: '1.4', // 减小行高
  },
  button: {
    background: '#4CAF50',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  errorContainer: {
    background: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resultContainer: {
    background: '#e8f5e9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resultTitle: {
    borderBottom: '1px solid #a5d6a7',
    paddingBottom: '10px',
    color: '#2e7d32',
    fontSize: 'calc(1.2rem + 0.5vw)',
  },
  disclaimer: {
    fontSize: '0.8rem',
    fontWeight: 'normal',
    color: '#555',
    display: 'inline-block',
    marginLeft: '10px',
  },
  sectionTitle: {
    color: '#1b5e20', // 修改为墨绿色
    fontSize: 'calc(0.9rem + 0.4vw)', // 减小标题字体
    marginTop: '10px', // 减小顶部间距
    marginBottom: '8px', // 添加底部间距
  },
  sectionContent: {
    marginBottom: '15px',
    padding: '10px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '4px',
  },
  preLineText: {
    whiteSpace: 'pre-line',
    fontSize: '0.9rem', // 减小文本字体
  },
  therapyDetails: {
    lineHeight: '1.4', // 减小行高
    fontSize: '0.9rem', // 减小字体大小
  },
  listItem: {
    marginBottom: '8px', // 减小列表项间距
    padding: '8px', // 减小内边距
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '4px',
  },
};

function Diagnosis() {
  // 添加错误处理
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  
  // 使用可选链操作符防止错误
  // 替换原来的 const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    pulse: '',
    tongue: '',
    symptoms: '',
    selectedPulse: [],
    selectedTongue: [],
    selectedSymptoms: []
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // 添加加载进度状态
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // 使用useCallback优化事件处理函数
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);
  
  // 处理勾选框变化
  const handleCheckboxChange = useCallback((field, value) => {
    setFormData(prev => {
      const currentSelected = [...prev[`selected${field.charAt(0).toUpperCase() + field.slice(1)}`]];
      const index = currentSelected.indexOf(value);
      
      if (index === -1) {
        currentSelected.push(value);
      } else {
        currentSelected.splice(index, 1);
      }
      
      return {
        ...prev,
        [`selected${field.charAt(0).toUpperCase() + field.slice(1)}`]: currentSelected
      };
    });
  }, []);
  
  // 添加清除数据的函数
  const handleClear = useCallback(() => {
    // 清除表单数据
    setFormData({
      pulse: '',
      tongue: '',
      symptoms: '',
      selectedPulse: [],
      selectedTongue: [],
      selectedSymptoms: []
    });
    // 清除结果和错误信息
    setResult(null);
    setError(null);
    // 重置加载状态
    setLoading(false);
    setLoadingProgress(0);
    setLoadingMessage('');
  }, []);

  // 使用useMemo优化formatJsonData函数
  const formatJsonData = useMemo(() => {
    return (data) => {
      if (typeof data !== 'object' || data === null) {
        return data;
      }
      
      // 处理数组
      if (Array.isArray(data)) {
        // 添加数组项的序号处理
        return data.map((item, index) => {
          if (typeof item === 'object') {
            // 处理对象中的"名称"字段
            if (item.name) {
              // 根据上下文确定前缀
              let prefix = "";
              let prefixNum = index + 1;
              
              // 检查父对象的类型来确定前缀
              if (data._parentContext === 'recommended_ingredients') {
                prefix = `食材${prefixNum}：`;
              } else if (data._parentContext === 'diet_plans') {
                prefix = `食材${prefixNum}：`;
              } else if (data._parentContext === 'methods' || data._parentContext === 'external_treatment') {
                prefix = `方法${prefixNum}、`;
              } else if (data._parentContext === 'qigong_exercise' || data._parentContext === 'suitable_exercises') {
                prefix = `方法${prefixNum}、`;
              }
              
              // 创建新对象并替换name字段
              const newItem = {...item};
              newItem.name = `${prefix}${item.name}`;
              return formatJsonData(newItem);
            }
            return formatJsonData(item);
          }
          return item;
        }).join('\n');
      }
      
      // 处理对象
      let result = '';
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          // 跳过内部使用的字段
          if (key.startsWith('_')) continue;
          
          const value = data[key];
          
          // 添加中英文字段名称映射 - 补充更多字段映射
          const keyMapping = {
            'prescription_name': '处方名称',
            'composition': '组成',
            'name': '名称',
            'dosage': '用量',
            'usage': '用法',
            'efficacy': '功效',
            'precautions': '注意事项',
            'recommended_foods': '推荐食材',
            'food_therapy_plans': '食疗方案',
            'consumption_method': '食用方法',
            'contraindications': '禁忌',
            'external_treatment': '外治法',
            'operation_site': '操作部位',
            'operation_method': '操作方法',
            'treatment_frequency': '治疗频次',
            'notes': '注意事项',
            'qigong_exercise': '气功练习',
            'movement_description': '动作描述',
            'breathing_method': '呼吸方法',
            'practice_frequency': '练习频次',
            'emotional_adjustment': '情志调理',
            'meditation_guide': '冥想指导',
            'lifestyle_advice': '生活建议',
            'emotion_management': '情绪管理',
            
            // 添加新的字段映射
            'tcm_analysis': '中医辨证分析',
            'etiology_pathogenesis': '病因病机分析',
            'syndrome_type': '主要证型判断',
            'efficacy_analysis': '功效分析',
            'usage_dosage': '用法用量',
            'suitable_exercises': '适合的气功练习',
            'emotional_regulation': '情志调理方法',
            'meditation_guidance': '冥想指导',
            'lifestyle_suggestions': '生活起居建议',
            'herbal_therapy': '中医药疗',
            'diet_therapy': '中医食疗',
            'external_therapy': '中医外治',
            'qigong': '气功疗法',
            'mental_therapy': '心神疗法',
            'diagnosis': '诊察结果',
            
            // 补充中医食疗相关字段
            'food_properties': '食材药性',
            'dietary_plans': '食疗方案',
            'eating_method': '食用方法',
            'dietary_contraindications': '食疗禁忌',
            'diet_contraindications': '食疗禁忌',
            'recommended_ingredients': '推荐食材',
            'diet_plans': '食疗方案',
            'property': '药性',
            'method': '做法',
            'dietary_taboos': '食疗禁忌',
            'ingredients': '配料',
            'dietary_taboo': '食疗禁忌',
            
            // 补充中医外治相关字段
            'treatment_method': '治疗方法',
            'acupoints': '穴位',
            'application_method': '应用方法',
            'treatment_course': '治疗疗程',
            'treatment_notes': '治疗注意事项',
            'methods': '治疗方法',
            'location': '操作部位',
            'frequency': '治疗频次',
            'operation': '操作方法',
            'procedure': '操作步骤',
            'course': '疗程',
            'applicable_methods': '适用方法',
            'specific_methods': '具体方法',
            
            // 补充气功疗法相关字段
            'recommended_exercises': '推荐练习',
            'description': '动作描述',
            'frequency_duration': '练习频次与时长',
            'practice_frequency_duration': '练习频次与时长',
            'recommended_exercise': '推荐练习',
            'detailed_actions': '详细动作',
            'exercise': '练习',
            
            // 补充心神疗法相关字段
            'mind_regulation': '心理调节',
            'meditation_practice': '冥想练习',
            'daily_routine': '日常生活建议',
            'emotion_techniques': '情绪管理技巧',
            'emotional_management': '情绪管理',
            'emotional_management_techniques': '情绪管理技巧',
            'lifestyle_recommendations': '生活建议'
          };
          
          // 使用映射转换字段名称
          const displayKey = keyMapping[key] || key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1);
          
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              // 为数组项添加上下文信息
              value._parentContext = key;
              result += `${displayKey}:\n${value.map((item, index) => {
                // 特殊处理食疗、外治和气功部分的数组项
                if (key === 'recommended_ingredients') {
                  if (typeof item === 'object' && item.name) {
                    const newItem = {...item};
                    newItem.name = `食材${index + 1}：${item.name}`;
                    return `  - ${formatJsonData(newItem).replace('- 名称: ', '')}`;
                  }
                } else if (key === 'diet_plans') {
                  if (typeof item === 'object' && item.name) {
                    const newItem = {...item};
                    newItem.name = `食材${index + 1}：${item.name}`;
                    return `  -${formatJsonData(newItem).replace('- 名称: ', '')}`;
                  }
                } else if (key === 'methods' || key === 'external_treatment' || key === 'operation') {
                  if (typeof item === 'object' && item.name) {
                    const newItem = {...item};
                    newItem.name = `方法${index + 1}、${item.name}`;
                    return `  - ${formatJsonData(newItem)}`;
                  } else if (typeof item === 'string') {
                    return `  - ${item}`;
                  }
                } else if (key === 'qigong_exercise' || key === 'suitable_exercises' || 
                           key === 'detailed_actions') {
                  if (typeof item === 'object' && item.name) {
                    const newItem = {...item};
                    newItem.name = `方法${index + 1}、${item.name}`;
                    return `  - ${formatJsonData(newItem)}`;
                  } else if (typeof item === 'object' && item.exercise) {
                    return `  - ${item.exercise}`;
                  } else if (typeof item === 'string') {
                    return `  - ${item}`;
                  }
                } else if (key === 'description' && Array.isArray(item)) {
                  if (typeof item === 'object' && item.exercise) {
                    return `  - ${item.exercise}: ${item.description || ''}`;
                  }
                }
                return `  - ${formatJsonData(item)}`;
              }).join('\n')}\n`;
            } else {
              result += `${displayKey}: ${formatJsonData(value)}\n`;
            }
          } else if (value) {
            result += `${displayKey}: ${value}\n`;
          }
        }
      }
      
      return result;
    };
  }, []);

  // 处理诊断提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!formData.pulse && !formData.tongue && !formData.symptoms && 
        formData.selectedPulse.length === 0 && 
        formData.selectedTongue.length === 0 && 
        formData.selectedSymptoms.length === 0) {
      setError('请至少填写或选择一项诊断信息');
      return;
    }
    
    // 合并选中的选项和文本输入
    const combinedFormData = {
      pulse: formData.selectedPulse.length > 0 ? 
        formData.selectedPulse.join('、') + (formData.pulse ? '、' + formData.pulse : '') : 
        formData.pulse,
      tongue: formData.selectedTongue.length > 0 ? 
        formData.selectedTongue.join('、') + (formData.tongue ? '、' + formData.tongue : '') : 
        formData.tongue,
      symptoms: formData.selectedSymptoms.length > 0 ? 
        formData.selectedSymptoms.join('、') + (formData.symptoms ? '、' + formData.symptoms : '') : 
        formData.symptoms
    };
    
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingMessage('正在分析您的健康信息...');
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 500);
      
      // 更新加载消息
      setTimeout(() => setLoadingMessage('正在生成诊断结果...'), 1500);
      setTimeout(() => setLoadingMessage('正在制定五疗方案...'), 3000);
      
      // 调用诊断API
      const diagnosisResult = await simulateDiagnosisApi(combinedFormData);
      
      // 保存诊断记录（如果用户已登录）
      if (currentUser) {
        try {
          // 保存脉诊记录
          if (combinedFormData.pulse) {
            await healthRecordService.addPulseRecord(currentUser.id, combinedFormData.pulse);
          }
          
          // 保存舌诊记录
          if (combinedFormData.tongue) {
            await healthRecordService.addTongueRecord(currentUser.id, combinedFormData.tongue);
          }
          
          // 保存症状记录
          if (combinedFormData.symptoms) {
            await healthRecordService.addSymptomRecord(currentUser.id, combinedFormData.symptoms);
          }
          
          // 保存诊断结果
          await healthRecordService.addHealthRecord(
            currentUser.id,
            diagnosisResult.diagnosis,
            diagnosisResult.treatment
          );
        } catch (error) {
          console.error('保存诊断记录失败:', error);
          // 不中断流程，继续显示诊断结果
        }
      }
      
      // 清除进度更新定时器
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // 设置结果
      setResult(diagnosisResult);
    } catch (error) {
      console.error('诊断失败:', error);
      setError(`诊断失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 确保组件不会在加载时自动执行任何导航或API调用
  useEffect(() => {
    // 移除任何可能在组件加载时执行的代码
    console.log('Diagnosis组件已加载');
    return () => {
      console.log('Diagnosis组件已卸载');
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={styles.container}>
        {/* 页面标题 */}
        <Box sx={styles.header}>
          <Typography variant="h4" component="h1" sx={styles.mainTitle}>
            传统健康一诊五疗
          </Typography>
          <Typography variant="subtitle1" sx={styles.subTitle}>
            基于传统中医理论的健康诊察与调理方案
          </Typography>
        </Box>
        
        {/* 错误提示 */}
        {error && (
          <Box sx={styles.errorContainer}>
            <Typography>{error}</Typography>
          </Box>
        )}
        
        {/* 诊断表单 */}
        {!result && (
          <Paper elevation={3} sx={styles.formContainer}>
            <Typography variant="h5" sx={styles.formTitle}>
              健康诊察
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Box sx={styles.formGroup}>
                <Typography sx={styles.label}>脉象描述</Typography>
                
                {/* 脉象勾选框 */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#2e7d32' }}>
                  请勾选主要脉象特点：
                </Typography>
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mb: 2 }}>
                  {[
                    '浮脉', '沉脉', '迟脉', '数脉', '虚脉', '实脉', '滑脉', '涩脉',
                    '洪脉', '细脉', '弦脉', '紧脉', '弱脉', '微脉'
                  ].map((pulse) => (
                    <FormControlLabel
                      key={pulse}
                      control={
                        <Checkbox 
                          checked={formData.selectedPulse.includes(pulse)}
                          onChange={() => handleCheckboxChange('pulse', pulse)}
                          size="small"
                          sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}
                        />
                      }
                      label={pulse}
                      sx={{ width: { xs: '50%', sm: '33%', md: '25%' }, fontSize: '0.9rem' }}
                    />
                  ))}
                </FormGroup>
                
                {/* 脉象文本输入 */}
                <TextField
                  fullWidth
                  placeholder="请描述其他脉象特点或补充说明"
                  value={formData.pulse}
                  onChange={(e) => handleInputChange('pulse', e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                  InputProps={{
                    sx: { fontSize: '0.9rem' }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  常见脉象：浮脉（脉来浮于表面）、沉脉（脉来沉于深部）、迟脉（每分钟跳动次数少于60次）、数脉（每分钟跳动次数多于90次）、虚脉（脉来无力）、实脉（脉来有力）、滑脉（脉来流利圆滑）、涩脉（脉来艰涩不畅）等
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', borderLeft: '3px solid #1B5E20', pl: 1, bgcolor: 'rgba(27, 94, 32, 0.05)' }}>
                  <strong>六经辨证脉象参考：</strong>太阳病多见浮脉、浮紧脉（寒邪）、浮数脉（热邪）；阳明病多见脉洪大有力、脉数；少阳病多见脉弦；太阴病多见脉沉细、脉迟、脉弱；少阴病阳虚证见脉沉细微，阴虚证见脉细数；厥阴病多见脉微细、脉沉伏、脉弦。
                </Typography>
              </Box>
              
              <Box sx={styles.formGroup}>
                <Typography sx={styles.label}>舌象描述</Typography>
                
                {/* 舌象勾选框 */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                  {/* 舌质选择 */}
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '48%' } }}>
                    <InputLabel id="tongue-quality-label">舌质</InputLabel>
                    <Select
                      labelId="tongue-quality-label"
                      multiple
                      value={formData.selectedTongue.filter(t => ['淡红舌', '淡白舌', '红舌', '绛舌', '紫舌', '青紫舌'].includes(t))}
                      onChange={(e) => {
                        const newSelected = formData.selectedTongue.filter(t => !['淡红舌', '淡白舌', '红舌', '绛舌', '紫舌', '青紫舌'].includes(t));
                        setFormData(prev => ({
                          ...prev,
                          selectedTongue: [...newSelected, ...e.target.value]
                        }));
                      }}
                      renderValue={(selected) => selected.join('、')}
                      label="舌质"
                    >
                      {['淡红舌', '淡白舌', '红舌', '绛舌', '紫舌', '青紫舌'].map((item) => (
                        <MenuItem key={item} value={item}>
                          <Checkbox checked={formData.selectedTongue.indexOf(item) > -1} />
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {/* 舌苔选择 */}
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '48%' } }}>
                    <InputLabel id="tongue-coating-label">舌苔</InputLabel>
                    <Select
                      labelId="tongue-coating-label"
                      multiple
                      value={formData.selectedTongue.filter(t => ['薄白苔', '厚白苔', '薄黄苔', '厚黄苔', '黄燥苔', '灰黑苔', '腻苔', '少苔', '无苔'].includes(t))}
                      onChange={(e) => {
                        const newSelected = formData.selectedTongue.filter(t => !['薄白苔', '厚白苔', '薄黄苔', '厚黄苔', '黄燥苔', '灰黑苔', '腻苔', '少苔', '无苔'].includes(t));
                        setFormData(prev => ({
                          ...prev,
                          selectedTongue: [...newSelected, ...e.target.value]
                        }));
                      }}
                      renderValue={(selected) => selected.join('、')}
                      label="舌苔"
                    >
                      {['薄白苔', '厚白苔', '薄黄苔', '厚黄苔', '黄燥苔', '灰黑苔', '腻苔', '少苔', '无苔'].map((item) => (
                        <MenuItem key={item} value={item}>
                          <Checkbox checked={formData.selectedTongue.indexOf(item) > -1} />
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                {/* 舌形勾选框 */}
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mb: 2 }}>
                  {['胖大舌', '瘦薄舌', '齿痕舌', '裂纹舌', '偏舌', '舌颤', '强硬舌'].map((tongue) => (
                    <FormControlLabel
                      key={tongue}
                      control={
                        <Checkbox 
                          checked={formData.selectedTongue.includes(tongue)}
                          onChange={() => handleCheckboxChange('tongue', tongue)}
                          size="small"
                          sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}
                        />
                      }
                      label={tongue}
                      sx={{ width: { xs: '50%', sm: '33%', md: '25%' }, fontSize: '0.9rem' }}
                    />
                  ))}
                </FormGroup>
                
                {/* 舌象文本输入 */}
                <TextField
                  fullWidth
                  placeholder="请描述其他舌象特点或补充说明"
                  value={formData.tongue}
                  onChange={(e) => handleInputChange('tongue', e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                  InputProps={{
                    sx: { fontSize: '0.9rem' }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  舌质：淡红（正常）、淡白、红、绛（深红）等；舌苔：薄白（正常）、厚白、黄（分浅黄、深黄）、灰黑等；舌形：胖大、瘦薄、齿痕、裂纹等；舌态：偏、颤、强硬等
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', borderLeft: '3px solid #1B5E20', pl: 1, bgcolor: 'rgba(27, 94, 32, 0.05)' }}>
                  <strong>六经辨证舌象参考：</strong>太阳病多见舌苔薄白（寒邪）、舌苔薄黄（热邪）；阳明病多见舌质红、舌苔黄厚或黄燥、甚则焦黑；少阳病多见舌苔薄白或薄黄；太阴病多见舌淡胖、舌苔白腻；少阴病阳虚证见舌淡、苔白，阴虚证见舌红少苔；厥阴病多见舌淡紫或青紫、舌苔薄白。
                </Typography>
              </Box>
              
              <Box sx={styles.formGroup}>
                <Typography sx={styles.label}>症状描述</Typography>
                
                {/* 常见症状勾选框 */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#2e7d32' }}>
                  请勾选主要症状：
                </Typography>
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mb: 2 }}>
                  {[
                    '头痛', '头晕', '恶寒', '发热', '汗出', '无汗', '口渴', '口干', '口苦', 
                    '咽干', '咽痛', '胸闷', '胸痛', '腹痛', '腹胀', '腹泻', '便秘', '恶心', 
                    '呕吐', '乏力', '失眠', '多梦', '心悸', '气短', '咳嗽', '痰多', '食欲不振',
                    '肢体酸痛', '肢体麻木', '肢体沉重', '肢体水肿', '小便异常', '大便异常'
                  ].map((symptom) => (
                    <FormControlLabel
                      key={symptom}
                      control={
                        <Checkbox 
                          checked={formData.selectedSymptoms.includes(symptom)}
                          onChange={() => handleCheckboxChange('symptoms', symptom)}
                          size="small"
                          sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}
                        />
                      }
                      label={symptom}
                      sx={{ width: { xs: '50%', sm: '33%', md: '25%' }, fontSize: '0.9rem' }}
                    />
                  ))}
                </FormGroup>
                
                {/* 六经辨证常见症状组合 */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#2e7d32' }}>
                  六经辨证常见症状组合：
                </Typography>
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={['恶寒重', '发热轻', '头痛', '项强', '全身酸痛'].every(s => formData.selectedSymptoms.includes(s))}
                        onChange={() => {
                          const symptoms = ['恶寒重', '发热轻', '头痛', '项强', '全身酸痛'];
                          const allSelected = symptoms.every(s => formData.selectedSymptoms.includes(s));
                          
                          if (allSelected) {
                            setFormData(prev => ({
                              ...prev,
                              selectedSymptoms: prev.selectedSymptoms.filter(s => !symptoms.includes(s))
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              selectedSymptoms: [...new Set([...prev.selectedSymptoms, ...symptoms])]
                            }));
                          }
                        }}
                        size="small"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}
                      />
                    }
                    label="太阳病症候群"
                    sx={{ width: { xs: '100%', sm: '50%', md: '33%' }, fontSize: '0.9rem' }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={['发热重', '汗出', '口渴喜冷饮', '便秘', '腹满痛拒按'].every(s => formData.selectedSymptoms.includes(s))}
                        onChange={() => {
                          const symptoms = ['发热重', '汗出', '口渴喜冷饮', '便秘', '腹满痛拒按'];
                          const allSelected = symptoms.every(s => formData.selectedSymptoms.includes(s));
                          
                          if (allSelected) {
                            setFormData(prev => ({
                              ...prev,
                              selectedSymptoms: prev.selectedSymptoms.filter(s => !symptoms.includes(s))
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              selectedSymptoms: [...new Set([...prev.selectedSymptoms, ...symptoms])]
                            }));
                          }
                        }}
                        size="small"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}
                      />
                    }
                    label="阳明病症候群"
                    sx={{ width: { xs: '100%', sm: '50%', md: '33%' }, fontSize: '0.9rem' }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={['往来寒热', '胸胁苦满', '食欲不振', '心烦', '口苦', '咽干'].every(s => formData.selectedSymptoms.includes(s))}
                        onChange={() => {
                          const symptoms = ['往来寒热', '胸胁苦满', '食欲不振', '心烦', '口苦', '咽干'];
                          const allSelected = symptoms.every(s => formData.selectedSymptoms.includes(s));
                          
                          if (allSelected) {
                            setFormData(prev => ({
                              ...prev,
                              selectedSymptoms: prev.selectedSymptoms.filter(s => !symptoms.includes(s))
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              selectedSymptoms: [...new Set([...prev.selectedSymptoms, ...symptoms])]
                            }));
                          }
                        }}
                        size="small"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}
                      />
                    }
                    label="少阳病症候群"
                    sx={{ width: { xs: '100%', sm: '50%', md: '33%' }, fontSize: '0.9rem' }}
                  />
                </FormGroup>
                
                {/* 症状文本输入 */}
                <TextField
                  fullWidth
                  placeholder="请描述其他症状或补充说明"
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{
                    sx: { fontSize: '0.9rem' }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  请详细描述您的症状，包括发生时间、持续时间、严重程度、诱发因素、缓解因素等
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClear}
                  disabled={loading}
                >
                  清空
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? '诊察中...' : '开始诊察'}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
        
        {/* 加载状态 */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <CircularProgress variant="determinate" value={loadingProgress} size={60} />
            <Typography sx={{ mt: 2 }}>{loadingMessage || '正在进行健康诊察...'}</Typography>
            <Typography variant="caption" sx={{ mt: 1 }}>
              {Math.round(loadingProgress)}% 完成
            </Typography>
          </Box>
        )}
        
        {/* 诊断结果 */}
        {result && (
          <Box sx={{ mt: 4 }}>
            <Paper elevation={3} sx={styles.resultContainer}>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h5" sx={styles.resultTitle}>
                  诊察结果和五疗方案
                </Typography>
                <Typography variant="caption" sx={styles.disclaimer}>
                  (药疗、食疗、理疗、功疗、心疗。不能代替诊断治疗)
                </Typography>
              </Box>
              
              {/* 诊察结果 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  诊察结果
                </Typography>
                <Box sx={styles.sectionContent}>
                  <Typography sx={{...styles.preLineText, maxHeight: '200px', overflowY: 'auto'}}>
                    {typeof result.diagnosis === 'object' 
                      ? formatJsonData(result.diagnosis)
                      : result.diagnosis || '无数据'}
                  </Typography>
                </Box>
              </Box>
              
              {/* 六经辨证结果 */}
              {result.diagnosis && result.diagnosis.six_meridian_diagnosis && result.diagnosis.six_meridian_diagnosis.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={styles.sectionTitle}>
                    伤寒杂病论六经辨证
                  </Typography>
                  <Box sx={styles.sectionContent}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#2e7d32' }}>
                      六经辨证是《伤寒杂病论》中的经典辨证方法，通过太阳、阳明、少阳、太阴、少阴、厥阴六经的证候特点进行辨别。
                    </Typography>
                    {result.diagnosis.six_meridian_diagnosis.map((item, index) => (
                      <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
                          {item.name} (匹配度: {item.match_rate})
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {item.description}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>主要症状：</strong> {item.symptoms}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>治疗原则：</strong> {item.treatment}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* 中医药疗 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  中医药疗
                </Typography>
                <Box sx={styles.sectionContent}>
                  <Typography sx={styles.preLineText}>
                    {typeof result.herbal_therapy === 'object' 
                      ? formatJsonData(result.herbal_therapy)
                      : result.herbal_therapy || '无数据'}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 1, fontSize: '0.8rem' }}>
                    注意：中药调理请在专业中医师指导下进行，切勿自行用药。
                  </Alert>
                </Box>
              </Box>
              
              {/* 中医食疗 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  中医食疗
                </Typography>
                <Box sx={styles.sectionContent}>
                  <Typography sx={styles.preLineText}>
                    {typeof result.diet_therapy === 'object' 
                      ? formatJsonData(result.diet_therapy)
                      : result.diet_therapy || '无数据'}
                  </Typography>
                </Box>
              </Box>
              
              {/* 中医外治 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  中医外治
                </Typography>
                <Box sx={styles.sectionContent}>
                  <Typography sx={styles.preLineText}>
                    {typeof result.external_therapy === 'object' 
                      ? formatJsonData(result.external_therapy)
                      : result.external_therapy || '无数据'}
                  </Typography>
                </Box>
              </Box>
              
              {/* 气功疗法 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  气功疗法
                </Typography>
                <Box sx={styles.sectionContent}>
                  <Typography sx={styles.preLineText}>
                    {typeof result.qigong === 'object' 
                      ? formatJsonData(result.qigong)
                      : result.qigong || '无数据'}
                  </Typography>
                </Box>
              </Box>
              
              {/* 心神疗法 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  心神疗法
                </Typography>
                <Box sx={styles.sectionContent}>
                  <Typography sx={styles.preLineText}>
                    {typeof result.mental_therapy === 'object' 
                      ? formatJsonData(result.mental_therapy)
                      : result.mental_therapy || '无数据'}
                  </Typography>
                </Box>
              </Box>
              
              {/* 操作按钮 */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClear}
                >
                  重新诊察
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Diagnosis;