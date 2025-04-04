// app.js
const express = require('express');
const axios = require('axios'); // 新增这行
require('dotenv').config();

const loginRoutes = require('./routes/auth/loginRoutes'); // 引入路由模块



//路由转发功能
const { createProxyMiddleware } = require('http-proxy-middleware');
const cache = require('./utils/cache')
const subscribe = require('./controller/subscriptionController');
const {
  saveWorkOrder,
  getAllWorkOrders
} = require('./controller/workOrderController');
const {
  getAllUsers,
  getUserById
} = require('./controller/userController');

const app = express();
app.use(express.json());

app.use('/auth', loginRoutes);

app.post('/api/add-work-order', async (req, res) => {
  try {

    const fakeFront = {
      "alarm_id": 1,
      "device_id": 101,
      "repairer_id": 201,
      "priority": "high",
      "status": "pending"
    }
    const workOrder = fakeFront;

    // 创建维修工单
    // const workOrder = req.body;
    const workOrderId = await saveWorkOrder(workOrder);
    res.status(201).json({
      message: 'Work order created',
      id: workOrderId
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create work order',
      error: error.message
    });
  }
});


app.get('/api/sop/:deviceId', (req, res) => {
  // 获取设备SOP
  const sop = getSOP(req.params.deviceId);
  res.json(sop);
});

// 获取单个用户信息
app.get('/api/user/:id', async (req, res) => {
  try {
    const userId = req.params.id; // 从 URL 中获取用户 ID
    const user = await getUserById(userId); // 调用控制器方法
    res.status(200).json({
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// 获取所有用户信息
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers(); // 调用控制器方法
    res.status(200).json({
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

app.get('/api/work-order', async (req, res) => {
  //获取当前所有work-order
  try {
    const workOrders = await getAllWorkOrders();
    res.status(200).json({
      message: 'Work orders retrieved successfully',
      data: workOrders
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch work orders',
      error: error.message
    });
  }
});

// 添加订阅路由
app.post('/api/subscribe', async (req, res) => {
  
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
    subscribe(req, res)

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
app.post('/send-subscribe-msg', async (ctx) => {
  // 1. 获取access_token（需缓存）
  const { access_token } = await getAccessToken();
  
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

// 获取access_token工具函数
async function getAccessToken() {
  const cacheKey = 'wechat_access_token';
  let token = await cache.get(cacheKey);

    // 不要明文存储密钥！应使用环境变量
const APPID = process.env.WX_APPID; // 从环境变量获取
const SECRET = process.env.WX_SECRET; 
  
  if (!token) {
    const { data } = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`
    );
    token = data.access_token;
    console.log("token is:",token);
    await cache.set(cacheKey, token, data.expires_in - 60);
  }
  
  return { access_token: token };
}

// 添加API转发中间件
app.use('/eitapi', createProxyMiddleware({
  target: 'http://507VMPMMI/eitapi', // 根据实际地址替换
  changeOrigin: true,
  pathRewrite: {
    '^/eitapi': '' // 移除代理路径前缀
  },
  timeout: 3000,
  onError: (err, req, res) => {
    console.error('代理服务器连接失败:', err);
    res.status(502).json({ code: 502, message: '网关错误' });
  }
}));

app.listen(3000, () => { 
  console.log('Server is running on port 3000');
});