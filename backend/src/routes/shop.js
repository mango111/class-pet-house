const router = require('express').Router();
const { ShopItem, ExchangeRecord, Student, Class } = require('../models');
const auth = require('../middleware/auth');

// 获取班级商品
router.get('/class/:classId', auth, async (req, res) => {
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
router.post('/', auth, async (req, res) => {
  try {
    const { class_id, name, description, icon, price, stock } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });
    if (!name || !price) return res.status(400).json({ error: '名称和价格不能为空' });

    const item = await ShopItem.create({ class_id, name, description, icon, price, stock: stock ?? -1 });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: '添加失败' });
  }
});

// 更新商品
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await ShopItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: '商品不存在' });

    const cls = await Class.findOne({ where: { id: item.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    const { name, description, icon, price, stock } = req.body;
    await item.update({
      ...(name !== undefined && { name }),
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
router.delete('/:id', auth, async (req, res) => {
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
router.post('/exchange', auth, async (req, res) => {
  try {
    const { class_id, student_id, item_id } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const student = await Student.findOne({ where: { id: student_id, class_id } });
    if (!student) return res.status(404).json({ error: '学生不存在' });

    const item = await ShopItem.findOne({ where: { id: item_id, class_id } });
    if (!item) return res.status(404).json({ error: '商品不存在' });

    // 检查库存
    if (item.stock === 0) return res.status(400).json({ error: '商品库存不足' });

    // 检查徽章数量
    const badges = student.badges || [];
    const availableBadges = badges.length;
    if (availableBadges < item.price) {
      return res.status(400).json({ error: '徽章不足' });
    }

    // 扣减库存
    if (item.stock > 0) {
      await item.update({ stock: item.stock - 1 });
    }

    // 创建兑换记录
    const record = await ExchangeRecord.create({
      class_id, student_id, item_id,
      item_name: item.name, cost: item.price
    });

    res.json({ message: '兑换成功', record });
  } catch (err) {
    res.status(500).json({ error: '兑换失败' });
  }
});

// 获取兑换记录
router.get('/exchange/:classId', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ where: { id: req.params.classId, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const records = await ExchangeRecord.findAll({
      where: { class_id: cls.id },
      include: [{ model: Student, as: 'Student', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

module.exports = router;
