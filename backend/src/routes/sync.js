const router = require('express').Router();
const auth = require('../middleware/auth');

// SSE 连接池
const clients = new Map();

// SSE 实时同步
router.get('/stream', auth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const userId = req.userId;
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const userClients = clients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) clients.delete(userId);
    }
  });
});

// 广播给指定用户
const broadcast = (userId, data) => {
  const userClients = clients.get(userId);
  if (!userClients) return;
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  userClients.forEach(res => res.write(msg));
};

module.exports = { router, broadcast };
