const fs = require('fs');
const settings = require('../../settings');
const helpers = require('../../helpers');
const User = require('./models/User');

let limit = 200, offset = 0;

function run() {
  User
    .findAll({
      groupBy: ['email'],
      where: {confirmed: true},
      offset,
      limit,
      raw: true,
    })
    .then(users => {
      users.forEach(user => {
        delete user.id;

        fs.appendFile(
          settings.paths.sql + '/users/users.sql',
          `INSERT INTO users (${Object.keys(user).join(', ')}) VALUES (${helpers.normalizeFieldsOfModel(user).join(', ')});\r\n`,
          function (error) {
            if (error) return console.log(error);
          });
      });

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();