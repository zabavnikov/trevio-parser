const md5 = require('md5'),
  fs = require('fs'),
  request  = require('request-promise'),
  { sequelize } = require('../../../database'),
  settings = require('../../../settings');

let limit = 100, offset = 0;

function run() {
  const SQL = `
    SELECT users.id, users.avatar, media_bind.module_id, media_bind.media_id, media_bind.tag FROM users
      JOIN media_bind ON users.avatar = media_bind.media_id
      WHERE users.avatar > 0
      LIMIT ${limit}
      OFFSET ${offset}
  `;

  sequelize.query(SQL, {raw: true, type: sequelize.QueryTypes.SELECT})
    .then(media => {
      (async function() {
        console.log(`Файлов ${media.length}\r\n`);

        const ids = media.map(i => i.module_id).join(',');

        if (ids.length) {
          const MEDIA_SQL = `
            SELECT * FROM media WHERE id IN (${ids})
          `;

          await sequelize.query(MEDIA_SQL, {raw: true, type: sequelize.QueryTypes.SELECT})
            .then(async media => {
              await _parser(media);
            });
        }

        offset += limit;

        await run();
      })();
    });
}

run();

async function _parser(media) {
  for (const item of media) {
    const filepath = [
      settings.downloadUrl,
      'media',
      item.filename.substr(0, 1),
      item.filename.substr(1, 2),
      item.filename.substr(3, 2),
      item.filename,
    ].join('/');

    const output = [
      settings.paths.images,
      'users',
      md5(item.user_id).substr(0, 6).match(/[a-z0-9]{2}/g).join('/'),
      item.user_id
    ].join('/');

    if (!fs.existsSync(output)) {
      fs.mkdirSync(output, {recursive: true});
    }

    await request.get({
      url: filepath,
      encoding: null,
    })
    .then(response => {
      const buffer = Buffer.from(response, 'utf8');
      fs.writeFileSync(`${output}/avatar.jpg`, buffer);
    });
  }
}