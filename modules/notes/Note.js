const { DataTypes, sequelize } = require('../../database');

module.exports = sequelize.define('Note', {
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
  tableName: 'notes',
  timestamps: false,
});