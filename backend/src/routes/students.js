const router = require('express').Router();
const { Student, Class, Group, History, ExchangeRecord } = require('../models');
const auth = require('../middleware/auth');
const { requireActivated } = require('../middleware/auth');

// 获取班级学生
router.get('/class/:classId', auth, requireActivated, async (req, res) => {
  try {
    const cls = await Class.findOne({ where: { id: req.params.classId, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const students = await Student.findAll({
      where: { class_id: cls.id },
      include: [{ model: Group, as: 'Group', attributes: ['id', 'name'] }],
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 添加学生
router.post('/', auth, requireActivated, async (req, res) => {
  try {
    const { class_id, name, names } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    // 批量添加
    if (names && Array.isArray(names)) {
      if (names.length > 200) return res.status(400).json({ error: '单次最多添加200名学生' });
      const existing = await Student.findAll({ where: { class_id }, attributes: ['name'] });
      const existingNames = new Set(existing.map(s => s.name));
      const count = existing.length;

      const newStudents = names
        .filter(n => n.trim() && !existingNames.has(n.trim()))
        .map((n, i) => ({ class_id, name: n.trim(), sort_order: count + i }));

      const created = await Student.bulkCreate(newStudents);
      return res.json({ created: created.length, students: created });
    }

    // 单个添加
    if (!name) return res.status(400).json({ error: '学生姓名不能为空' });
    if (name.length > 50) return res.status(400).json({ error: '姓名最多50个字符' });

    const dup = await Student.findOne({ where: { class_id, name } });
    if (dup) return res.status(400).json({ error: '该班级已有同名学生' });

    const count = await Student.count({ where: { class_id } });
    const student = await Student.create({ class_id, name, sort_order: count });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: '添加失败' });
  }
});

// 更新学生
router.put('/:id', auth, requireActivated, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: '学生不存在' });

    const cls = await Class.findOne({ where: { id: student.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    const allowed = ['name', 'pet_type', 'pet_name', 'badges', 'sort_order', 'group_id'];
    // food_count 只允许毕业重置时传入（值为0）
    if (req.body.food_count !== undefined) {
      if (req.body.food_count === 0) {
        allowed.push('food_count');
      }
      // 非0值不允许直接修改，必须通过 history 接口
    }
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    await student.update(updates);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除学生
router.delete('/:id', auth, requireActivated, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: '学生不存在' });

    const cls = await Class.findOne({ where: { id: student.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    await History.destroy({ where: { student_id: student.id } });
    await ExchangeRecord.destroy({ where: { student_id: student.id } });
    await student.destroy();
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
