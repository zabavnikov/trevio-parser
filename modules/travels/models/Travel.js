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
  created_at: {
    type: DataTypes.STRING,
    get() {
      const value = new Date(Date.parse(this.getDataValue('created_at'))).toLocaleString();
      return value === 'Invalid Date' ? null : value;
    }
  },
  updated_at: {
    type: DataTypes.STRING,
    get() {
      const value = new Date(Date.parse(this.getDataValue('updated_at'))).toLocaleString();
      return value === 'Invalid Date' ? null : value;
    }
  },
  published_at: {
    type: DataTypes.VIRTUAL,
    get() {
      const value = new Date(Date.parse(this.getDataValue('created_at'))).toLocaleString();
      return value === 'Invalid Date' ? null : value;
    }
  },
}, {
  tableName: 'travels',
  timestamps: false,
});