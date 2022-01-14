const toSql = require('../../utils/toSql');
const download = require('../../utils/download');
const {uploadDirForPermanentImages, dateToPath} = require('../../utils/pathBuilder');
const {UPLOAD_DISK} = require('../../constants');
const Note = require('./models/Note');
const SQL = require('../../classes/SQL');
const {v4} = require('uuid');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

let limit = 50,
    offset = 0;

function run() {
  Note
      .findAll({
        include: {all: true, nested: true},
        offset,
        limit,
      })
      .then(async notes => {
        if (notes.length === 0) {
          return
        }

        for await (let note of notes) {
          note = note.get();
          note.cover_id = null;

          /*
           * Обложки путешествий.
           */
          if (note.MediaBinds.length) {
            const path = uploadDirForPermanentImages(note.user_id);
            const fullPath = `users/${path}/${note.type}/${dateToPath(note.created_at)}`;

            note.MediaBinds.forEach(async (MediaBind, index) => {

              if (MediaBind.dataValues.tag === 'cover') {
                note.cover_id = MediaBind.dataValues.media_id;
              } else {
                note.cover_id = note.MediaBinds[0].dataValues.media_id;
              }

              if (MediaBind.Medium) {
                const filename = MediaBind.Medium.dataValues.filename;

                // await download('notes', MediaBind.Medium, UPLOAD_DISK, fullPath, filename, 1920, 1080);

                await new SQL(`${note.type}_images`, {
                  id: MediaBind.Medium.dataValues.id,
                  user_id: note.user_id,
                  model_id: note.id,
                  disk: UPLOAD_DISK,
                  path: fullPath + '/' + filename,
                })
                    .setDumpFolder('notes')
                    .parse();
              }
            })
          }


          const insert = {
            id: note.id,
            user_id: note.user_id,
            travel_id: note.travel_id,
            cover_id: note.cover_id,
            title: note.title,
            text: `<p>${note.short_text}</p>${note.text}`,
            created_at: note.created_at,
            updated_at: note.updated_at,
            deleted_at: note.deleted_at,
            published_at: note.published_at,
          };

          if (note.type === 'reviews') {
            insert.stars = note.rating;
          }

          await new SQL(note.type, insert)
              .setDumpFolder('notes')
              .setHtmlFields(['text'])
              .parse();

          await new SQL('activity', {
            key: `emitter${note.user_id}${note.type}${note.id}`,
            event_id: 1,
            emitter_id: note.user_id,
            recipient_id: note.user_id,
            travel_id: note.id,
            model_type: note.type,
            model_id: note.id,
            ip: 1,
            weight: 0.0120,
            created_at: note.created_at,
          })
              .setDumpFolder('notes')
              .parse();
        }

        offset += limit;

        setTimeout(() => run(), 1000);
      });
}

run();
