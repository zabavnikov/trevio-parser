const { DataTypes, Sequelize, sequelize } = require('../../../database');
const { dateFields } = require('../../../utils/modelFieldset');
const User = require('../../users/models/User');
const MediaBind = require('../../media/models/MediaBind');
const Like = require('../../likes/models/Like');

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
        return value.trim().substr(0, 1000);
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
  ...dateFields,
}, {
  tableName: 'travels',
  timestamps: false,
  defaultScope: {
    where: {
      status: 'published',
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

/*Travel.hasMany(Like, {
  foreignKey: 'likes_id',
  scope: {
    module_type: 1,
  },
});*/

module.exports = Travel;
