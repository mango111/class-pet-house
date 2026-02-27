const xss = require('xss');

// 递归清理对象中的字符串值
function sanitizeValue(val) {
  if (typeof val === 'string') return xss(val);
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === 'object') {
    const clean = {};
    for (const k of Object.keys(val)) {
      clean[k] = sanitizeValue(val[k]);
    }
    return clean;
  }
  return val;
}

const sanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  next();
};

module.exports = sanitize;
