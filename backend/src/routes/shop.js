const router = require('express').Router();
const { ShopItem, ExchangeRecord, Student, Class, History } = require('../models');
const sequelize = require('../config/database');
const auth = require('../middleware/auth');
const { requireActivated } = require('../middleware/auth');

// 获取班级商品
router.get('/class/:classId', auth, requireActivated, async (req, res) => {
  try {
    const cls = await Class.findOne({ where: { id: req.params.classId, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const items = await ShopItem.findAll({
      where: { class_id: cls.id },
      order: [['created_at', 'ASC']]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 添加商品
router.post('/', auth, requireActivated, async (req, res) => {
  try {
    const { class_id, name, description, icon, price, stock } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });
    if (!name || typeof name !== 'string') return res.status(400).json({ error: '商品名称不能为空' });
    if (!price || typeof price !== 'number' || price < 1) return res.status(400).json({ error: '价格至少为1' });

    const itemCount = await ShopItem.count({ where: { class_id } });
    if (itemCount >= 100) return res.status(400).json({ error: '最多创建100个商品' });

    const item = await ShopItem.create({ class_id, name, description, icon, price, stock: stock ?? -1 });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: '添加失败' });
  }
});

// 更新商品
router.put('/:id', auth, requireActivated, async (req, res) => {
  try {
    const item = await ShopItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: '商品不存在' });

    const cls = await Class.findOne({ where: { id: item.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    const { name, description, icon, price, stock } = req.body;
    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ error: '商品名称不能为空' });
    }
    await item.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock })
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除商品
router.delete('/:id', auth, requireActivated, async (req, res) => {
  try {
    const item = await ShopItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: '商品不存在' });

    const cls = await Class.findOne({ where: { id: item.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    await item.destroy();
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

// 兑换商品
router.post('/exchange', auth, requireActivated, async (req, res) => {
  let t;
  try {
    const { class_id, student_id, item_id } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const student = await Student.findOne({ where: { id: student_id, class_id } });
    if (!student) return res.status(404).json({ error: '学生不存在' });

    const item = await ShopItem.findOne({ where: { id: item_id, class_id } });
    if (!item) return res.status(404).json({ error: '商品不存在' });

    if (item.stock === 0) return res.status(400).json({ error: '商品库存不足' });

    const badges = student.badges || [];
    if (badges.length < item.price) {
      return res.status(400).json({ error: '徽章不足' });
    }

    t = await sequelize.transaction();

    const remainingBadges = badges.slice(item.price);
    await student.update({ badges: remainingBadges }, { transaction: t });

    if (item.stock > 0) {
      await item.update({ stock: item.stock - 1 }, { transaction: t });
    }

    const record = await ExchangeRecord.create({
      class_id, student_id, item_id,
      item_name: item.name, cost: item.price
    }, { transaction: t });

    // 记录兑换历史
    await History.create({
      class_id, student_id,
      rule_id: null, rule_name: `兑换: ${item.name}`,
      value: -item.price, type: 'exchange'
    }, { transaction: t });

    await t.commit();
    res.json({ message: '兑换成功', record });
  } catch (err) {
    if (t) await t.rollback();
    res.status(500).json({ error: '兑换失败' });
  }
});

// 获取兑换记录
router.get('/exchange/:classId', auth, requireActivated, async (req, res) => {
  try {
    const cls = await Class.findOne({ where: { id: req.params.classId, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const records = await ExchangeRecord.findAll({
      where: { class_id: cls.id },
      include: [{ model: Student, as: 'Student', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: 200
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

module.exports = router;
