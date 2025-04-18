/**
 * 缓存服务
 * 提供本地缓存管理功能
 */
import localforage from 'localforage';

// 配置localforage
localforage.config({
  name: 'taijiHealth',
  storeName: 'healthCache',
  description: '太极禅道健康应用缓存'
});

// 缓存服务对象
const cacheService = {
  /**
   * 设置缓存项
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} expiry 过期时间(毫秒)，默认1小时
   * @returns {Promise<void>}
   */
  async set(key, value, expiry = 3600000) {
    const item = {
      value,
      expiry: Date.now() + expiry,
    };
    await localforage.setItem(key, item);
  },

  /**
   * 获取缓存项
   * @param {string} key 缓存键
   * @returns {Promise<any>} 缓存值，如果不存在或已过期则返回null
   */
  async get(key) {
    const item = await localforage.getItem(key);
    
    // 检查缓存项是否存在
    if (!item) return null;
    
    // 检查缓存项是否过期
    if (Date.now() > item.expiry) {
      await this.remove(key);
      return null;
    }
    
    return item.value;
  },

  /**
   * 移除缓存项
   * @param {string} key 缓存键
   * @returns {Promise<void>}
   */
  async remove(key) {
    await localforage.removeItem(key);
  },

  /**
   * 清除所有缓存
   * @returns {Promise<void>}
   */
  async clear() {
    await localforage.clear();
  },

  /**
   * 获取所有缓存键
   * @returns {Promise<string[]>} 缓存键数组
   */
  async keys() {
    return await localforage.keys();
  },

  /**
   * 获取缓存项数量
   * @returns {Promise<number>} 缓存项数量
   */
  async length() {
    return await localforage.length();
  },

  /**
   * 检查缓存键是否存在
   * @param {string} key 缓存键
   * @returns {Promise<boolean>} 是否存在
   */
  async has(key) {
    return (await this.get(key)) !== null;
  }
};

export default cacheService;