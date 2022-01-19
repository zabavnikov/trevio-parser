const { SQL } = require('../../classes');
const Note = require('../notes/models/Note');
const User = require('../users/models/User');
const ChatMessage = require('./models/ChatMessage');

let limit = 100,
    offset = 0;

function run() {
  Note
    .findAll({
      order: [
        ['id', 'ASC'],
      ],
      offset,
      limit,
      include: [
        { model: User },
      ],
    })
    .then(async notes => {
      if (notes.length === 0) return;

      for (let note of notes) {
        note = note.get();

        let lastMessageId = null;
        let lastMessageAt = null;

        const messages = await ChatMessage.findAll({
          where: {
            chat_id: note.id
          }
        })

        if (messages.length) {
          for (const message of messages) {
            await new SQL('trevio_chats.chats_messages', {
              id:             message.id,
              user_id:        message.user_id,
              chat_id:        note.id,
              branch_id:      message.branch_id,
              parent_id:      message.parent_id,
              text:           message.text,
              likes_count:    message.likes_count,
              replies_count:  message.replies_count,
              edited_at:      message.edited_at,
              created_at:     message.created_at,
              updated_at:     message.updated_at,
            })
                .setDumpFolder('chats')
                .parse();

            lastMessageId = message.id;
            lastMessageAt = message.created_at;
          }
        }

        await new SQL('trevio_chats.chats', {
          id:               note.id,
          user_id:          note.user_id,
          type:             'public',
          model_type:       note.type,
          model_id:         note.id,
          name:             note.title,
          messages_count:   note.messages_count,
          created_at:       note.created_at,
          updated_at:       lastMessageAt,
          last_message_id:  lastMessageId,
          last_message_at:  lastMessageAt,
        })
            .setDumpFolder('chats')
            .parse();
      }

      offset += notes.length;

      setTimeout(() => run(), 1000);
    });
}

run();
