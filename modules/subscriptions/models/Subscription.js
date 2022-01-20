const { DataTypes, Sequelize, sequelize } = require('../../../database');
const User = require('../../users/models/User');
const dateConverter = require('../../../utils/dateConverter');

const Subscription = sequelize.define('Subscription', {
  subscriber_id: {
    type: DataTypes.INTEGER,
    field: 'user_id',
  },
  model_type: {
    type: DataTypes.STRING,
    field: 'module_type',
  },
  model_id: {
    type: DataTypes.INTEGER,
    field: 'module_id',
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
}, {
  tableName: 'feed_subscribe',
  timestamps: false,
  defaultScope: {
    where: {
      model_type: 'Modules\\Users\\Entities\\User',
      user_confirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    },
    include: [
      {model: User}
    ]
  },
});

Subscription.removeAttribute('id');

Subscription.belongsTo(User, {
  foreignKey: 'subscriber_id',
});

module.exports = Subscription;
