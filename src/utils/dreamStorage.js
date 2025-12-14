// 梦境本地存储工具类
// 使用 localStorage 保存用户的梦境数据

const STORAGE_KEY = 'dream3_user_dreams';

export const dreamStorage = {
  // 获取所有梦境
  getAllDreams() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取梦境失败:', error);
      return [];
    }
  },

  // 保存新梦境
  saveDream(dreamData) {
    try {
      const dreams = this.getAllDreams();
      const newDream = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...dreamData
      };
      dreams.unshift(newDream); // 新梦境放在最前面
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
      console.log('✅ 梦境已保存到本地:', newDream.id);
      return newDream;
    } catch (error) {
      console.error('❌ 保存梦境失败:', error);
      return null;
    }
  },

  // 获取最近的 N 个梦境
  getRecentDreams(count = 10) {
    const dreams = this.getAllDreams();
    return dreams.slice(0, count);
  },

  // 获取梦境总数
  getDreamCount() {
    return this.getAllDreams().length;
  },

  // 删除梦境
  deleteDream(id) {
    try {
      const dreams = this.getAllDreams();
      const filtered = dreams.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log('🗑️ 梦境已删除:', id);
      return true;
    } catch (error) {
      console.error('删除梦境失败:', error);
      return false;
    }
  },

  // 清空所有梦境
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🧹 所有梦境已清空');
      return true;
    } catch (error) {
      console.error('清空梦境失败:', error);
      return false;
    }
  },

  // 删除最旧的梦境（用于保持存储空间）
  deleteOldest() {
    try {
      const dreams = this.getAllDreams();
      if (dreams.length === 0) return false;

      // 找到最旧的梦境（timestamp 最小）
      const oldest = dreams.reduce((min, d) =>
        new Date(d.timestamp) < new Date(min.timestamp) ? d : min
      );

      this.deleteDream(oldest.id);
      console.log('🗑️ 删除最旧梦境以释放空间:', oldest.id);
      return true;
    } catch (error) {
      console.error('删除最旧梦境失败:', error);
      return false;
    }
  }
};
