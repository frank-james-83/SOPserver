// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 路由定义与控制器绑定
// GET /api/user/:id
router.get('/userId/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userController.getUserById(userId);
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
router.get('/users', async (req, res) => {
  try {
    const users = await userController.getAllUsers(); // 调用控制器方法
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




module.exports = router;


