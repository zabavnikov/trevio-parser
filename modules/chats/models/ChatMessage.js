const { DataTypes, Sequelize, sequelize } = require('../../../database');
const { dateFields } = require('../../../utils/modelFieldset');
const User = require('../../users/models/User');
const dateConverter = require('../../../utils/dateConverter');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  chat_id: {
    type: DataTypes.INTEGER,
  },
  branch_id: {
    type: DataTypes.INTEGER,
  },
  parent_id: {
    type: DataTypes.INTEGER,
  },
  parent_id: {
    type: DataTypes.INTEGER,
  },
  likes_count: {
    type: DataTypes.INTEGER,
    field: 'like_count',
  },
  replies_count: {
    type: DataTypes.INTEGER,
    field: 'reply_count',
  },
  text: {
    type: DataTypes.STRING,
    get() {
      return this.getDataValue('text').replace('\\', '');
    }
  },
  edited_at: {
    type: DataTypes.DATE,
    get() {
      const date = this.getDataValue('edited_at');

      if (date) {
        // Example: 2017-11-04 22:08:32
        return dateConverter(date);
      }

      return null;
    }
  },
  ...dateFields,
}, {
  tableName: 'notes_chats_messages',
  timestamps: false,
  defaultScope: {
    where: {
      deleted_at: null,
    }
  },
});

ChatMessage.belongsTo(User, {
  foreignKey: 'user_id',
  sourceKey: 'id',
});

module.exports = ChatMessage;
