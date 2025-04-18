import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Divider,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// 消息中心组件 - 用于角色间通信
const MessageCenter = ({ open, onClose }) => {
  const { currentUser, isAdmin, isExpert, isMember } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0: 收件箱, 1: 已发送
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);
  
  // 模拟数据 - 实际应用中应该从后端API获取
  useEffect(() => {
    // 根据当前用户角色加载不同的联系人列表
    const loadContacts = () => {
      let contactsList = [];
      
      if (isAdmin()) {
        // 管理员可以看到所有专家和部分用户
        contactsList = [
          { id: 'expert1', name: '夏健康师', role: 'expert', avatar: '/pictures/men1.jpg', unread: 2 },
          { id: 'expert2', name: '夏理疗师', role: 'expert', avatar: '/pictures/men2.jpg', unread: 0 },
          { id: 'expert3', name: '张调理师', role: 'expert', avatar: '/pictures/women1.jpg', unread: 1 },
          { id: 'expert4', name: '张调理师', role: 'expert', avatar: '/pictures/women2.jpg', unread: 0 },
          { id: 'member1', name: '李会员', role: 'member', avatar: '', unread: 3 },
          { id: 'user1', name: '王用户', role: 'user', avatar: '', unread: 0 }
        ];
      } else if (isExpert()) {
        // 专家可以看到管理员和咨询过的用户
        contactsList = [
          { id: 'admin', name: '系统管理员', role: 'admin', avatar: '', unread: 1 },
          { id: 'member1', name: '李会员', role: 'member', avatar: '', unread: 2 },
          { id: 'user1', name: '王用户', role: 'user', avatar: '', unread: 0 }
        ];
      } else {
        // 普通用户和会员可以看到管理员和咨询过的专家
        contactsList = [
          { id: 'admin', name: '系统管理员', role: 'admin', avatar: '', unread: 0 },
          { id: 'expert1', name: '夏健康师', role: 'expert', avatar: '/pictures/men1.jpg', unread: 1 },
          { id: 'expert2', name: '夏理疗师', role: 'expert', avatar: '/pictures/men2.jpg', unread: 0 }
        ];
      }
      
      setContacts(contactsList);
    };
    
    loadContacts();
  }, [isAdmin, isExpert]);
  
  // 加载与选定联系人的消息历史
  useEffect(() => {
    if (selectedContact) {
      setLoading(true);
      
      // 模拟API调用延迟
      setTimeout(() => {
        // 模拟消息数据 - 实际应用中应该从后端API获取
        const mockMessages = [
          {
            id: 1,
            sender: currentUser?.id,
            senderName: currentUser?.username,
            receiver: selectedContact.id,
            receiverName: selectedContact.name,
            content: '您好，有什么可以帮助您的吗？',
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            read: true
          },
          {
            id: 2,
            sender: selectedContact.id,
            senderName: selectedContact.name,
            receiver: currentUser?.id,
            receiverName: currentUser?.username,
            content: '我想咨询一下关于太极养生的问题',
            timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
            read: true
          },
          {
            id: 3,
            sender: currentUser?.id,
            senderName: currentUser?.username,
            receiver: selectedContact.id,
            receiverName: selectedContact.name,
            content: '好的，请问您具体想了解哪方面的内容？',
            timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
            read: true
          },
          {
            id: 4,
            sender: selectedContact.id,
            senderName: selectedContact.name,
            receiver: currentUser?.id,
            receiverName: currentUser?.username,
            content: '我想了解太极养生对改善睡眠有什么帮助？',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            read: false
          }
        ];
        
        setMessages(mockMessages);
        setLoading(false);
        
        // 更新联系人列表中的未读消息数
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === selectedContact.id ? { ...contact, unread: 0 } : contact
          )
        );
        
        // 滚动到最新消息
        scrollToBottom();
      }, 800);
    }
  }, [selectedContact, currentUser]);
  
  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 处理发送消息
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    const newMsg = {
      id: Date.now(),
      sender: currentUser?.id,
      senderName: currentUser?.username,
      receiver: selectedContact.id,
      receiverName: selectedContact.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // 滚动到最新消息
    setTimeout(scrollToBottom, 100);
    
    // 实际应用中，这里应该调用API将消息发送到后端
    console.log('发送消息:', newMsg);
  };
  
  // 处理按键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 处理菜单打开
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // 处理菜单关闭
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // 处理筛选菜单打开
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // 处理筛选菜单关闭
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };
  
  // 处理删除对话
  const handleDeleteConversation = () => {
    // 实际应用中，这里应该调用API删除对话
    setMessages([]);
    handleMenuClose();
  };
  
  // 处理刷新消息
  const handleRefreshMessages = () => {
    if (selectedContact) {
      // 重新加载消息
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
    handleMenuClose();
  };
  
  // 处理筛选联系人
  const handleFilterContacts = (role) => {
    // 实际应用中，这里应该根据角色筛选联系人
    console.log('筛选联系人:', role);
    handleFilterMenuClose();
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // 计算总未读消息数
  const totalUnread = contacts.reduce((sum, contact) => sum + contact.unread, 0);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            消息中心
            {totalUnread > 0 && (
              <Badge 
                color="error" 
                badgeContent={totalUnread} 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* 联系人列表 */}
        <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">联系人</Typography>
            <Tooltip title="筛选联系人">
              <IconButton size="small" onClick={handleFilterMenuOpen}>
                <FilterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterMenuClose}
            >
              <MenuItem onClick={() => handleFilterContacts('all')}>全部</MenuItem>
              <MenuItem onClick={() => handleFilterContacts('admin')}>管理员</MenuItem>
              <MenuItem onClick={() => handleFilterContacts('expert')}>专家</MenuItem>
              <MenuItem onClick={() => handleFilterContacts('member')}>会员</MenuItem>
              <MenuItem onClick={() => handleFilterContacts('user')}>普通用户</MenuItem>
            </Menu>
          </Box>
          
          <List sx={{ overflow: 'auto', flexGrow: 1 }}>
            {contacts.map((contact) => (
              <ListItem 
                button 
                key={contact.id}
                selected={selectedContact?.id === contact.id}
                onClick={() => setSelectedContact(contact)}
                sx={{ 
                  bgcolor: selectedContact?.id === contact.id ? 'action.selected' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemAvatar>
                  <Badge 
                    color="error" 
                    badgeContent={contact.unread} 
                    invisible={contact.unread === 0}
                  >
                    <Avatar src={contact.avatar}>
                      {contact.name.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        component="span" 
                        variant="body1"
                        sx={{ fontWeight: contact.unread > 0 ? 'bold' : 'normal' }}
                      >
                        {contact.name}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      component="span" 
                      variant="body2" 
                      color="text.secondary"
                    >
                      {contact.role === 'admin' ? '管理员' : 
                       contact.role === 'expert' ? '专家' : 
                       contact.role === 'member' ? '会员' : '用户'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* 消息区域 */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedContact ? (
            <>
              {/* 对话标题 */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src={selectedContact.avatar} sx={{ mr: 1 }}>
                    {selectedContact.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">{selectedContact.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedContact.role === 'admin' ? '管理员' : 
                       selectedContact.role === 'expert' ? '专家' : 
                       selectedContact.role === 'member' ? '会员' : '用户'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleRefreshMessages}>
                    <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
                    刷新消息
                  </MenuItem>
                  <MenuItem onClick={handleDeleteConversation}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    删除对话
                  </MenuItem>
                </Menu>
              </Box>
              
              {/* 消息列表 */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">暂无消息记录</Typography>
                  </Box>
                ) : (
                  messages.map((message) => {
                    const isSelf = message.sender === currentUser?.id;
                    return (
                      <Box 
                        key={message.id} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: isSelf ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        {!isSelf && (
                          <Avatar 
                            src={selectedContact.avatar} 
                            sx={{ mr: 1, alignSelf: 'flex-end' }}
                          >
                            {selectedContact.name.charAt(0)}
                          </Avatar>
                        )}
                        <Box sx={{ maxWidth: '70%' }}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              bgcolor: isSelf ? 'primary.light' : 'background.paper',
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="body1">{message.content}</Typography>
                          </Paper>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              display: 'block', 
                              mt: 0.5,
                              textAlign: isSelf ? 'right' : 'left'
                            }}
                          >
                            {formatTime(message.timestamp)}
                          </Typography>
                        </Box>
                        {isSelf && (
                          <Avatar 
                            sx={{ ml: 1, alignSelf: 'flex-end' }}
                          >
                            {currentUser?.username?.charAt(0)}
                          </Avatar>
                        )}
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* 消息输入框 */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex' }}>
                  <TextField
                    fullWidth
                    placeholder="输入消息..."
                    multiline
                    maxRows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{ ml: 1 }}
                  >
                    发送
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  选择一个联系人开始对话
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MessageCenter;