const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

// 获取用户信息
router.post('/getUserInfo', controller.getUserInfo);

// 用户注册
router.post('/register', controller.registerUser);

// 需要管理员权限的路由
const authMiddleware = require('../utils/auth');

// 批准用户
router.post('/approve', authMiddleware.validateApprovalPermission,controller.approveUser);

//1. 用户更新逻辑（方法3改）
router.put('/update', controller.updateUserInfo);


//3. 注销逻辑（方法5）
router.post('/deactivate', controller.deactivateUser);

//方法8禁用> 实现逻辑  admin可以禁用其他账户.
router.post('/disable', authMiddleware.checkAdmin, controller.disableUser);

module.exports = router;
