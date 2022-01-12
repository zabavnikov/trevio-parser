const { DataTypes, Sequelize, sequelize } = require('../../../database');
const dateConverter = require('../../../utils/dateConverter');
const User = require('../../users/models/User');
const MediaBind = require('../../media/models/MediaBind');

const Travel = sequelize.define('Travel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
  },
  text: {
    type: DataTypes.STRING,
    field: 'wysiwyg',
    get() {
      const value = this.getDataValue('text');

      if (value) {
        return value.trim().substr(0, 400);
      }

      return null;
    }
  },
  status: {
    type: DataTypes.STRING,
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
}, {
  tableName: 'travels',
  timestamps: false,
  defaultScope: {
    where: {
      deleted_at: null,
      user_confirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    },
  },
});

Travel.belongsTo(User, {
  foreignKey: 'user_id',
});

Travel.hasOne(MediaBind, {
  foreignKey: 'module_id',
  scope: {
    module_type_id: 1,
    tag: 'cover',
  },
});

module.exports = Travel;
