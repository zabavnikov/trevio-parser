const { DataTypes, sequelize } = require('../../database');

module.exports = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  travel_id: {
    type: DataTypes.INTEGER,
  },
  note_type_id: {
    type: DataTypes.INTEGER,
  },
  company_id: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
  },
  short_text: {
    type: DataTypes.STRING,
  },
  wysiwyg: {
    type: DataTypes.STRING,
  },
  message_count: {
    type: DataTypes.INTEGER,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
}, {
  tableName: 'notes',
  timestamps: false,
});