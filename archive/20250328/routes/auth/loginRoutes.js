// loginRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios'); 

// // 登录相关路由
// router.post('/login', (req, res) => {
//   // 处理登录逻辑
//   res.send('Login Success');
// });

// router.post('/logout', (req, res) => {
//   // 处理登出逻辑
//   res.send('Logout Success');
// });

router.post('/decrypt', async (req, res) => {
  const {
    code,
    iv,
    encryptedData
  } = req.body;

  // 不要明文存储密钥！应使用环境变量
  const APPID = process.env.WX_APPID; // 从环境变量获取
  const SECRET = process.env.WX_SECRET;
  // 1. 用code换取session_key
  const wechatRes = await axios.get(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`
  );

  // 2. 解密数据
  const sessionKey = wechatRes.data.session_key;
  const decryptedData = decryptData(encryptedData, iv, sessionKey);
  console.log(decryptedData)

  // 3. 返回解密结果
  res.json({
    code: 0,
    decryptedData,
    sessionKey
  });
});

// 解密工具函数
function decryptData(encryptedData, iv, sessionKey) {
  const _sessionKey = Buffer.from(sessionKey, 'base64');
  const _encryptedData = Buffer.from(encryptedData, 'base64');
  const _iv = Buffer.from(iv, 'base64');

  let decipher = crypto.createDecipheriv('aes-128-cbc', _sessionKey, _iv);
  let decoded = decipher.update(_encryptedData, 'binary', 'utf8');
  decoded += decipher.final('utf8');



  return JSON.parse(decoded);
}

router.post('/getUserInfo', async (req, res) => {
  const { code } = req.body
  const APPID = process.env.WX_APPID; // 从环境变量获取
  const SECRET = process.env.WX_SECRET;
  // 微信接口参数
  const params = {
    appid: APPID,
    secret: SECRET,
    js_code: code,
    grant_type: 'authorization_code'
  }

  try {
    // 调用微信接口
    const result = await axios.get('https://api.weixin.qq.com/sns/jscode2session', { params })
    
    // 返回数据结构示例
    // {
    //   openid: "用户唯一标识",
    //   session_key: "会话密钥",
    //   unionid: "联合ID（如果满足条件）"
    // }

    console.log(result.data)
    //fakedata
    res.json({userId:999,userName:"James",isRegistered:true})
  } catch (error) {
    res.status(500).json({ error: '微信接口调用失败' })
  }
})

// 导出路由模块
module.exports = router;