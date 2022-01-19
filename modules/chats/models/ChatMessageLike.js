const { DataTypes, Sequelize, sequelize } = require('../../../database');
const { dateFields } = require('../../../utils/modelFieldset');
const User = require('../../users/models/User');
const dateConverter = require('../../../utils/dateConverter');

const ChatMessageLike = sequelize.define('ChatMessageLike', {
  user_id: {
    type: DataTypes.INTEGER,
  },
  message_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'notes_chats_messages_likes',
  timestamps: false,
});

ChatMessageLike.removeAttribute('id');

module.exports = ChatMessageLike;
