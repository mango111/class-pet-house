const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const sanitize = require('./middleware/sanitize');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);

// 速率限制：认证接口
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// 静态文件（宠物图片）
app.use('/动物图片', express.static(path.join(__dirname, '../../assets/pets')));

// API 路由
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const groupRoutes = require('./routes/groups');
const historyRoutes = require('./routes/history');
const shopRoutes = require('./routes/shop');
const scoreRuleRoutes = require('./routes/scoreRules');
const exportRoutes = require('./routes/export');
const adminRoutes = require('./routes/admin');
const { router: syncRouter } = require('./routes/sync');
const { requireActivated } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/classes', requireActivated, classRoutes);
app.use('/api/students', requireActivated, studentRoutes);
app.use('/api/groups', requireActivated, groupRoutes);
app.use('/api/history', requireActivated, historyRoutes);
app.use('/api/shop', requireActivated, shopRoutes);
app.use('/api/score-rules', requireActivated, scoreRuleRoutes);
app.use('/api/export', requireActivated, exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', requireActivated, syncRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 生产环境：serve前端静态文件
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  // SPA fallback：所有非API请求返回index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

module.exports = app;
