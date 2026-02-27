const router = require('express').Router();
const { ScoreRule, Class } = require('../models');
const auth = require('../middleware/auth');

// 获取班级积分规则
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({
      where: { id: req.params.classId, user_id: req.userId }
    });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const rules = await ScoreRule.findAll({
      where: { class_id: cls.id },
      order: [['sort_order', 'ASC']]
    });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 添加积分规则
router.post('/', auth, async (req, res) => {
  try {
    const { class_id, name, icon, value } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });
    if (!name || value === undefined || value === 0) {
      return res.status(400).json({ error: '名称和分值不能为空，分值不能为0' });
    }

    const count = await ScoreRule.count({ where: { class_id } });
    const rule = await ScoreRule.create({
      class_id, name, icon: icon || '⭐', value, sort_order: count
    });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: '添加失败' });
  }
});

// 更新积分规则
router.put('/:id', auth, async (req, res) => {
  try {
    const rule = await ScoreRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ error: '规则不存在' });

    const cls = await Class.findOne({ where: { id: rule.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    const { name, icon, value, sort_order } = req.body;
    await rule.update({
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
      ...(value !== undefined && { value }),
      ...(sort_order !== undefined && { sort_order })
    });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除积分规则
router.delete('/:id', auth, async (req, res) => {
  try {
    const rule = await ScoreRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ error: '规则不存在' });

    const cls = await Class.findOne({ where: { id: rule.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    await rule.destroy();
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
