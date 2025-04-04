const db = require('../utils/db');

// 创建新SOP版本
exports.createSOPVersion = async (title, operator) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    // 获取最新版本号
    const [version] = await conn.query(
      'SELECT MAX(version) as max FROM sops WHERE title = ?',
      [title]
    );
    
    const newVersion = (version[0].max || 0) + 1;
    
    // 插入新版本
    const [result] = await conn.query(
      `INSERT INTO sops (title, version, operator) 
       VALUES (?, ?, ?)`,
      [title, newVersion, operator]
    );
    
    await conn.commit();
    return { id: result.insertId, version: newVersion };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// 获取SOP版本列表
exports.getSOPVersions = async (title) => {
  const [rows] = await db.query(
    `SELECT id, version, created_at 
     FROM sops 
     WHERE title = ?
     ORDER BY version DESC`,
    [title]
  );
  return rows;
};
