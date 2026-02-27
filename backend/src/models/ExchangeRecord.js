const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExchangeRecord = sequelize.define('ExchangeRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  item_id: { type: DataTypes.INTEGER, defaultValue: null },
  item_name: { type: DataTypes.STRING(50), allowNull: false },
  cost: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'exchange_records' });

module.exports = ExchangeRecord;
