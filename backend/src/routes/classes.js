const router = require('express').Router();
const { Class, Student, ScoreRule, ShopItem, Group, History, ExchangeRecord } = require('../models');
const sequelize = require('../config/database');
const auth = require('../middleware/auth');
const { requireActivated } = require('../middleware/auth');

// 获取班级列表
router.get('/', auth, requireActivated, async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: { user_id: req.userId },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 创建班级
router.post('/', auth, requireActivated, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: '班级名称不能为空' });

    const count = await Class.count({ where: { user_id: req.userId } });
    if (count >= 20) return res.status(400).json({ error: '最多创建20个班级' });

    const cls = await Class.create({
      user_id: req.userId,
      name: name.trim(),
      sort_order: count
    });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: '创建失败' });
  }
});

// 更新班级
router.put('/:id', auth, requireActivated, async (req, res) => {
  try {
    const cls = await Class.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const { name, system_name, theme, growth_stages, sort_order } = req.body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ error: '班级名称不能为空' });
    }

    // growth_stages 格式校验
    if (growth_stages !== undefined) {
      if (!Array.isArray(growth_stages) || growth_stages.length < 2 || growth_stages.length > 20
        || !growth_stages.every(v => typeof v === 'number' && v >= 0)) {
        return res.status(400).json({ error: '成长阶段格式不正确' });
      }
    }

    await cls.update({
      ...(name !== undefined && { name }),
      ...(system_name !== undefined && { system_name }),
      ...(theme !== undefined && { theme }),
      ...(growth_stages !== undefined && { growth_stages }),
      ...(sort_order !== undefined && { sort_order })
    });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除班级
router.delete('/:id', auth, requireActivated, async (req, res) => {
  let t;
  try {
    const count = await Class.count({ where: { user_id: req.userId } });
    if (count <= 1) return res.status(400).json({ error: '至少保留一个班级' });

    const cls = await Class.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    t = await sequelize.transaction();
    await History.destroy({ where: { class_id: cls.id }, transaction: t });
    await ExchangeRecord.destroy({ where: { class_id: cls.id }, transaction: t });
    await Student.destroy({ where: { class_id: cls.id }, transaction: t });
    await ScoreRule.destroy({ where: { class_id: cls.id }, transaction: t });
    await ShopItem.destroy({ where: { class_id: cls.id }, transaction: t });
    await Group.destroy({ where: { class_id: cls.id }, transaction: t });
    await cls.destroy({ transaction: t });

    await t.commit();
    res.json({ message: '删除成功' });
  } catch (err) {
    if (t) await t.rollback();
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
