const { DataTypes, Sequelize, sequelize } = require('../../../database');
const User = require('../../users/models/User');
const Travel = require('../../travels/models/Travel');
const dateConverter = require('../../../utils/dateConverter');

const SubscriptionTravel = sequelize.define('SubscriptionTravel', {
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
      model_type: 'Modules\\Travels\\Entities\\Travel',
    },
    include: [
      {model: Travel, include: [{model: User}]}
    ]
  },
});

SubscriptionTravel.belongsTo(Travel, {
  foreignKey: 'module_id',
  where: {
    model_type: 'Modules\\Travels\\Entities\\Travel',
  }
});

SubscriptionTravel.removeAttribute('id');

module.exports = SubscriptionTravel;
