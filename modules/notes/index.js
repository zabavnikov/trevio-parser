const getImagesFromString = require('../../utils/getImagesFromString');
const {uploadDirForPermanentImages, dateToPath, getOriginalFilePath} = require('../../utils/pathBuilder');
const imgproxy = require('../../utils/imgproxy');
const {UPLOAD_DISK, DOMAIN} = require('../../constants');
const Note = require('./models/Note');
const { Download, SQL } = require('../../classes');
const LikesParserPartial = require('../likes/likes-parser-partial');

let limit = 100,
    offset = 0,
    globalImageID = {
      notes: 0,
      reviews: 0,
      albums: 0,
    }

function run() {
  Note
      .findAll({
        order: [
          ['id', 'ASC'],
        ],
        offset,
        limit,
        include: {all: true, nested: true},
      })
      .then(async notes => {
        if (notes.length === 0) return;

        for (let note of notes) {
          note = note.get();

          const path = uploadDirForPermanentImages(note.user_id);
          const fullPath = `users/${path}/${note.type}/${dateToPath(note.created_at)}`;
          const imageRepository = [];

          /*
           * Обложки и фото из фотоальбома.
           */
          note.cover_id = null;

          if (note.MediaBinds.length) {
            for (const MediaBind of note.MediaBinds) {
              const filename = MediaBind.Medium.dataValues.filename;

              imageRepository.push({
                user_id: note.user_id,
                model_id: note.id,
                disk: UPLOAD_DISK,
                path: `${fullPath}/${note.id}-${filename}`,
                filename
              });

              globalImageID[note.type]++;

              if (MediaBind.dataValues.tag == 'cover' && !note.cover_id) {
                note.cover_id = globalImageID[note.type];
              }
            }
          }

          // Парсим фотки из текста. Потому что в старой бд, есть фотки без module_id
          // а без него не узнать к какой-то заметки оно привязано, по-этому делаем хитрый ход.
          if (note.type === 'notes' || note.type === 'reviews') {
            const imagesFromText = getImagesFromString(note.text);

            if (imagesFromText.length) {
              imagesFromText.forEach(image => {
                imageRepository.push({
                  user_id: note.user_id,
                  model_id: note.id,
                  disk: UPLOAD_DISK,
                  path: `${fullPath}/${note.id}-${image.filename}`,
                  filename: image.filename,
                });

                globalImageID[note.type]++;

                if (image.id) {
                  note.text = note.text.replace(new RegExp(`data-id="${image.id}"`, 'g'), `data-id="${globalImageID[note.type]}"`);
                }
              })
            }
          }

          if (imageRepository.length) {
            for (const image of imageRepository) {
              const fields = {...image};
              delete fields.filename;

              /*await new Download('notes', image.filename, fullPath, `${note.id}-${image.filename}`)
                  .setWidthHeight(640, 480)
                  .download();*/

              if (note.type === 'notes' || note.type === 'reviews') {
                const regExp = new RegExp(getOriginalFilePath(image.filename), 'g');

                if (regExp.test(note.text)) {
                  note.text = note.text.replace(regExp, `${DOMAIN}/${image.path}`);
                }
              }

              await new SQL(`${note.type}_images`, fields)
                  .setDumpFolder('notes')
                  .parse();
            }
          }

          /*
            ЛАЙКИ.
           */
          const likes = await LikesParserPartial('notes', `${note.type}_likes`, {
            likes_id: note.id,
            module_type: 2,
          }, note);

          const insert = {
            id: note.id,
            chat_id: note.id,
            user_id: note.user_id,
            travel_id: note.travel_id,
            cover_id: note.cover_id,
            title: note.title,
            text: `<p>${note.short_text}</p>${note.text}`,
            messages_count: note.messages_count,
            likes_count: likes.length,
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
              .setAllowedTags(note.type === 'albums'
                  ? []
                  : ['p', 'ce-image', 'a']
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
