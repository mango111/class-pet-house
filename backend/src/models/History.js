const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const History = sequelize.define('History', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  rule_id: { type: DataTypes.INTEGER, defaultValue: null },
  rule_name: { type: DataTypes.STRING(50), defaultValue: null },
  value: { type: DataTypes.INTEGER, defaultValue: 0 },
  type: {
    type: DataTypes.ENUM('score', 'graduate', 'exchange', 'revoke'),
    defaultValue: 'score'
  },
  is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'history' });

module.exports = History;
