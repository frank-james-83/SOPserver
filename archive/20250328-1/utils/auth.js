module.exports = {
  checkAdmin: (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ code: 403, message: '需要管理员权限' });
  },

  checkManagerOrAdmin: (req, res, next) => {
    if (['admin', 'manager'].includes(req.user?.role)) {
      return next();
    }
    res.status(403).json({ code: 403, message: '权限不足' });
  }
};
