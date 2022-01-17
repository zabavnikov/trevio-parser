const { DataTypes, Sequelize, sequelize } = require('../../../database');
const { dateFields } = require('../../../utils/modelFieldset');
const User = require('../../users/models/User');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  module_type: {
    type: DataTypes.INTEGER,
  },
  likes_id: {
    type: DataTypes.INTEGER,
  },
  ...dateFields,
}, {
  tableName: 'likes',
  timestamps: false,
  defaultScope: {
    where: {
      deleted_at: null,
      user_confirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    }
  },
});

Like.belongsTo(User, {
  foreignKey: 'user_id',
  sourceKey: 'id',
});

module.exports = Like;
