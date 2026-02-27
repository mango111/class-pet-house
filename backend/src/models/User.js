const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  activation_code: { type: DataTypes.STRING(100), defaultValue: null },
  is_activated: { type: DataTypes.BOOLEAN, defaultValue: false },
  settings: { type: DataTypes.JSON, defaultValue: {} }
}, { tableName: 'users' });

User.beforeCreate(async (user) => {
  user.password_hash = await bcrypt.hash(user.password_hash, 10);
});

User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;
