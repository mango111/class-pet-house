const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    if (!user.is_activated) {
      return res.status(403).json({ error: '账号未激活', status: 'not_activated' });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期' });
    }
    return res.status(401).json({ error: '认证失败' });
  }
};

module.exports = auth;
