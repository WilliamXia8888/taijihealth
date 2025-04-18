import React, { createContext, useContext, useState } from 'react';

// 创建上下文
const AuthContext = createContext();

// 用户角色常量
export const USER_ROLES = {
  REGULAR: 'regular',
  MEMBER: 'member',
  EXPERT: 'expert',
  ADMIN: 'admin'
};

// 在线专家列表 - 全局状态
let onlineExperts = [];

// 创建提供者组件
export function AuthProvider({ children }) {
  // 添加在线专家状态管理
  const [onlineExpertsState, setOnlineExpertsState] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 更新专家在线状态
  const updateExpertOnlineStatus = (expertId, isOnline) => {
    if (!expertId) return; // 防止无效的专家ID
    
    // 确保专家ID是数字类型
    const numericExpertId = typeof expertId === 'string' ? parseInt(expertId, 10) : expertId;
    
    if (isOnline) {
      // 添加到在线列表
      if (!onlineExperts.includes(numericExpertId)) {
        // 更新全局变量和状态
        onlineExperts = [...onlineExperts, numericExpertId];
        setOnlineExpertsState([...onlineExperts]); // 使用新数组确保状态更新
        console.log(`专家 ID:${numericExpertId} 已上线，当前在线专家:`, onlineExperts);
        
        // 广播专家上线事件
        if (window.socket) {
          try {
            window.socket.emit('expert-status-change', {
              expertId: numericExpertId,
              isOnline: true,
              timestamp: new Date().toISOString()
            });
            console.log(`已发送专家上线广播，专家ID: ${numericExpertId}`);
          } catch (error) {
            console.error('广播专家上线状态失败:', error);
          }
        }
        
        // 强制更新DOM以反映专家在线状态
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('expert-status-updated', {
            detail: { expertId: numericExpertId, isOnline: true }
          }));
        }, 100);
      }
    } else {
      // 从在线列表移除
      onlineExperts = onlineExperts.filter(id => id !== numericExpertId);
      setOnlineExpertsState([...onlineExperts]); // 使用新数组确保状态更新
      console.log(`专家 ID:${numericExpertId} 已下线，当前在线专家:`, onlineExperts);
      
      // 广播专家下线事件
      if (window.socket) {
        try {
          window.socket.emit('expert-status-change', {
            expertId: numericExpertId,
            isOnline: false,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('广播专家下线状态失败:', error);
        }
      }
      
      // 强制更新DOM以反映专家在线状态
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('expert-status-updated', {
          detail: { expertId: numericExpertId, isOnline: false }
        }));
      }, 100);
    }
  };
  
  // 检查专家是否在线
  const isExpertOnline = (expertId) => {
    if (!expertId) return false;
    // 确保专家ID是数字类型进行比较
    const numericExpertId = typeof expertId === 'string' ? parseInt(expertId, 10) : expertId;
    const isOnline = onlineExperts.includes(numericExpertId);
    console.log(`检查专家 ID:${numericExpertId} 在线状态: ${isOnline}，当前在线专家:`, onlineExperts);
    return isOnline;
  };
  
  // 获取所有在线专家
  const getOnlineExperts = () => {
    return onlineExperts;
  };

  // 登录函数
  const login = async (username, password, role = USER_ROLES.REGULAR) => {
    setLoading(true);
    try {
      // 记录登录入口角色，用于后续自动跳转
      const loginEntryRole = role;
      // 模拟用户数据库，实际项目中应该从后端API获取
      const registeredUsers = {
        'admin': { password: 'admin123', role: USER_ROLES.ADMIN },
        'expert1': { password: 'expert123', role: USER_ROLES.EXPERT, expertId: 1, specialty: '传统健康诊断', expertApproved: true }, // 对应夏健康师
        'expert2': { password: 'expert123', role: USER_ROLES.EXPERT, expertId: 2, specialty: '传统理疗', expertApproved: true }, // 对应夏理疗师
        'expert3': { password: 'expert123', role: USER_ROLES.EXPERT, expertId: 3, specialty: '传统调理', expertApproved: true }, // 对应张调理师
        'expert4': { password: 'expert123', role: USER_ROLES.EXPERT, expertId: 4, specialty: '太极养生', expertApproved: true }, // 对应张调理师
        'expert5': { password: 'expert123', role: USER_ROLES.EXPERT, expertId: 5, specialty: '中医养生', expertApproved: true },
        'expert6': { password: 'expert123', role: USER_ROLES.EXPERT, expertId: 6, specialty: '经络调理', expertApproved: true },
        'member': { password: 'member123', role: USER_ROLES.MEMBER },
        'user': { password: 'user123', role: USER_ROLES.REGULAR }
      };
      
      // 合并全局注册的用户（如果存在）
      if (window.registeredUsers) {
        Object.assign(registeredUsers, window.registeredUsers);
      }
      
      console.log(`尝试登录用户: ${username}，选择角色: ${role}`);
      
      // 验证用户是否存在
      if (!registeredUsers[username]) {
        console.error('登录失败: 用户不存在');
        return false;
      }
      
      // 放宽密码验证，允许使用初始密码登录
      // 对于专家账号，允许使用expert123作为通用密码
      // 对于管理员账号，允许使用admin123作为通用密码
      // 对于会员账号，允许使用member123作为通用密码
      // 对于普通用户账号，允许使用user123作为通用密码
      const userRole = registeredUsers[username].role;
      const defaultPasswords = {
        [USER_ROLES.EXPERT]: 'expert123',
        [USER_ROLES.ADMIN]: 'admin123',
        [USER_ROLES.MEMBER]: 'member123',
        [USER_ROLES.REGULAR]: 'user123'
      };
      
      // 验证密码是否正确（允许使用默认密码或注册时设置的密码）
      const isDefaultPasswordValid = defaultPasswords[userRole] === password;
      const isUserPasswordValid = registeredUsers[username].password === password;
      
      if (!isDefaultPasswordValid && !isUserPasswordValid) {
        console.error('登录失败: 密码错误');
        return false;
      }
      
      // 获取用户的实际角色
      const actualRole = registeredUsers[username].role;
      
      // 放宽角色验证，允许更灵活的登录方式
      // 1. 允许专家从任何入口登录
      // 2. 允许会员和普通用户互相切换
      // 3. 允许管理员从任何入口登录
      let allowLogin = true;
      
      // 只有当角色不匹配且不符合特殊情况时才拒绝登录
      if (role !== actualRole) {
        // 特殊情况：会员和普通用户可以互相切换
        const isMemberOrRegularSwitch = (
          (role === USER_ROLES.MEMBER && actualRole === USER_ROLES.REGULAR) ||
          (role === USER_ROLES.REGULAR && actualRole === USER_ROLES.MEMBER)
        );
        
        // 特殊情况：专家可以从任何入口登录
        const isExpertUser = actualRole === USER_ROLES.EXPERT;
        
        // 特殊情况：管理员可以从任何入口登录
        const isAdminUser = actualRole === USER_ROLES.ADMIN;
        
        // 如果不符合任何特殊情况，则拒绝登录
        if (!(isMemberOrRegularSwitch || isExpertUser || isAdminUser)) {
          console.error(`登录失败: 用户 ${username} 没有 ${role} 角色权限`);
          allowLogin = false;
          return false;
        }
      }
      
      // 创建用户数据对象
      const userData = { 
        id: username, // 使用用户名作为ID
        username,
        role: actualRole,
        isExpert: actualRole === USER_ROLES.EXPERT,
        // 检查专家是否已被批准，如果registeredUsers中有明确设置则使用，否则默认为false
        expertApproved: actualRole === USER_ROLES.EXPERT ? 
          (registeredUsers[username].expertApproved !== undefined ? registeredUsers[username].expertApproved : false) : 
          false,
        isMember: actualRole === USER_ROLES.MEMBER || role === USER_ROLES.MEMBER, // 允许以会员身份登录
        isAdmin: actualRole === USER_ROLES.ADMIN,
        // 对于新注册用户，可能没有expertId和specialty
        expertId: registeredUsers[username].expertId || null, // 如果是专家，关联到专家ID
        specialty: registeredUsers[username].specialty || '', // 专家专业
        phone: registeredUsers[username].phone || '', // 添加手机号信息
        avatar: registeredUsers[username].avatar || '' // 添加头像信息
      };
      
      // 如果是新注册用户，根据选择的角色更新用户数据
      if (window.registeredUsers && window.registeredUsers[username]) {
        if (role === USER_ROLES.MEMBER) {
          userData.isMember = true;
          userData.role = USER_ROLES.MEMBER;
        }
      }
      
      // 如果是专家角色，自动更新在线状态
      if (actualRole === USER_ROLES.EXPERT && userData.expertId) {
        console.log(`专家 ${userData.username} (ID: ${userData.expertId}) 登录成功，设置在线状态`);
        
        // 强制更新专家在线状态
        updateExpertOnlineStatus(userData.expertId, true);
        
        // 通知管理员和其他用户专家上线
        if (window.socket) {
          window.socket.emit('expert-login', {
            expertId: userData.expertId,
            username: userData.username,
            specialty: userData.specialty,
            timestamp: new Date().toISOString()
          });
          console.log(`已发送专家登录通知，专家ID: ${userData.expertId}`);
        }
        
        // 确保专家在线状态被正确设置 - 多次尝试
        const maxRetries = 3;
        let retryCount = 0;
        
        const ensureOnlineStatus = () => {
          if (!isExpertOnline(userData.expertId) && retryCount < maxRetries) {
            console.log(`重试设置专家 ${userData.username} (ID: ${userData.expertId}) 在线状态，尝试 ${retryCount + 1}/${maxRetries}`);
            updateExpertOnlineStatus(userData.expertId, true);
            retryCount++;
            setTimeout(ensureOnlineStatus, 500);
          }
        };
        
        setTimeout(ensureOnlineStatus, 500);
      }
      
      // 如果是管理员，设置管理员在线状态
      if (actualRole === USER_ROLES.ADMIN) {
        if (window.socket) {
          window.socket.emit('admin-login', {
            adminId: userData.id,
            username: userData.username,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      setCurrentUser(userData);
      
      // 登录成功后，根据角色自动跳转到对应页面
      if (window && window.navigateAfterLogin) {
        // 如果已经有导航函数，则使用它
        const targetPath = getTargetPathByRole(actualRole, loginEntryRole);
        if (targetPath) {
          console.log(`用户 ${username} 登录成功，自动跳转到: ${targetPath}`);
          window.navigateAfterLogin(targetPath);
        }
      }
      
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 注册函数
  const register = async (username, phone, password, email = '', isExpert = false, isMember = false) => {
    setLoading(true);
    try {
      // 这里应该是实际的注册逻辑，应该调用后端API
      console.log(`注册用户: ${username}, 手机号: ${phone}, 邮箱: ${email}, 是否专家: ${isExpert}, 是否会员: ${isMember}`);
      
      // 检查用户名是否已存在
      if (window.registeredUsers && window.registeredUsers[username]) {
        console.error('注册失败: 用户名已存在');
        return false;
      }
      
      // 生成唯一ID
      const userId = Date.now();
      const expertId = isExpert ? userId : null; // 如果是专家，使用相同ID作为专家ID
      
      // 创建用户数据对象
      const userData = { 
        id: userId, 
        username, 
        phone, 
        email,
        role: isExpert ? USER_ROLES.EXPERT : 
              isMember ? USER_ROLES.MEMBER : USER_ROLES.REGULAR,
        isExpert: isExpert,
        expertApproved: false, // 专家需要管理员审核
        isMember: isMember,
        expertId: expertId, // 添加专家ID
        specialty: '', // 专业领域，后续可更新
        avatar: `/pictures/${Math.floor(Math.random() * 5) + 1}.jpg` // 随机分配头像
      };
      
      // 将新注册的用户添加到registeredUsers对象中，以便后续登录验证
      // 注意：这里是模拟实现，实际项目中应该将用户信息保存到数据库
      if (window.registeredUsers === undefined) {
        window.registeredUsers = {};
      }
      
      window.registeredUsers[username] = {
        id: userId,
        password: password,
        role: userData.role,
        phone: phone,
        email: email,
        isExpert: isExpert,
        expertApproved: false,
        isMember: isMember,
        expertId: expertId,
        specialty: '',
        avatar: userData.avatar
      };
      
      console.log('用户注册成功，已添加到用户列表:', username);
      console.log('注册用户数据:', window.registeredUsers[username]);
      
      // 如果是专家注册，通知管理员有新的专家申请
      if (isExpert && window.socket) {
        try {
          window.socket.emit('expert-application', {
            expertId: expertId,
            username: username,
            timestamp: new Date().toISOString()
          });
          console.log(`已发送专家申请通知，专家ID: ${expertId}`);
        } catch (error) {
          console.error('发送专家申请通知失败:', error);
        }
      }
      
      // 注册成功后自动登录
      setCurrentUser(userData);
      
      // 登录成功后，根据角色自动跳转到对应页面
      if (window && window.navigateAfterLogin) {
        // 如果已经有导航函数，则使用它
        const targetPath = getTargetPathByRole(actualRole, loginEntryRole);
        if (targetPath) {
          console.log(`用户 ${username} 登录成功，自动跳转到: ${targetPath}`);
          window.navigateAfterLogin(targetPath);
        }
      }
      
      return true;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 申请成为专家
  const applyForExpert = async (specialty, introduction) => {
    if (!currentUser) return false;
    
    setLoading(true);
    try {
      // 这里应该是实际的申请逻辑，应该调用后端API
      console.log(`用户 ${currentUser.username} 申请成为专家，专业: ${specialty}`);
      
      // 模拟API调用
      // const response = await fetch('/api/experts/apply', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: currentUser.id, specialty, introduction })
      // });
      
      // 更新用户状态
      setCurrentUser(prev => ({
        ...prev,
        isExpert: true,
        expertApproved: false,
        specialty,
        introduction
      }));
      
      // 更新全局注册用户数据
      if (window.registeredUsers && window.registeredUsers[currentUser.username]) {
        window.registeredUsers[currentUser.username].isExpert = true;
        window.registeredUsers[currentUser.username].expertApproved = false;
        window.registeredUsers[currentUser.username].specialty = specialty;
        window.registeredUsers[currentUser.username].introduction = introduction;
        
        // 如果没有expertId，则创建一个
        if (!window.registeredUsers[currentUser.username].expertId) {
          const expertId = Date.now();
          window.registeredUsers[currentUser.username].expertId = expertId;
          currentUser.expertId = expertId;
        }
        
        // 通知管理员有新的专家申请
        if (window.socket) {
          try {
            window.socket.emit('expert-application', {
              expertId: currentUser.expertId,
              username: currentUser.username,
              specialty: specialty,
              timestamp: new Date().toISOString()
            });
            console.log(`已发送专家申请通知，专家ID: ${currentUser.expertId}`);
          } catch (error) {
            console.error('发送专家申请通知失败:', error);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('专家申请失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 管理员审核专家申请
  const approveExpert = async (expertId, approved) => {
    if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) return false;
    
    setLoading(true);
    try {
      // 这里应该是实际的审核逻辑，应该调用后端API
      console.log(`管理员 ${currentUser.username} ${approved ? '批准' : '拒绝'}专家申请，专家ID: ${expertId}`);
      
      // 模拟API调用
      // const response = await fetch('/api/admin/experts/approve', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ expertId, approved })
      // });
      
      // 更新全局注册用户数据，将专家状态设置为已批准
      if (window.registeredUsers) {
        // 查找对应的用户名
        const expertUsername = Object.keys(window.registeredUsers).find(username => {
          return window.registeredUsers[username].id === expertId || 
                 window.registeredUsers[username].expertId === expertId;
        });
        
        if (expertUsername) {
          // 更新专家审批状态
          window.registeredUsers[expertUsername].expertApproved = approved;
          console.log(`专家 ${expertUsername} 审批状态已更新为: ${approved ? '已批准' : '已拒绝'}`);
          
          // 为新批准的专家设置默认密码
          if (approved && !window.registeredUsers[expertUsername].password) {
            const defaultPassword = 'expert123';
            window.registeredUsers[expertUsername].password = defaultPassword;
            console.log(`已为专家 ${expertUsername} 设置初始密码`);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('专家审核失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    setCurrentUser(null);
  };

  // 检查用户是否有特定角色
  const hasRole = (role) => {
    return currentUser && currentUser.role === role;
  };
  
  // 检查用户是否是专家
  const isExpert = () => {
    return currentUser && currentUser.isExpert === true;
  };
  
  // 检查用户是否是已审核的专家
  const isApprovedExpert = () => {
    return currentUser && currentUser.isExpert === true && currentUser.expertApproved === true;
  };
  
  // 检查用户是否是管理员
  const isAdmin = () => {
    return hasRole(USER_ROLES.ADMIN);
  };
  
  // 检查用户是否是会员
  const isMember = () => {
    return currentUser && (currentUser.isMember === true || hasRole(USER_ROLES.MEMBER));
  };
  
  // 根据角色获取登录后的目标路径
  const getTargetPathByRole = (actualRole, entryRole) => {
    // 优先使用实际角色
    switch (actualRole) {
      case USER_ROLES.ADMIN:
        return '/admin';
      case USER_ROLES.EXPERT:
        return '/expert';
      case USER_ROLES.MEMBER:
        return '/member';
      case USER_ROLES.REGULAR:
        return '/user';
      default:
        // 如果没有明确的角色，使用登录入口角色
        switch (entryRole) {
          case USER_ROLES.ADMIN:
            return '/admin';
          case USER_ROLES.EXPERT:
            return '/expert';
          case USER_ROLES.MEMBER:
            return '/member';
          case USER_ROLES.REGULAR:
            return '/user';
          default:
            return '/';
        }
    }
  };
  
  // 上下文值
  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    applyForExpert,
    approveExpert,
    hasRole,
    isExpert,
    isApprovedExpert,
    isAdmin,
    isMember,
    USER_ROLES,
    // 专家在线状态管理
    updateExpertOnlineStatus,
    isExpertOnline,
    getOnlineExperts,
    onlineExpertsState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义钩子，用于访问上下文
export function useAuth() {
  return useContext(AuthContext);
}