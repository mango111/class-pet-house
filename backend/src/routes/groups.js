const router = require('express').Router();
const { Group, Student, Class } = require('../models');
const auth = require('../middleware/auth');
const { requireActivated } = require('../middleware/auth');

// 获取班级分组
router.get('/class/:classId', auth, requireActivated, async (req, res) => {
  try {
    const cls = await Class.findOne({ where: { id: req.params.classId, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const groups = await Group.findAll({
      where: { class_id: cls.id },
      include: [{ model: Student, as: 'students', attributes: ['id', 'name'] }],
      order: [['sort_order', 'ASC']]
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 创建分组
router.post('/', auth, requireActivated, async (req, res) => {
  try {
    const { class_id, name } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });
    if (!name) return res.status(400).json({ error: '分组名称不能为空' });

    const count = await Group.count({ where: { class_id } });
    if (count >= 50) return res.status(400).json({ error: '最多创建50个分组' });

    const group = await Group.create({ class_id, name, sort_order: count });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: '创建失败' });
  }
});

// 更新分组
router.put('/:id', auth, requireActivated, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: '分组不存在' });

    const cls = await Class.findOne({ where: { id: group.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    const { name, sort_order } = req.body;
    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ error: '分组名称不能为空' });
    }
    await group.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(sort_order !== undefined && { sort_order })
    });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除分组
router.delete('/:id', auth, requireActivated, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: '分组不存在' });

    const cls = await Class.findOne({ where: { id: group.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    // 将该组学生设为未分组
    await Student.update({ group_id: null }, { where: { group_id: group.id } });
    await group.destroy();
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
