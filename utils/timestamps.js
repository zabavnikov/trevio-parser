const moment = require('moment');
const { DataTypes } = require('sequelize');

module.exports = {
  created_at: {
    type: DataTypes.DATE,
    get() {
      const date = this.getDataValue('created_at');

      return date
        ? moment.utc(date).format('YYYY-MM-DD HH:mm:ss')
        : null;
    }
  },
  updated_at: {
    type: DataTypes.DATE,
    get() {
      const date = this.getDataValue('updated_at');

      return date
          ? moment.utc(date).format('YYYY-MM-DD HH:mm:ss')
          : null;
    }
  },
}