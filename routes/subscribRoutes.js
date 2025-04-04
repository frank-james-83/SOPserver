// routes/subscribRoutes.js
const express = require('express');
const router = express.Router();
const subscribController = require('../controllers/subscriptionController');

// 添加订阅路由
router.post('/api/subscribe', async (req, res) => {
  
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
    subscribController.subscribe(req, res)

    res.json({
      code: 0,
      message: '操作成功'
    });
  } catch (error) {
    console.error('订阅失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
});



// 服务端示例（Node.js）
router.post('/send-subscribe-msg', async (ctx) => {
  // 1. 获取access_token（需缓存）
  const { access_token } = await subscribController.getAccessToken();
  
  // 2. 调用微信接口
  const result = await axios.post(
    `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
    ctx.body
  );

  // 3. 处理微信响应
  if (result.data.errcode) {
    ctx.body = { code: -1, msg: result.data.errmsg };
  } else {
    ctx.body = { code: 0, msgid: result.data.msgid };
  }
})



module.exports = router;