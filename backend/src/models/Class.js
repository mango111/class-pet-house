const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false, defaultValue: '默认班级' },
  system_name: { type: DataTypes.STRING(100), defaultValue: '班级宠物屋' },
  theme: { type: DataTypes.STRING(50), defaultValue: 'pink' },
  growth_stages: {
    type: DataTypes.JSON,
    defaultValue: [0, 5, 10, 20, 30, 45, 60, 75, 90, 100]
  },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'classes' });

module.exports = Class;
