const argv = require('minimist')(process.argv.slice(2));

const download = require('../../utils/download');
const getImagesFromString = require('../../utils/getImagesFromString');
const {uploadDirForPermanentImages, dateToPath, getOriginalImagePath} = require('../../utils/pathBuilder');
const {UPLOAD_DISK} = require('../../constants');
const Note = require('./models/Note');
const SQL = require('../../classes/SQL');
const { v4 } = require('uuid');

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

          const imageRepository = [];
          const imagesFromText = getImagesFromString(note.text);
          const path = uploadDirForPermanentImages(note.user_id);
          const fullPath = `users/${path}/${note.type}/${dateToPath(note.created_at)}`;

          // Парсим фотки из текста. Потому что в старой бд, есть фотки без module_id
          // а без него не узнать к какой-то заметки оно привязано, по-этому делаем хитрый ход.
          if (imagesFromText.length) {
            imagesFromText.forEach(filename => {
              imageRepository.push({
                user_id: note.user_id,
                model_id: note.id,
                disk: UPLOAD_DISK,
                path: fullPath + '/' + filename,
                filename
              });
            })
          }

          /*
           * Обложки и фото из фотоальбома.
           */
          if (note.MediaBinds.length) {
            for (const MediaBind of note.MediaBinds) {
              if (MediaBind.dataValues.tag === 'cover') {
                note.cover_id = MediaBind.dataValues.media_id;
              } else {
                note.cover_id = note.MediaBinds[0].dataValues.media_id;
              }

              if (MediaBind.Medium) {
                const filename = MediaBind.Medium.dataValues.filename;

                imageRepository.push({
                  user_id: note.user_id,
                  model_id: note.id,
                  disk: UPLOAD_DISK,
                  path: fullPath + '/' + filename,
                  filename
                })
              }
            }
          }

          if (imageRepository.length) {
            for (const image of imageRepository) {
              await download('notes', image.filename, UPLOAD_DISK, fullPath, image.filename, 1920, 1080);

              delete image.filename;

              await new SQL(`${note.type}_images`, image)
                  .setDumpFolder('notes')
                  .parse();
            }
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
              .setHtmlFields(note.type === 'albums'
                  ? []
                  : ['text']
              )
              .parse();

          await new SQL('activity', {
            id: `emitter${note.user_id}${note.type}${note.id}`,
            event_id: 1,
            emitter_id: note.user_id,
            recipient_id: note.user_id,
            travel_id: note.id,
            model_type: note.type,
            model_id: note.id,
            weight: 0.0120,
            created_at: note.created_at,
          })
          .setFilename('notes_activity')
          .setDumpFolder('notes')
          .parse();
        }

        offset += notes.length;

        setTimeout(() => run(), 1000);
      });
}

run();
