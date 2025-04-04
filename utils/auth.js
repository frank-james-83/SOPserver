module.exports = {
  checkAdmin: (req, res, next) => {
    // ======================
    // 测试环境专用中间件 (仅development生效)
    // ======================
    if (process.env.NODE_ENV === 'development') {
      
      // 允许通过 header 模拟用户角色（仅测试使用）
      if (req.headers['x-test-user-role']) {
        req.user = req.user || {}; // 防止覆盖已存在的user对象
        req.user.role = req.headers['x-test-user-role'];
        console.warn(`[DEV] 使用测试角色: ${req.user.role}`); // 添加警告日志
      }


  }
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    });
  },

  validateApprovalPermission: (req, res, next) => {
    // ======================
    // 测试环境专用中间件 (仅development生效)
    // ======================
    if (process.env.NODE_ENV === 'development') {
      
        // 允许通过 header 模拟用户角色（仅测试使用）
        if (req.headers['x-test-user-role']) {
          req.user = req.user || {}; // 防止覆盖已存在的user对象
          req.user.role = req.headers['x-test-user-role'];
          console.warn(`[DEV] 使用测试角色: ${req.user.role}`); // 添加警告日志
        }


    }
    const allowedRoles = {
      admin: ['repair', 'operator', 'manager', 'admin'],
      manager: ['repair', 'operator']
    };

    const requesterRole = req.user?.role;
    const targetRole = req.body.role;

    if (allowedRoles[requesterRole]?.includes(targetRole)) {
      return next();
    }
    res.status(403).json({
      code: 403,
      message: '权限不足'
    });
  }
};