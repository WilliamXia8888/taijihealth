import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Box,
  Tabs,
  Tab,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  FitnessCenter as FitnessIcon,
  Favorite as FavoriteIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  SelfImprovement as MeditationIcon,
  School as TheoryIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import TaijiVideoPlayer from '../components/taiji/TaijiVideoPlayer';
import TaijiVideoCategory from '../components/taiji/TaijiVideoCategory';

// 太极禅道功法数据
const exercises = [
  {
    id: 1,
    title: '太极禅道健身功法基本功八式',
    level: '初级',
    duration: '15分钟',
    benefits: ['舒展筋骨', '调节气息', '平衡阴阳'],
    description: '太极禅道健身功法是集易、儒、释、道、医、太极、瑜伽、普拉提等各家功法为一体的综合健身功法。基本功八式，动作简单易学，适合初级学者。帮助练习者掌握基本要领，达到调和阴阳、平衡气血的效果。',
    videoUrl: 'https://www.example.com/taiji-8-forms',
    thumbnail: 'https://source.unsplash.com/random/800x600/?taichi',
    steps: [
      { name: '起势', description: '两脚开立与肩同宽，全身放松，目视前方，双手自然下垂。' },
      { name: '野马分鬃', description: '左脚向左前方跨出，重心前移，双手分开，左手前推，右手后拉。' },
      { name: '白鹤亮翅', description: '重心后移，右脚前点地，双臂向两侧展开，如白鹤展翅。' },
      { name: '搂膝拗步', description: '左脚向左前方跨出，重心前移，右手向前推出，左手向下按。' },
      { name: '手挥琵琶', description: '重心后移，右脚前点地，双手在胸前交叉，如弹琵琶状。' },
      { name: '倒卷肱', description: '左脚向左前方跨出，重心前移，双臂向前环绕，如水波荡漾。' },
      { name: '左右穿梭', description: '重心在两腿间交替移动，双手在身体两侧穿梭摆动。' },
      { name: '收势', description: '双脚并拢，双手自然下垂，回到起始姿势，全身放松。' },
    ]
  },
  {
    id: 2,
    title: '五禽戏',
    level: '中级',
    duration: '20分钟',
    benefits: ['强健脏腑', '疏通经络', '增强免疫力'],
    description: '五禽戏是模仿虎、鹿、熊、猿、鸟五种动物的动作而创编的健身功法。通过模仿动物的特定动作，达到强身健体、防病治病的效果。',
    videoUrl: 'https://www.example.com/five-animal-play',
    thumbnail: 'https://source.unsplash.com/random/800x600/?qigong',
    steps: [
      { name: '虎戏', description: '模仿老虎的威猛姿态，双手如虎爪，增强筋骨力量。' },
      { name: '鹿戏', description: '模仿鹿的优雅动作，双手如鹿角，增强心肺功能。' },
      { name: '熊戏', description: '模仿熊的稳重步态，摇摆身体，增强脾胃功能。' },
      { name: '猿戏', description: '模仿猿猴的灵活动作，舒展筋骨，增强肾功能。' },
      { name: '鸟戏', description: '模仿鸟的轻盈姿态，展翅飞翔，增强肺功能。' },
    ]
  },
  {
    id: 3,
    title: '易筋经',
    level: '高级',
    duration: '30分钟',
    benefits: ['强筋壮骨', '延年益寿', '提高气功修为'],
    description: '易筋经是一套传统的中国气功功法，据传由达摩祖师所创。通过特定的姿势和呼吸方法，达到易筋洗髓、强身健体的效果。',
    videoUrl: 'https://www.example.com/muscle-tendon-changing',
    thumbnail: 'https://source.unsplash.com/random/800x600/?meditation',
    steps: [
      { name: '韦陀献杵', description: '双手握拳，置于腹前，如韦陀菩萨持杵状。' },
      { name: '摘星换斗', description: '左右手交替向上伸展，如摘天上星辰。' },
      { name: '倒拽九牛尾', description: '身体前倾，双手向后拉，如拽牛尾状。' },
      { name: '九鬼拔马刀', description: '右手上举，左手下按，如拔刀状。' },
      { name: '三盘落地', description: '双腿弯曲，上身下压，双手触地。' },
      { name: '青龙探爪', description: '左右手交替向前伸展，如龙爪状。' },
      { name: '卧虎扑食', description: '身体前倾，双手向前推出，如虎扑食状。' },
      { name: '十字手', description: '双手在胸前交叉，形成十字状。' },
    ]
  },
  {
    id: 4,
    title: '八段锦',
    level: '初级',
    duration: '15分钟',
    benefits: ['疏通经络', '调和气血', '增强体质'],
    description: '八段锦是一套简单易学的传统健身气功，由八个动作组成。通过这些动作的练习，可以达到舒展筋骨、行气活血、调和阴阳的效果。',
    videoUrl: 'https://www.example.com/eight-section-brocade',
    thumbnail: 'https://source.unsplash.com/random/800x600/?qigong-exercise',
    steps: [
      { name: '两手托天理三焦', description: '双手上举，掌心向上，拉伸全身。' },
      { name: '左右开弓似射雕', description: '左右手交替做拉弓射箭状。' },
      { name: '调理脾胃须单举', description: '左右手交替上举，调节脾胃功能。' },
      { name: '五劳七伤往后瞧', description: '身体转动，头部向后看。' },
      { name: '摇头摆尾去心火', description: '头部左右摇摆，身体左右摆动。' },
      { name: '两手攀足固肾腰', description: '上身前倾，双手触脚，强健腰肾。' },
      { name: '拳打脚踢增力气', description: '左右手交替出拳，左右脚交替踢腿。' },
      { name: '背后七颠百病消', description: '双脚站立，身体上下颠动。' },
    ]
  },
];

