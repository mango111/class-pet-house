const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopItem = sequelize.define('ShopItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.STRING(200), defaultValue: '' },
  icon: { type: DataTypes.STRING(50), defaultValue: '🎁' },
  price: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  stock: { type: DataTypes.INTEGER, defaultValue: -1 }
}, { tableName: 'shop_items' });

module.exports = ShopItem;
