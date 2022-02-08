const { SQL, Download } = require('../../classes');
const { uploadDirForPermanentImages, dateToPath } = require('../../utils/pathBuilder');
const ChatMessage = require('./models/ChatMessage');
const ChatMessageImage = require('./models/ChatMessageImage');
const ChatMessageLike = require('./models/ChatMessageLike');

const {
  User,
  Company,
  Note,
} = require('../../models');

let offset = 0,
    limit = 100;

async function run() {
  let companies = await Company.findAll();

  companies = companies.map(company => company.user_id);

  Note
    .findAll({
      include: [
        { model: User },
      ],
      offset,
      limit,
    })
    .then(async notes => {
      if (notes.length === 0) return;

      let newChatId = 1;

      for (let note of notes) {
        note = note.get();

        if (companies.indexOf(note.user_id) !== -1) {
          note.type = 'posts';
        }

        let lastMessageId = null;
        let lastMessageAt = null;

        const messages = await ChatMessage.findAll({
          where: {
            chat_id: note.id
          }
        });

        if (messages.length) {

          const members = {};

          for (const message of messages) {
            await new SQL('trevio_chats.chats_messages', {
              id:             message.id,
              user_id:        message.user_id,
              chat_id:        newChatId,
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

            /*
              УЧАСТНИКИ ЧАТА.
             */
            const memberId = parseInt(message.user_id);

            if (! members.hasOwnProperty(memberId)) {
              members[memberId] = message.created_at;
            }

            /*
              ЛАЙКИ СООБЩЕНИЙ ЧАТА.
             */
            if (message.likes_count > 0) {
              const likes = await ChatMessageLike.findAll({
                where: {
                  message_id: message.id
                }
              });

              if (likes.length) {
                for (const like of likes) {
                  await new SQL('trevio_chats.chats_messages_likes', {
                    user_id:  like.user_id,
                    model_id: like.message_id,
                  })
                      .setDumpFolder('chats')
                      .parse();
                }
              }
            }

            /*
              ИЗОБРАЖЕНИЯ СООБЩЕНИЙ ЧАТА.
             */
            const images = await ChatMessageImage.findAll({
              where: {
                message_id: message.id
              }
            });

            if (images.length) {
              for (const image of images) {
                // добавить в путь дату, см загрузку в чатах на тестовом.
                const path = uploadDirForPermanentImages(image.id) + `/${dateToPath(note.created_at)}`;

                /*await new Download('chats', image.path, `/chats/${path}`, `${image.id}.jpg`)
                    .setWidthHeight(640, 480)
                    .skipFilePathBuilder()
                    .setHost('/var/trevio_images/chats')
                    .download();*/

                await new SQL('trevio_chats.chats_messages_images', {
                  user_id:    image.user_id,
                  model_id:   message.id,
                  disk:       's3',
                  path:       `/chats/${path}/${image.id}.jpg`,
                })
                    .setDumpFolder('chats')
                    .parse();
              }
            }
          }

          /*
           УЧАСТНИКИ ЧАТА.
          */
          if (Object.keys(members).length) {
            for (const memberId in members) {
              await new SQL('trevio_chats.chats_members', {
                chat_id:            newChatId,
                user_id:            memberId,
                chat_joined_at:     members[memberId],
                chat_last_visit_at: members[memberId],
              })
                  .setDumpFolder('chats')
                  .parse();
            }
          }
        }

        await new SQL('trevio_chats.chats', {
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

        newChatId++;
      }

      offset += notes.length;

      setTimeout(() => run(), 1000);
    });
}

run();
