const getImagesFromString = require('../../utils/getImagesFromString');
const {uploadDirForPermanentImages, dateToPath, getOriginalFilePath} = require('../../utils/pathBuilder');
const { rndString } = require('../../utils');

const {UPLOAD_DISK, NOTE_IMAGE_SIZE} = require('../../constants');
const { Download, SQL } = require('../../classes');

const {
  Note,
  MediaBind,
  Media,
  Company
} = require('../../models');

const LikesParserPartial = require('../likes/likes-parser-partial');
const ShareParserPartial = require('../share/share-parser-partial');

let limit = 100,
    offset = 0;
const globalImageID = {
  notes: 0,
  reviews: 0,
  albums: 0,
  posts: 0,
}

async function run() {
  const companies = await Company.findAll();

  Note
    .findAll({
      offset,
      limit,
      include: [
        {
          model: MediaBind,
          include: [
            { model: Media, required: false },
          ]
        },
      ],
      where: {
        user_id: companies.map(company => company.user_id),
      },
    })
    .then(async posts => {
      if (posts.length === 0) return;

      for (let post of posts) {
        post = post.get();

        /*
          ЛАЙКИ.
         */
        const likes = await LikesParserPartial('posts', 'posts_likes', {
          likes_id: post.id,
          module_type: 2,
        }, post);

        /*
          ШАРА.
         */
        const share = await ShareParserPartial('posts', 'posts_share', {
          model_id:   post.id,
          model_type: 'Modules\\Notes\\Entities\\Notes',
        }, post);

        const path = uploadDirForPermanentImages(post.user_id);
        const fullPath = `${path}/${dateToPath(post.created_at)}`;
        const imageRepository = [];

        /*
         * Обложки и фото из фотоальбома.
         */
        post.cover_id = null;

        if (post.MediaBinds.length) {
          for (const MediaBind of post.MediaBinds) {
            const filename = rndString();

            imageRepository.push({
              user_id: post.user_id,
              model_id: post.id,
              disk: UPLOAD_DISK,
              path: `${fullPath}/${filename}`,
              filename: filename
            });

            globalImageID[post.type]++;

            if (MediaBind.dataValues.tag === 'cover' && !post.cover_id) {
              post.cover_id = globalImageID[post.type];
            }
          }
        }

        // Парсим фотки из текста. Потому что в старой бд, есть фотки без module_id
        // а без него не узнать к какой-то заметки оно привязано, по-этому делаем хитрый ход.
        if (post.type === 'notes' || post.type === 'reviews' || post.type === 'posts') {
          const imagesFromText = getImagesFromString(post.text);

          if (imagesFromText.length) {
            imagesFromText.forEach(image => {
              const filename = rndString();

              imageRepository.push({
                user_id: post.user_id,
                model_id: post.id,
                disk: UPLOAD_DISK,
                path: `${fullPath}/${filename}`,
                filename: filename,
              });

              globalImageID[post.type]++;

              if (image.id) {
                post.text = post.text.replace(new RegExp(`data-id="${image.id}"`, 'g'), `data-id="${globalImageID[post.type]}"`);
              }
            })
          }
        }

        if (imageRepository.length) {
          for (const image of imageRepository) {
            const fields = {...image};
            delete fields.filename;

            await new Download('posts', image.filename, fullPath, image.filename)
                .setWidthHeight(NOTE_IMAGE_SIZE[0], NOTE_IMAGE_SIZE[1])
                .download();

            if (post.type === 'albums') {
              post.text += `<tiptap-image src="https://images.treviodev.ru/development/${image.path}" data-id="${image.id}"></tiptap-image>`
            } else {
              const regExp = new RegExp(getOriginalFilePath(image.filename), 'g');

              if (regExp.test(post.text)) {
                post.text = post.text.replace(regExp, `https://images.treviodev.ru/development/${image.path}`);
              }
            }

            await new SQL('trevio.posts_images', fields)
                .setOutputFolder('posts')
                .setOutputFilename('trevio.posts_images')
                .parse();
          }
        }

        const insert = {
          id: post.id,
          user_id: post.user_id,
          cover_id: post.cover_id,
          title: post.title,
          short_text: post.short_text,
          text: `<p>${post.short_text}</p>${post.text}`,
          messages_count: post.messages_count,
          likes_count: likes.length,
          share_count: share.length,
          images_count: imageRepository.length,
          created_at: post.created_at,
          updated_at: post.updated_at,
          deleted_at: post.deleted_at,
          published_at: post.published_at,
        };

        await new SQL('trevio.posts', insert)
            .setOutputFolder('posts')
            .setAllowedTags(post.type === 'albums'
                ? []
                : ['p', 'tiptap-image', 'a', 'tiptap-embed', 'h2']
            )
            .parse();

        await new SQL('trevio.activity', {
          key: `emitter${post.user_id}posts${post.id}`,
          type_id: 1,
          emitter_id: post.user_id,
          recipient_id: post.user_id,
          model_type: 'posts',
          model_id: post.id,
          created_at: post.created_at,
        })
        .setOutputFolder('posts')
        .setOutputFilename('trevio.posts_activity')
        .parse();
      }

      offset += posts.length;

      setTimeout(() => run(), 1000);
    });
}

run();
