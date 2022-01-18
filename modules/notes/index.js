const argv = require('minimist')(process.argv.slice(2));

const getImagesFromString = require('../../utils/getImagesFromString');
const {uploadDirForPermanentImages, dateToPath, getOriginalFilePath} = require('../../utils/pathBuilder');
const imgproxy = require('../../utils/imgproxy');
const wysiwyg = require('../../utils/wysiwyg');
const {UPLOAD_DISK, DOMAIN} = require('../../constants');
const Note = require('./models/Note');
const { Download, SQL } = require('../../classes');

let limit = 100,
    offset = 0;

function run() {
  Note
      .findAll({
        include: {all: true, nested: true},
        offset,
        limit,
      })
      .then(async notes => {
        if (notes.length === 0) return;

        for (let note of notes) {
          note = note.get();
          note.cover_id = null;

          const path = uploadDirForPermanentImages(note.user_id);
          const fullPath = `users/${path}/${note.type}/${dateToPath(note.created_at)}`;
          const imageRepository = [];

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

              const filename = MediaBind.Medium.dataValues.filename;

              imageRepository.push({
                id: MediaBind.Medium.dataValues.id,
                user_id: note.user_id,
                model_id: note.id,
                disk: UPLOAD_DISK,
                path: `${fullPath}/${note.id}-${filename}`,
                filename
              });
            }
          }

          if (note.type === 'notes') {
            const imagesFromText = getImagesFromString(note.text);

            // Парсим фотки из текста. Потому что в старой бд, есть фотки без module_id
            // а без него не узнать к какой-то заметки оно привязано, по-этому делаем хитрый ход.
            if (imagesFromText.length) {
              imagesFromText.forEach(image => {
                imageRepository.push({
                  id: image.id,
                  user_id: note.user_id,
                  model_id: note.id,
                  disk: UPLOAD_DISK,
                  path: `${fullPath}/${note.id}-${image.filename}`,
                  filename: image.filename,
                });
              })
            }
          }

          if (imageRepository.length) {
            for await (const image of imageRepository) {
              // console.log(imgproxy(image.path), `${DOMAIN}/${image.path}`)

              /*await new Download('notes', image.filename, fullPath, `${note.id}-${image.filename}`)
                  .setWidthHeight(640, 480)
                  .download();*/

              if (note.type === 'notes') {
                const regExp = new RegExp(getOriginalFilePath(image.filename), 'g');

                if (regExp.test(note.text)) {
                  note.text = note.text.replace(regExp, `"${DOMAIN}/${image.path}"`);
                }
              }

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
            text: `<p>${note.short_text}</p>${wysiwyg(note.text)}`,
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
