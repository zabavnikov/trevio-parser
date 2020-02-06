const { DataTypes, sequelize } = require('../../database');

module.exports = sequelize.define('Travel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
  },
  wysiwyg: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'travels',
  timestamps: false,
});