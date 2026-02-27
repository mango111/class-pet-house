const sequelize = require('../config/database');
const User = require('./User');
const Class = require('./Class');
const Student = require('./Student');
const Group = require('./Group');
const ScoreRule = require('./ScoreRule');
const History = require('./History');
const ShopItem = require('./ShopItem');
const ExchangeRecord = require('./ExchangeRecord');
const License = require('./License');

// User -> Classes
User.hasMany(Class, { foreignKey: 'user_id', as: 'classes' });
Class.belongsTo(User, { foreignKey: 'user_id' });

// Class -> Students
Class.hasMany(Student, { foreignKey: 'class_id', as: 'students' });
Student.belongsTo(Class, { foreignKey: 'class_id' });

// Class -> Groups
Class.hasMany(Group, { foreignKey: 'class_id', as: 'groups' });
Group.belongsTo(Class, { foreignKey: 'class_id' });

// Group -> Students
Group.hasMany(Student, { foreignKey: 'group_id', as: 'students' });
Student.belongsTo(Group, { foreignKey: 'group_id' });

// Class -> ScoreRules
Class.hasMany(ScoreRule, { foreignKey: 'class_id', as: 'scoreRules' });
ScoreRule.belongsTo(Class, { foreignKey: 'class_id' });

// Class -> History
Class.hasMany(History, { foreignKey: 'class_id', as: 'history' });
History.belongsTo(Class, { foreignKey: 'class_id' });

// Student -> History
Student.hasMany(History, { foreignKey: 'student_id', as: 'history' });
History.belongsTo(Student, { foreignKey: 'student_id' });

// Class -> ShopItems
Class.hasMany(ShopItem, { foreignKey: 'class_id', as: 'shopItems' });
ShopItem.belongsTo(Class, { foreignKey: 'class_id' });

// Class -> ExchangeRecords
Class.hasMany(ExchangeRecord, { foreignKey: 'class_id', as: 'exchangeRecords' });
ExchangeRecord.belongsTo(Class, { foreignKey: 'class_id' });

// Student -> ExchangeRecords
Student.hasMany(ExchangeRecord, { foreignKey: 'student_id', as: 'exchangeRecords' });
ExchangeRecord.belongsTo(Student, { foreignKey: 'student_id' });

module.exports = {
  sequelize, User, Class, Student, Group,
  ScoreRule, History, ShopItem, ExchangeRecord, License
};
