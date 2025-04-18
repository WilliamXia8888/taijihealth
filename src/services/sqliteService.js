/**
 * SQLite数据库服务
 * 提供SQLite数据库操作的接口
 */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// 确保数据目录存在
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 数据库文件路径
const DB_PATH = path.join(DATA_DIR, 'taijihealth.db');

// 初始化数据库连接
let dbPromise = null;

/**
 * 获取数据库连接
 * @returns {Promise<sqlite.Database>} 数据库连接
 */
async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    // 初始化数据库表
    const db = await dbPromise;
    await initDatabase(db);
  }
  
  return dbPromise;
}

/**
 * 初始化数据库表结构
 * @param {sqlite.Database} db 数据库连接
 */
async function initDatabase(db) {
  // 用户表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 健康档案表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      diagnosis TEXT,
      treatments TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 脉诊记录表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pulse_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 舌诊记录表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tongue_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 症状记录表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 健康知识库文章表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 社区论坛帖子表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 论坛评论表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES forum_posts (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 积分记录表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  console.log('数据库表初始化完成');
}

// 用户服务
const userService = {
  // 注册新用户
  async register(username, phone, password, email = '') {
    const db = await getDb();
    try {
      // 检查users表是否有phone字段
      const tableInfo = await db.all("PRAGMA table_info(users)");
      const hasPhoneField = tableInfo.some(column => column.name === 'phone');
      
      // 如果没有phone字段，添加该字段
      if (!hasPhoneField) {
        await db.run('ALTER TABLE users ADD COLUMN phone TEXT');
      }
      
      const result = await db.run(
        'INSERT INTO users (username, phone, email, password) VALUES (?, ?, ?, ?)',
        [username, phone, email, password]
      );
      return result.lastID;
    } catch (error) {
      console.error('注册用户失败:', error);
      throw error;
    }
  },
  
  // 用户登录
  async login(username, password) {
    const db = await getDb();
    try {
      const user = await db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
      return user;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },
  
  // 获取用户信息
  async getUserById(userId) {
    const db = await getDb();
    try {
      return await db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId]);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
};

// 健康档案服务
const healthRecordService = {
  // 保存诊断结果
  async saveDiagnosis(userId, diagnosis, treatments) {
    const db = await getDb();
    try {
      const result = await db.run(
        'INSERT INTO health_records (user_id, diagnosis, treatments) VALUES (?, ?, ?)',
        [userId, JSON.stringify(diagnosis), JSON.stringify(treatments)]
      );
      return result.lastID;
    } catch (error) {
      console.error('保存诊断结果失败:', error);
      throw error;
    }
  },
  
  // 获取用户的健康档案
  async getUserHealthRecords(userId) {
    const db = await getDb();
    try {
      const records = await db.all('SELECT * FROM health_records WHERE user_id = ? ORDER BY date DESC', [userId]);
      return records.map(record => ({
        ...record,
        diagnosis: JSON.parse(record.diagnosis || '{}'),
        treatments: JSON.parse(record.treatments || '{}')
      }));
    } catch (error) {
      console.error('获取健康档案失败:', error);
      throw error;
    }
  }
};

// 导出服务
export {
  getDb,
  userService,
  healthRecordService
};