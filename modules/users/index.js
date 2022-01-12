const md5 = require('md5');
const download = require('../../utils/download');
const toSql = require('../../utils/toSql');
const User = require('./models/User');

let limit = 200, offset = 0;

function run() {
  User
    .findAll({
      include: [{ all: true, nested: true }],
      order: [
        ['id', 'ASC'],
      ],
      offset,
      limit,
    })
    .then(async users => {
      if (users.length === 0) {
        return;
      }

      for await (let user of users) {
        user = user.get();

        const path = [
          md5(user.id).substr(0, 8).match(/[a-z0-9]{2}/g).join('/'),
          user.id,
        ].join('/');

        // Парсим аватар.
        /*if (user.avatar > 0) {
          await download(user.Medium, 'users/avatars', path, 'avatar.jpg', 200, 200);
        }*/

        const insert = {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          description: user.description,
          birthday: user.birthday,
          gender: user.sex,
          email_verified_at: user.confirmed
              ? user.created_at
              : null,
          last_activity_at: user.last_activity,
          created_at: user.created_at,
          updated_at: user.updated_at,
          avatar: `/users/${path}/avatar.jpg`,
        }

        let name = '';

        if (user.first_name !== null) {
          name += user.first_name;
        }

        if (user.last_name !== null) {
          name += ' ' + user.last_name;
        }

        if (name.length) {
          insert.name = name;
        }

        await toSql(insert, 'users');
      }

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
