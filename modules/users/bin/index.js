const fs = require('fs');
const http = require('http');
const md5 = require('md5');
const settings = require('../../../settings');
const helpers = require('../../../helpers');
const { sequelize } = require('../../../database');
const User = require('../models/User');

let limit = 200, offset = 0;

function run() {
  User
    .findAll({
      groupBy: ['email'],
      where: {confirmed: true},
      offset,
      limit,
    })
    .then(users => {
      users.forEach(user => {
        const normalize = helpers.normalizeFieldsOfModel(user.get());

        /*sequelize.query(`SELECT * FROM media JOIN media_bind ON media.id = media_bind.module_id WHERE id = ${user['id']} AND media_bind.tag = 'avatar'`, { type: sequelize.QueryTypes.SELECT})
          .then(media => {
            console.log(media);
            if (media && media['user_id']) {
              const filepath = `"${settings.paths.images}/users/${md5(media['user_id']).substr(0, 6).match(/[a-z0-9]{2}/g).join('/')}"`;

              if (!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, {recursive: true});
              }

              http.get(`${settings.downloadUrl}/media/0/92/47/09247c28215b8f34b4cd156ac2e32932.jpg`, response => {
                response.pipe(fs.createWriteStream(`${filepath}/avatar.jpg`));
              });
            }
          });*/

        // Удаляем чтобы колонка не попала в SQL.
        delete normalize['id'];

        fs.appendFile(
          settings.paths.sql + '/users/users.sql',
          `INSERT INTO users (${Object.keys(normalize).join(', ')}) VALUES (${Object.values(normalize).join(', ')});\r\n`,
          function (error) {
            if (error) return console.log(error);
          });
      });

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();