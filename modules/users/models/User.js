const { DataTypes, sequelize } = require('../../../database');

module.exports = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    field: 'nickname',
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.INTEGER,
  },
  first_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  birthday: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'users',
  timestamps: false,
});