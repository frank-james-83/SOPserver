const db = require('../utils/db');
const {
  hashOpenId,
  generateCode
} = require('../utils/crypto');

module.exports = {
  // 方法1：获取用户信息
  async getUserInfo(req, res) {
    try {
      const openIdHash = hashOpenId(req.body.openId);
      const [users] = await db.query(
        'SELECT id, username, status, role FROM users WHERE open_id_hash = ?',
        [openIdHash]
      );

      if (users.length === 0) {
        return res.json({
          code: 404,
          message: '用户未注册'
        });
      }

      res.json({
        code: 200,
        data: {
          userId: users[0].id,
          username: users[0].username,
          status: users[0].status,
          role: users[0].role,

        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  },

  // 方法2：注册用户
  async registerUser(req, res) {
    const {
      employeeId,
      username,
      role,
      openId
    } = req.body;
    try {
      const [existing] = await db.query(
        'SELECT * FROM users WHERE employee_id = ?',
        [employeeId]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '员工号已存在'
        });
      }

      const registrationCode = generateCode();
      const openIdHash = hashOpenId(openId);

      await db.query(
        `INSERT INTO users 
        (employee_id, username, role, open_id_hash, status, registration_code) 
        VALUES (?, ?, ?, ?, 'pending', ?)`,
        [employeeId, username, role, openIdHash, registrationCode]
      );

      res.json({
        code: 200,
        data: {
          registrationCode
        },
        message: '注册申请已提交，等待审批'
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  },


  //1. 用户更新逻辑（方法3改）
  // userController.js
  async updateUserInfo(req, res) {
    const {
      userId,
      newName,
      role,
    } = req.body;
    try {
      // 验证不可修改字段
      const [existing] = await db.execute(
        'SELECT employee_id, username FROM users WHERE employee_id = ?',
        [userId]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }

      // 仅允许修改名称（根据需求调整）
      await db.execute(
        'UPDATE users SET username = ?, role = ? WHERE employee_id = ?',
        [newName, role, userId]
      );

      res.json({
        code: 200,
        message: '用户信息更新成功'
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  },


  // 方法4：批准用户
  async approveUser(req, res) {
    const {
      employeeId,
      registrationCode
    } = req.body;


    try {
      // 验证权限
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        });
      }

      const [users] = await db.query(
        `SELECT * FROM users 
        WHERE employee_id = ? AND registration_code = ?`,
        [employeeId, registrationCode]
      );

      if (users.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '注册码不匹配'
        });
      }

      await db.query(
        `UPDATE users SET status = 'approved' 
        WHERE employee_id = ?`,
        [employeeId]
      );

      res.json({
        code: 200,
        message: '审批成功'
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  },

  //3. 注销逻辑（方法5）
  async deactivateUser(req, res) {
    try {
      const openIdHash = hashOpenId(req.body.openId);
      const [users] = await db.query(
        'SELECT id, username, status, role FROM users WHERE open_id_hash = ?',
        [openIdHash]
      );

      if (users.length === 0) {
        return res.json({
          code: 404,
          message: '用户未注册'
        });
      }

      // 执行注销标记
      await db.execute(`
        UPDATE users 
        SET 
          username = CONCAT(username, '(已注销)'),
          status = 'deleted'
        WHERE open_id_hash = ?
      `, [openIdHash]);

      res.json({
        code: 200,
        message: '账户已注销'
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  },


//方法8禁用> 实现逻辑  admin可以禁用其他账户.
async disableUser(req, res) {
  try {
    // 获取操作者信息
    const operatorId = req.body.operatorId; // 从认证中间件获取
    const targetUserId = req.body.targetUserId;

    // 校验操作者权限
    const [operator] = await db.execute(
      'SELECT role FROM users WHERE id = ?',
      [operatorId]
    );

    // 权限验证
    if (operator[0].role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可执行此操作'
      });
    }

    // 防止自我禁用
    if (operatorId === targetUserId) {
      return res.status(400).json({
        code: 400,
        message: '不能禁用自己账户'
      });
    }

    // 执行禁用操作
    await db.execute(
      `UPDATE users 
       SET status = 'disabled'
       WHERE id = ?`,
      [targetUserId]
    );

    res.json({
      code: 200,
      message: '账户已禁用'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
}
};