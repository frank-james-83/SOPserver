// app.js
const express = require('express');
const axios = require('axios'); // 新增这行
require('dotenv').config();

//路由转发功能
const { createProxyMiddleware } = require('http-proxy-middleware');



const app = express();
app.use(express.json());

app.use('/auth', require('./routes/auth/loginRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/subscrib', require('./routes/subscribRoutes'));


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