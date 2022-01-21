const getImagesFromString = require('../../utils/getImagesFromString');
const {uploadDirForPermanentImages, dateToPath, getOriginalFilePath} = require('../../utils/pathBuilder');
const { imgproxy } = require('../../utils');
const { Sequelize } = require('../../database');
const { Download, SQL } = require('../../classes');
const { UPLOAD_DISK, DOMAIN } = require('../../constants');

const {
  Note,
  Company,
  Media,
  MediaBind
} = require('../../models');

const LikesParserPartial = require('../likes/likes-parser-partial');
const ShareParserPartial = require('../share/share-parser-partial');

let offset = 0,
    limit = 100,
    globalImageID = {
      notes: 0,
      reviews: 0,
      albums: 0,
    }

async function run() {
  const companies = await Company.findAll();

  Note
    .findAll({
      include: [
        {
          model: MediaBind,
          include: [
            { model: Media, required: false },
          ]
        },
      ],
      where: {
        user_id: {
          [Sequelize.Op.notIn]: companies.map(company => company.user_id)
        },
      },
      offset,
      limit,
    })
    .then(async notes => {
      if (notes.length === 0) return;

      for (let note of notes) {
        note = note.get();

        /*
          ЛАЙКИ.
         */
        const likes = await LikesParserPartial('notes', `${note.type}_likes`, {
          likes_id: note.id,
          module_type: 2,
        }, note);

        /*
          ШАРА.
         */
        const share = await ShareParserPartial('notes', `${note.type}_share`, {
          model_id:   note.id,
          model_type: 'Modules\\Notes\\Entities\\Notes',
        }, note);

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
                note.text = note.text.replace(regExp, imgproxy(image.path));
              }
            }

            await new SQL(`${note.type}_images`, fields)
                .setOutputFolder('notes')
                .setOutputFilename(`trevio.${note.type}_images`)
                .parse();
          }
        }

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
          share_count: share.length,
          created_at: note.created_at,
          updated_at: note.updated_at,
          deleted_at: note.deleted_at,
          published_at: note.published_at,
        };

        if (note.type === 'reviews') {
          insert.stars = note.rating;
        }

        await new SQL(`trevio.${note.type}`, insert)
            .setOutputFolder('notes')
            .setAllowedTags(note.type === 'albums'
                ? []
                : ['p', 'ce-image', 'a', 'iframe']
            )
            .parse();

        await new SQL(`trevio.activity`, {
          key: `emitter${note.user_id}${note.type}${note.id}`,
          event_id: 1,
          emitter_id: note.user_id,
          recipient_id: note.user_id,
          travel_id: note.id,
          model_type: note.type,
          model_id: note.id,
          weight: 0.0120,
          created_at: note.created_at,
        })
        .setOutputFolder('notes')
        .setOutputFilename(`trevio.${note.type}_activity`)
        .parse();
      }

      offset += notes.length;

      setTimeout(() => run(), 1000);
    });
}

run();
