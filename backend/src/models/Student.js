const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  pet_type: { type: DataTypes.STRING(50), defaultValue: null },
  pet_name: { type: DataTypes.STRING(50), defaultValue: null },
  food_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  badges: { type: DataTypes.JSON, defaultValue: [] },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  group_id: { type: DataTypes.INTEGER, defaultValue: null }
}, { tableName: 'students' });

module.exports = Student;
