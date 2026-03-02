const router = require('express').Router();
const { License, User } = require('../models');
const crypto = require('crypto');

// 管理员验证（使用 Authorization header）
const adminAuth = (req, res, next) => {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    return res.status(503).json({ error: '管理后台未配置' });
  }

  // 支持 Basic Auth
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
    const [u, p] = decoded.split(':');
    if (u === adminUser && p === adminPass) return next();
  }

  // 兼容自定义 header
  const { username, password } = req.headers;
  if (username === adminUser && password === adminPass) return next();

  res.status(401).json({ error: '管理员认证失败' });
};

// 生成卡密
router.post('/licenses/generate', adminAuth, async (req, res) => {
  try {
    const { count = 1 } = req.body;
    const codes = [];
    for (let i = 0; i < Math.min(count, 100); i++) {
      const code = 'CPH-' + crypto.randomBytes(8).toString('hex').toUpperCase();
      await License.create({ code });
      codes.push(code);
    }
    res.json({ message: `生成${codes.length}个卡密`, codes });
  } catch (err) {
    res.status(500).json({ error: '生成失败' });
  }
});

// 查看所有卡密
router.get('/licenses', adminAuth, async (req, res) => {
  try {
    const licenses = await License.findAll({ order: [['created_at', 'DESC']] });

    const userIds = licenses.filter(l => l.used_by).map(l => l.used_by);
    const users = await User.findAll({ where: { id: userIds }, attributes: ['id', 'username'] });
    const userMap = users.reduce((map, u) => { map[u.id] = u.username; return map; }, {});

    const result = licenses.map(l => {
      const data = l.toJSON();
      data.username = data.used_by ? (userMap[data.used_by] || '未知账户') : null;
      return data;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 查看所有用户
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'is_activated', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 统计数据
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activatedUsers = await User.count({ where: { is_activated: true } });
    const totalLicenses = await License.count();
    const usedLicenses = await License.count({ where: { is_used: true } });
    res.json({ totalUsers, activatedUsers, totalLicenses, usedLicenses });
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

module.exports = router;
