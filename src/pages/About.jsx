import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  Medication as MedicationIcon,
  Restaurant as FoodIcon,
  Spa as SpaIcon,
  SelfImprovement as MeditationIcon,
  Favorite as HeartIcon,
  Phone as PhoneIcon,
  ContactMail as ContactIcon,
  Groups as CommunityIcon
} from '@mui/icons-material';

function About() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg">
      {/* 头部介绍 */}
      <Box sx={{ mb: 6, mt: 2, textAlign: 'center' }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            mb: 2
          }}
        >
          太极禅道传统健康一诊五疗体系
        </Typography>
        
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 'medium',
            color: 'text.primary',
            mb: 3 
          }}
        >
          健康师+理疗师+ IA智能
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
            诊察调理"一诊五疗"体系
          </Typography>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
            自助、互助、师助健康社区
          </Typography>
        </Box>
      </Box>

      {/* 服务内容 */}
      <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <HealthIcon sx={{ mr: 1 }} /> 服务内容
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <List>
          <ListItem>
            <ListItemIcon>
              <HealthIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="一次性健康综合诊察" 
              secondary="线下线上、室内室外诊察活动相结合" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <MedicationIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="提供五套康复调理方案" 
              secondary="药疗、食疗、理疗、功疗、心疗" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <SpaIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="根据方案提供调理和指导服务" 
              secondary="互助、师助调理，自助、线上指导和代操作服务" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CommunityIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="招募社区客户会员、自助、互助、师助诊察调理人才" 
              secondary="健康管理师、康复理疗师优先(详情索取社区章程)，并教授诊察调理技术方法" 
            />
          </ListItem>
        </List>
      </Paper>

      {/* 一诊五疗内容 */}
      <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <HealthIcon sx={{ mr: 1 }} /> 一诊五疗内容
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
            一诊：健康综合诊察(健康师+ai智能)
          </Typography>
          <Typography variant="body1" paragraph>
            包括脉诊、面诊、舌诊、闻诊、问诊、目诊、耳诊、手诊、脊诊、腹诊、脐诊、经诊、易诊、五运六气诊法等多种诊法。
          </Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
          五疗：五种调理方案
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={isMedium ? 12 : 6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <MedicationIcon sx={{ mr: 1 }} /> 药疗
                </Typography>
                <Typography variant="body2">
                  药食同源之药膳、药饮、药酒、药敷、药贴、药浴等
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={isMedium ? 12 : 6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <FoodIcon sx={{ mr: 1 }} /> 食疗
                </Typography>
                <Typography variant="body2">
                  药食同源之食疗方案（五谷、五果、五肉、五蔬、五色、五性、五气、五味等）
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={isMedium ? 12 : 6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpaIcon sx={{ mr: 1 }} /> 理疗
                </Typography>
                <Typography variant="body2">
                  推拿、震腹、艾灸、刮痧、拔罐、刺经、点穴、拨筋、散结等。调理头、颈、肩、腰、腿、脚、胸、腹疼痛及经络、脏腑、气血、筋骨、神经、脉管、肌肤等问题
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={isMedium ? 12 : 6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <MeditationIcon sx={{ mr: 1 }} /> 功疗
                </Typography>
                <Typography variant="body2">
                  太极禅道健身功法、易筋经、五禽戏、六字诀、八段锦、太极拳等
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <HeartIcon sx={{ mr: 1 }} /> 心疗
                </Typography>
                <Typography variant="body2">
                  情志、心诀、震频、丹道、禅修等心神疗法
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 温馨提示和价格 */}
      <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
        <Typography variant="h6" component="div" sx={{ color: 'error.main', mb: 2, fontWeight: 'bold' }}>
          温馨提示：健康诊察和调理方案不能代替医疗机构诊断治疗！
        </Typography>
        
        <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'medium' }}>
          咨询调理价格：
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemText primary="健康咨询费每人次10元" />
          </ListItem>
          <ListItem>
            <ListItemText primary="调理方案每项10元" />
          </ListItem>
          <ListItem>
            <ListItemText primary="调理费每分钟1-2元(互助1元，师助2元)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="指导费每分钟1元" />
          </ListItem>
          <ListItem>
            <ListItemText primary="代操作工时费每分钟2元，材料、器材等其他成本费用自理" />
          </ListItem>
          <ListItem>
            <ListItemText primary="社区成员之间可使用积分支付，可互相免费或折扣服务" />
          </ListItem>
        </List>
      </Paper>

      {/* 联系方式 */}
      <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <ContactIcon sx={{ mr: 1 }} /> 联系我们
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon color="primary" sx={{ mr: 2 }} />
              <Typography variant="h6">咨询热线：18611703615</Typography>
            </Box>
            <Typography variant="body1" paragraph>
              太极禅道互助健康社区
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" size="large">
                加入社区
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>社区微信</Typography>
              <Box sx={{ 
                border: '1px dashed #ccc', 
                p: 2, 
                width: '150px', 
                height: '150px', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color="text.secondary">
                  微信二维码
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default About;