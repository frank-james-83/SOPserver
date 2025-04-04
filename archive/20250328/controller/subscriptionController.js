// subscriptionController.js
const db = require('./db');

async function subscribe(req, res) {
  const { work_order_id, openid } = req.body;

  // 参数校验
  if (!work_order_id || !openid) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' });
  }

  try {
    // 使用 ON DUPLICATE KEY UPDATE 语法
    const sql = `
      INSERT INTO subscriptions 
        (openid, work_order_id, subscribed, created_at, updated_at)
      VALUES 
        (?, ?, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        subscribed = VALUES(subscribed),
        updated_at = NOW()
    `;

    await db.query(sql, [openid, work_order_id]);

    res.json({ 
      code: 0, 
      message: '订阅成功',
      data: {
        subscribed: true
      }
    });
  } catch (error) {
    console.error('订阅失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '服务器内部错误',
      detail: error.message 
    });
  }
}

module.exports = {
  subscribe
};