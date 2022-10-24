const { mkdir } = require('node:fs/promises');
const getImagesFromString = require('../../utils/getImagesFromString');
const { uploadDirForPermanentImages, dateToPath, getOriginalFilePath } = require('../../utils/pathBuilder');
const { Sequelize } = require('../../database');
const { Download, SQL } = require('../../classes');
const { rndString } = require('../../utils');
const download = require('image-downloader');
const { UPLOAD_DISK, NOTE_IMAGE_SIZE, IMAGE_HOST, SKIP_DOWNLOAD } = require('../../constants');

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

      for await (let note of notes) {
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
        const fullPath = `${path}/${dateToPath(note.created_at)}`;
        const imageRepository = [];

        /*
         * Обложки и фото из фотоальбома.
         */
        note.cover_id = null;

        if (note.MediaBinds.length) {

          for await (const MediaBind of note.MediaBinds) {
            const outputFilename = rndString();

            imageRepository.push({
              user_id: note.user_id,
              model_id: note.id,
              disk: UPLOAD_DISK,
              path: `${fullPath}/${outputFilename}`,
              originalFilename: MediaBind.Medium.dataValues.filename,
              outputFilename: outputFilename
            });

            globalImageID[note.type]++;

            if (MediaBind.dataValues.tag === 'cover' && !note.cover_id) {
              note.cover_id = globalImageID[note.type];
            }
          }
        }

        // Парсим фотки из текста. Потому что в старой бд, есть фотки без module_id
        // а без него не узнать к какой-то заметки оно привязано, по-этому делаем хитрый ход.
        if (note.type === 'notes' || note.type === 'reviews') {
          const { string, images } = getImagesFromString(note.text);

          note.text = string;

          if (images.length) {
            for await (let image of images) {
              if (image.isRemote && SKIP_DOWNLOAD === false) {
                console.log(image.src + '---' + image.outputFilename)

                try {
                  const absolutePath = `/home/denis/trevio/parser/modules/notes/output/images/${fullPath}`;

                  await mkdir(absolutePath, { recursive: true });

                  await download.image({
                    url: image.src,
                    dest: `${absolutePath}/${image.outputFilename}`
                  })
                } catch (error) {
                  console.log(error)
                }
              }

              imageRepository.push({
                user_id: note.user_id,
                model_id: note.id,
                disk: UPLOAD_DISK,
                path: `${fullPath}/${image.outputFilename}`,
                originalFilename: image.originalFilename,
                outputFilename: image.outputFilename
              });

              globalImageID[note.type]++;

              note.text = note.text
                  .replace(new RegExp(`(data-src="(.*?)")`, 'g'), '')
                  .replace(new RegExp(`data-id="${image.src}"`, 'g'), `data-id="${globalImageID[note.type]}"`)
                  .replace(new RegExp(`src="${image.src}"`, 'g'), `src="${IMAGE_HOST}/${fullPath}/${image.outputFilename}"`);
            }
          }
        }

        if (imageRepository.length) {
          for await (let image of imageRepository) {
            await new Download('notes', image.originalFilename, fullPath, image.outputFilename)
                .setWidthHeight(NOTE_IMAGE_SIZE[0], NOTE_IMAGE_SIZE[1])
                .download();

           /* if (note.type === 'notes' || note.type === 'reviews') {
              const regExp = new RegExp(getOriginalFilePath(image.filename), 'g');

              if (regExp.test(note.text)) {
                note.text = note.text.replace(regExp, `https://images.treviodev.ru/development/${image.path}`);
              }
            }*/
            const fields = {...image};

            delete fields.originalFilename;
            delete fields.outputFilename;

            await new SQL(`${note.type}_images`, fields)
                .setOutputFolder('notes')
                .setOutputFilename(`trevio.${note.type}_images`)
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
          messages_count: note.messages_count,
          likes_count: likes.length,
          share_count: share.length,
          created_at: note.created_at,
          updated_at: note.updated_at,
          deleted_at: note.deleted_at,
          published_at: note.published_at,
        };

        // Типы контента с виз. редактором.
        if (['reviews', 'notes', 'questions'].indexOf(note.type) !== -1) {
          insert.short_text = note.short_text;
        }

        if (note.type === 'reviews') {
          insert.stars = note.rating;
        }

        if (note.type === 'albums') {
          insert.image_order = JSON.stringify(imageRepository.map((item, index) => index));
        }

        await new SQL(`trevio.${note.type}`, insert)
            .setOutputFolder('notes')
            .setAllowedTags(note.type === 'albums'
                ? []
                : ['p', 'tiptap-image', 'a', 'tiptap-embed']
            )
            .parse();

        let activityKey = `emitter${note.user_id}${note.type}${note.id}`;

        if (note.travel_id > 0) {
          activityKey = `emitter${note.user_id}travels${note.travel_id}${note.type}${note.id}`;
        }

        await new SQL(`trevio.activity`, {
          key: activityKey,
          type_id: 1,
          emitter_id: note.user_id,
          recipient_id: note.user_id,
          travel_id: note.travel_id,
          model_type: note.type,
          model_id: note.id,
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
