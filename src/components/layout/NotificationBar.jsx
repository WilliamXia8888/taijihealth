import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as ExpertIcon,
  Person as UserIcon,
  CardMembership as MemberIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import MessageCenter from '../chat/MessageCenter';

// 通知栏组件 - 用于显示消息通知和打开消息中心
const NotificationBar = () => {
  const { currentUser, isAdmin, isExpert, isMember } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageCenterOpen, setMessageCenterOpen] = useState(false);
  
  // 模拟获取通知数据
  useEffect(() => {
    if (currentUser) {
      // 根据用户角色生成不同的通知
      let mockNotifications = [];
      
      if (isAdmin()) {
        mockNotifications = [
          {
            id: 1,
            type: 'expert',
            sender: 'expert1',
            senderName: '夏健康师',
            content: '有新的专家申请需要审核',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          },
          {
            id: 2,
            type: 'user',
            sender: 'user1',
            senderName: '王用户',
            content: '提交了一个平台问题反馈',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false
          },
          {
            id: 3,
            type: 'system',
            content: '系统更新完成',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true
          }
        ];
      } else if (isExpert()) {
        mockNotifications = [
          {
            id: 1,
            type: 'admin',
            sender: 'admin',
            senderName: '系统管理员',
            content: '您的专家资料已更新',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          },
          {
            id: 2,
            type: 'user',
            sender: 'member1',
            senderName: '李会员',
            content: '预约了您的咨询服务',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false
          },
          {
            id: 3,
            type: 'system',
            content: '您有一条新的评价',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true
          }
        ];
      } else {
        mockNotifications = [
          {
            id: 1,
            type: 'expert',
            sender: 'expert1',
            senderName: '夏健康师',
            content: '回复了您的咨询',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          },
          {
            id: 2,
            type: 'admin',
            sender: 'admin',
            senderName: '系统管理员',
            content: '您的账户信息已更新',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true
          },
          {
            id: 3,
            type: 'system',
            content: '平台活动：太极养生讲座',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true
          }
        ];
      }
      
      setNotifications(mockNotifications);
      
      // 计算未读通知数量
      const unread = mockNotifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    }
  }, [currentUser, isAdmin, isExpert, isMember]);
  
  // 处理打开通知菜单
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // 处理关闭通知菜单
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // 处理打开消息中心
  const handleOpenMessageCenter = () => {
    setMessageCenterOpen(true);
    handleCloseMenu();
  };
  
  // 处理关闭消息中心
  const handleCloseMessageCenter = () => {
    setMessageCenterOpen(false);
  };
  
  // 处理标记通知为已读
  const handleMarkAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // 更新未读数量
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // 处理标记所有通知为已读
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    // 更新未读数量
    setUnreadCount(0);
    
    // 关闭菜单
    handleCloseMenu();
  };
  
  // 获取通知图标
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admin':
        return <AdminIcon fontSize="small" color="error" />;
      case 'expert':
        return <ExpertIcon fontSize="small" color="secondary" />;
      case 'member':
        return <MemberIcon fontSize="small" color="success" />;
      case 'user':
        return <UserIcon fontSize="small" color="info" />;
      default:
        return <NotificationsIcon fontSize="small" color="action" />;
    }
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="消息通知">
          <IconButton color="inherit" onClick={handleOpenMenu}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { width: 320, maxHeight: 500 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            通知
            {unreadCount > 0 && (
              <Badge 
                color="error" 
                badgeContent={unreadCount} 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Button 
            size="small" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            全部已读
          </Button>
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">暂无通知</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleMarkAsRead(notification.id)}
                  button
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.light' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        component="span"
                        sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                      >
                        {notification.senderName ? `${notification.senderName}` : '系统通知'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ 
                            display: 'inline',
                            fontWeight: notification.read ? 'normal' : 'medium'
                          }}
                        >
                          {notification.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button
            startIcon={<MessageIcon />}
            onClick={handleOpenMessageCenter}
            fullWidth
          >
            打开消息中心
          </Button>
        </Box>
      </Menu>
      
      {/* 消息中心对话框 */}
      <MessageCenter 
        open={messageCenterOpen} 
        onClose={handleCloseMessageCenter} 
      />
    </>
  );
};

export default NotificationBar;