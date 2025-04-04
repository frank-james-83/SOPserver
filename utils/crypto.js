const crypto = require('crypto');

exports.hashOpenId = (openId) => {
  return crypto.createHash('sha256').update(openId).digest('hex');
};

exports.generateCode = () => {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
};
