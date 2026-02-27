const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const License = sequelize.define('License', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
  used_by: { type: DataTypes.INTEGER, defaultValue: null },
  used_at: { type: DataTypes.DATE, defaultValue: null }
}, { tableName: 'licenses' });

module.exports = License;
