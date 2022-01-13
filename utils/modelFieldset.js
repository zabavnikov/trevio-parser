const dateConverter = require('./dateConverter');
const { DataTypes } = require('../database');

const dateFields = {
  created_at: {
    type: DataTypes.DATE,
    get() {
      const date = this.getDataValue('created_at');

      if (date) {
        // Example: 2017-11-04 22:08:32
        return dateConverter(date);
      }

      return null;
    }
  },
  updated_at: {
    type: DataTypes.DATE,
    get() {
      const date = this.getDataValue('updated_at');

      if (date) {
        // Example: 2017-11-04 22:08:32
        return dateConverter(date);
      }

      return null;
    }
  },
  deleted_at: {
    type: DataTypes.DATE,
  },
  published_at: {
    type: DataTypes.VIRTUAL,
    get() {
      const date = this.getDataValue('created_at');

      if (date) {
        // Example: 2017-11-04 22:08:32
        return dateConverter(date);
      }

      return null;
    }
  },
};


module.exports = {
  dateFields
}