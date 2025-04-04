// subscriptionController.js
const db = require('../utils/db');
const cache = require('../utils/cache')

async function subscribe(req, res) {
  const {
    work_order_id,
    openid
  } = req.body;

  // 参数校验
  if (!work_order_id || !openid) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数'
    });
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

// 获取access_token工具函数
async function getAccessToken() {
  const cacheKey = 'wechat_access_token';
  let token = await cache.get(cacheKey);

  // 不要明文存储密钥！应使用环境变量
  const APPID = process.env.WX_APPID; // 从环境变量获取
  const SECRET = process.env.WX_SECRET;

  if (!token) {
    const {
      data
    } = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`
    );
    token = data.access_token;
    await cache.set(cacheKey, token, data.expires_in - 60);
  }

  return {
    access_token: token
  };
}

module.exports = {
  subscribe,
  getAccessToken
};