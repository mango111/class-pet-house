const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScoreRule = sequelize.define('ScoreRule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  icon: { type: DataTypes.STRING(50), defaultValue: '⭐' },
  value: { type: DataTypes.INTEGER, allowNull: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'score_rules' });

module.exports = ScoreRule;
