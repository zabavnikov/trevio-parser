const { DataTypes, sequelize } = require('../../database');

module.exports = sequelize.define('Travel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    field: 'user_id',
  },
  title: {
    type: DataTypes.STRING,
  },
  text: {
    type: DataTypes.STRING,
    field: 'wysiwyg',
  },
  budget: {
    type: DataTypes.INTEGER,
  },
  date_start: {
    type: DataTypes.DATE,
  },
  date_end: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'travels',
  timestamps: false,
});