function TaijiExercises() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState(exercises[0]);

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 处理功法选择
  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setTabValue(1); // 切换到详情标签页
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          太极禅道健身功法
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          传统太极禅道健身功法教学与练习指导，平衡身心，强健体魄
        </Typography>
      </Box>

      {/* 标签页 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="功法列表" />
          <Tab label="功法详情" disabled={!selectedExercise} />
        </Tabs>
      </Paper>

      {/* 功法列表 */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {exercises.map((exercise) => (
            <Grid item xs={12} sm={6} md={3} key={exercise.id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
              }}>
                <CardActionArea onClick={() => handleExerciseSelect(exercise)}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={exercise.thumbnail}
                    alt={exercise.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {exercise.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={exercise.level} 
                        size="small" 
                        color={exercise.level === '初级' ? 'success' : exercise.level === '中级' ? 'primary' : 'secondary'}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        <TimerIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {exercise.duration}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {exercise.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 功法详情 */}
      {tabValue === 1 && selectedExercise && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={selectedExercise.thumbnail}
                alt={selectedExercise.title}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="div">
                    {selectedExercise.title}
                  </Typography>
                  <Chip 
                    label={selectedExercise.level} 
                    color={selectedExercise.level === '初级' ? 'success' : selectedExercise.level === '中级' ? 'primary' : 'secondary'}
                  />
                </Box>
                <Typography variant="body2" paragraph>
                  {selectedExercise.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  功效与作用
                </Typography>
                <List dense>
                  {selectedExercise.benefits.map((benefit, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <FavoriteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayIcon />}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => window.open(selectedExercise.videoUrl, '_blank')}
                >
                  观看教学视频
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                练习步骤
              </Typography>
              {selectedExercise.steps.map((step, index) => (
                <Accordion key={index} defaultExpanded={index === 0}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`step-${index}-content`}
                    id={`step-${index}-header`}
                  >
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                      第{index + 1}式: {step.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      {step.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  练习要点
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <FitnessIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="动作要缓慢均匀，呼吸自然" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FitnessIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="意念集中，保持身心放松" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FitnessIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="初学者可以减少练习时间，循序渐进" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FitnessIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="最好在空气清新的环境中练习" />
                  </ListItem>
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default TaijiExercises;