const md5 = require('md5'),
  fs = require('fs'),
  request  = require('request-promise'),
  { Sequelize } = require('../../database'),
  settings = require('../../settings'),
  User = require('../users/models/User');

const Op = Sequelize.Op;

let limit = 10, offset = 0;

async function run() {
  User
    .findAll({
      include: [{ all: true, nested: true }],
      where: {
        avatar: {
          [Op.gt]: 0
        },
        tag: Sequelize.where(Sequelize.col('MediaBind.tag'), {
          [Op.eq]: 'avatar'
        })
      },
      offset,
      limit,
    })
    .then(async users => {

      users.forEach(async user => {
        if (user.MediaBind && user.MediaBind.Medium.filename) {
          await _parser(user.id, user.MediaBind.Medium.filename);
        }
      });

      offset += limit;

      await run();
    });
}

run();

async function _parser(userId, filename) {
  const filepath = [
    settings.downloadUrl,
    'media',
    filename.substr(0, 1),
    filename.substr(1, 2),
    filename.substr(3, 2),
    filename,
  ].join('/');

  const output = [
    settings.paths.saveTo,
    'users/avatars',
    md5(userId).substr(0, 8).match(/[a-z0-9]{2}/g).join('/'),
    userId
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
    })
    .catch(error => console.log('error'));
}