const router = require('express').Router();
const { History, Student, Class, ScoreRule } = require('../models');
const auth = require('../middleware/auth');
const { broadcast } = require('./sync');

// 获取班级操作历史
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const cls = await Class.findOne({ where: { id: req.params.classId, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const { limit = 50, offset = 0, student_id } = req.query;
    const where = { class_id: cls.id };
    if (student_id) where.student_id = student_id;

    const history = await History.findAndCountAll({
      where,
      include: [{ model: Student, as: 'Student', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 创建操作记录（加分/扣分）
router.post('/', auth, async (req, res) => {
  try {
    const { class_id, student_ids, rule_id } = req.body;
    const cls = await Class.findOne({ where: { id: class_id, user_id: req.userId } });
    if (!cls) return res.status(404).json({ error: '班级不存在' });

    const rule = await ScoreRule.findByPk(rule_id);
    if (!rule) return res.status(404).json({ error: '规则不存在' });

    const ids = Array.isArray(student_ids) ? student_ids : [student_ids];
    const results = [];

    for (const sid of ids) {
      const student = await Student.findOne({ where: { id: sid, class_id } });
      if (!student) continue;

      await student.update({ food_count: Math.max(0, student.food_count + rule.value) });
      const record = await History.create({
        class_id, student_id: sid,
        rule_id: rule.id, rule_name: rule.name,
        value: rule.value, type: 'score'
      });
      results.push({ student_id: sid, record_id: record.id, new_food: student.food_count });
    }

    res.json({ results });

    // SSE 广播通知前端刷新
    broadcast(req.userId, { type: 'score_update', class_id, results });
  } catch (err) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 撤回操作
router.post('/revoke', auth, async (req, res) => {
  try {
    const { record_id } = req.body;
    const record = await History.findByPk(record_id);
    if (!record || record.is_revoked) {
      return res.status(400).json({ error: '记录不存在或已撤回' });
    }

    const cls = await Class.findOne({ where: { id: record.class_id, user_id: req.userId } });
    if (!cls) return res.status(403).json({ error: '无权限' });

    const student = await Student.findByPk(record.student_id);
    if (student) {
      await student.update({ food_count: Math.max(0, student.food_count - record.value) });
    }

    await record.update({ is_revoked: true });
    res.json({ message: '撤回成功' });
  } catch (err) {
    res.status(500).json({ error: '撤回失败' });
  }
});

// 批量撤回
router.post('/revoke-batch', auth, async (req, res) => {
  try {
    const { record_ids } = req.body;
    if (!Array.isArray(record_ids)) return res.status(400).json({ error: '参数错误' });

    let count = 0;
    for (const id of record_ids) {
      const record = await History.findByPk(id);
      if (!record || record.is_revoked) continue;

      const cls = await Class.findOne({ where: { id: record.class_id, user_id: req.userId } });
      if (!cls) continue;

      const student = await Student.findByPk(record.student_id);
      if (student) {
        await student.update({ food_count: student.food_count - record.value });
      }
      await record.update({ is_revoked: true });
      count++;
    }
    res.json({ message: `已撤回${count}条记录` });
  } catch (err) {
    res.status(500).json({ error: '批量撤回失败' });
  }
});

// 批量删除历史
router.post('/batch-delete', auth, async (req, res) => {
  try {
    const { record_ids } = req.body;
    if (!Array.isArray(record_ids)) return res.status(400).json({ error: '参数错误' });

    // 权限校验：只删除属于当前用户班级的记录
    const records = await History.findAll({ where: { id: record_ids } });
    const classIds = [...new Set(records.map(r => r.class_id))];
    for (const cid of classIds) {
      const cls = await Class.findOne({ where: { id: cid, user_id: req.userId } });
      if (!cls) return res.status(403).json({ error: '无权限删除其他用户的记录' });
    }

    await History.destroy({ where: { id: record_ids } });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
