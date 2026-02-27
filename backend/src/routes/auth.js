const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Class, ScoreRule, License } = require('../models');
const auth = require('../middleware/auth');

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// 默认积分规则
const DEFAULT_RULES = [
  { name: '早读打卡', icon: '📖', value: 1 },
  { name: '作业优秀', icon: '⭐', value: 3 },
  { name: '课堂表现好', icon: '🙋', value: 2 },
  { name: '帮助同学', icon: '🤝', value: 2 },
  { name: '考试进步', icon: '📈', value: 5 },
  { name: '值日认真', icon: '🧹', value: 1 },
  { name: '运动达标', icon: '🏃', value: 2 },
  { name: '迟到', icon: '⏰', value: -1 },
  { name: '未交作业', icon: '📝', value: -2 },
  { name: '课堂违纪', icon: '🚫', value: -2 },
  { name: '打架', icon: '👊', value: -5 },
  { name: '说脏话', icon: '🤐', value: -1 },
  { name: '不守纪律', icon: '⚠️', value: -1 },
  { name: '损坏公物', icon: '💔', value: -3 }
];

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度3-20个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6个字符' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const user = await User.create({ username, password_hash: password });
    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, username: user.username, is_activated: false },
      status: 'not_activated'
    });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, is_activated: user.is_activated },
      status: user.is_activated ? 'authenticated' : 'not_activated'
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

// 卡密激活
router.post('/activate', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: '请输入激活码' });

    const license = await License.findOne({ where: { code, is_used: false } });
    if (!license) return res.status(400).json({ error: '激活码无效或已被使用' });

    await license.update({ is_used: true, used_by: req.userId, used_at: new Date() });
    await req.user.update({ activation_code: code, is_activated: true });

    // 创建默认班级和积分规则
    const cls = await Class.create({ user_id: req.userId, name: '默认班级' });
    for (let i = 0; i < DEFAULT_RULES.length; i++) {
      await ScoreRule.create({ class_id: cls.id, ...DEFAULT_RULES[i], sort_order: i });
    }

    res.json({ message: '激活成功', user: { id: req.user.id, username: req.user.username, is_activated: true } });
  } catch (err) {
    res.status(500).json({ error: '激活失败' });
  }
});

// 获取当前用户
router.get('/me', auth, async (req, res) => {
  res.json({
    user: { id: req.user.id, username: req.user.username, is_activated: req.user.is_activated, settings: req.user.settings }
  });
});

// 检查登录状态
router.get('/check', auth, (req, res) => {
  res.json({ status: req.user.is_activated ? 'authenticated' : 'not_activated' });
});

// 退出登录
router.post('/logout', auth, (req, res) => {
  res.json({ message: '已退出' });
});

// 修改密码
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: '请填写完整' });
    if (newPassword.length < 6) return res.status(400).json({ error: '新密码至少6个字符' });

    const valid = await req.user.comparePassword(oldPassword);
    if (!valid) return res.status(400).json({ error: '旧密码错误' });

    const hash = await bcrypt.hash(newPassword, 10);
    await req.user.update({ password_hash: hash });
    res.json({ message: '密码修改成功' });
  } catch (err) {
    res.status(500).json({ error: '修改失败' });
  }
});

// 重置密码（用卡密）
router.post('/reset-password', async (req, res) => {
  try {
    const { username, activationCode, newPassword } = req.body;
    if (!username || !activationCode || !newPassword) return res.status(400).json({ error: '请填写完整' });

    const user = await User.findOne({ where: { username, activation_code: activationCode } });
    if (!user) return res.status(400).json({ error: '用户名或激活码不匹配' });

    const hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hash });
    res.json({ message: '密码重置成功' });
  } catch (err) {
    res.status(500).json({ error: '重置失败' });
  }
});

// 更新用户设置
router.put('/settings', auth, async (req, res) => {
  try {
    await req.user.update({ settings: { ...req.user.settings, ...req.body } });
    res.json({ message: '设置已保存', settings: req.user.settings });
  } catch (err) {
    res.status(500).json({ error: '保存失败' });
  }
});

// 验证密码
router.post('/verify-password', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const valid = await req.user.comparePassword(password);
    res.json({ valid });
  } catch (err) {
    res.status(500).json({ error: '验证失败' });
  }
});

module.exports = router;
