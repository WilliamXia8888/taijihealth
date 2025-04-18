import Dexie from 'dexie';

// 创建数据库实例
const db = new Dexie('taijiHealthDB');

// 定义数据库架构
db.version(1).stores({
  users: '++id, username, email, password, createdAt', // 用户信息
  healthRecords: '++id, userId, date, diagnosis, treatments', // 健康档案
  pulseRecords: '++id, userId, date, description', // 脉诊记录
  tongueRecords: '++id, userId, date, description', // 舌诊记录
  symptoms: '++id, userId, date, description', // 症状记录
  articles: '++id, title, content, category, createdAt', // 健康知识库文章
  forumPosts: '++id, userId, title, content, createdAt', // 社区论坛帖子
  comments: '++id, postId, userId, content, createdAt', // 论坛评论
  points: '++id, userId, points, description, createdAt', // 积分记录
});

// 用户相关操作
export const userService = {
  // 注册新用户
  async register(username, phone, password, email = '') {
    try {
      const id = await db.users.add({
        username,
        phone,
        email,
        password, // 注意：实际应用中应该加密存储密码
        createdAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('注册用户失败:', error);
      throw error;
    }
  },

  // 用户登录
  async login(username, password) {
    try {
      const user = await db.users
        .where('username')
        .equals(username)
        .and(user => user.password === password)
        .first();
      return user;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 获取用户信息
  async getUserById(id) {
    return await db.users.get(id);
  }
};

// 健康档案相关操作
export const healthRecordService = {
  // 添加健康记录
  async addHealthRecord(userId, diagnosis, treatments) {
    try {
      const id = await db.healthRecords.add({
        userId,
        date: new Date(),
        diagnosis,
        treatments
      });
      return id;
    } catch (error) {
      console.error('添加健康记录失败:', error);
      throw error;
    }
  },

  // 获取用户的所有健康记录
  async getHealthRecordsByUserId(userId) {
    return await db.healthRecords
      .where('userId')
      .equals(userId)
      .reverse()
      .toArray();
  },

  // 添加脉诊记录
  async addPulseRecord(userId, description) {
    try {
      const id = await db.pulseRecords.add({
        userId,
        date: new Date(),
        description
      });
      return id;
    } catch (error) {
      console.error('添加脉诊记录失败:', error);
      throw error;
    }
  },

  // 添加舌诊记录
  async addTongueRecord(userId, description) {
    try {
      const id = await db.tongueRecords.add({
        userId,
        date: new Date(),
        description
      });
      return id;
    } catch (error) {
      console.error('添加舌诊记录失败:', error);
      throw error;
    }
  },

  // 添加症状记录
  async addSymptomRecord(userId, description) {
    try {
      const id = await db.symptoms.add({
        userId,
        date: new Date(),
        description
      });
      return id;
    } catch (error) {
      console.error('添加症状记录失败:', error);
      throw error;
    }
  },

  // 获取最近的诊断记录
  async getLatestDiagnosticRecords(userId) {
    const pulseRecord = await db.pulseRecords
      .where('userId')
      .equals(userId)
      .last();
    
    const tongueRecord = await db.tongueRecords
      .where('userId')
      .equals(userId)
      .last();
    
    const symptomRecord = await db.symptoms
      .where('userId')
      .equals(userId)
      .last();
    
    return {
      pulseRecord,
      tongueRecord,
      symptomRecord
    };
  }
};

// 知识库相关操作
export const knowledgeService = {
  // 添加文章
  async addArticle(title, content, category) {
    try {
      const id = await db.articles.add({
        title,
        content,
        category,
        createdAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('添加文章失败:', error);
      throw error;
    }
  },

  // 获取所有文章
  async getAllArticles() {
    return await db.articles.toArray();
  },

  // 按类别获取文章
  async getArticlesByCategory(category) {
    return await db.articles
      .where('category')
      .equals(category)
      .toArray();
  }
};

// 论坛相关操作
export const forumService = {
  // 发布帖子
  async createPost(userId, title, content) {
    try {
      const id = await db.forumPosts.add({
        userId,
        title,
        content,
        createdAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('发布帖子失败:', error);
      throw error;
    }
  },

  // 获取所有帖子
  async getAllPosts() {
    return await db.forumPosts.toArray();
  },

  // 添加评论
  async addComment(postId, userId, content) {
    try {
      const id = await db.comments.add({
        postId,
        userId,
        content,
        createdAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('添加评论失败:', error);
      throw error;
    }
  },

  // 获取帖子的所有评论
  async getCommentsByPostId(postId) {
    return await db.comments
      .where('postId')
      .equals(postId)
      .toArray();
  }
};

// 积分相关操作
export const pointsService = {
  // 添加积分
  async addPoints(userId, points, description) {
    try {
      const id = await db.points.add({
        userId,
        points,
        description,
        createdAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('添加积分失败:', error);
      throw error;
    }
  },

  // 获取用户积分总数
  async getTotalPointsByUserId(userId) {
    const pointsRecords = await db.points
      .where('userId')
      .equals(userId)
      .toArray();
    
    return pointsRecords.reduce((total, record) => total + record.points, 0);
  },

  // 获取用户积分历史
  async getPointsHistoryByUserId(userId) {
    return await db.points
      .where('userId')
      .equals(userId)
      .reverse()
      .toArray();
  }
};

export default db;