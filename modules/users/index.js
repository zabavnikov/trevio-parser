const md5 = require('md5');
const download = require('../../utils/download');
const toSql = require('../../utils/toSql');
const User = require('./models/User');

let limit = 50, offset = 0;

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
      for await (let user of users) {
        user = user.get();

        let avatar = null;

        const path = [
          md5(user.id).substr(0, 8).match(/[a-z0-9]{2}/g).join('/'),
          user.id,
        ].join('/');

        // Парсим аватар.
        if (user.avatar > 0) {
          avatar = await download(user.Medium, 'users/avatars', path, 'avatar.jpg', 200, 200);
        }

        await toSql({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          description: user.description,
          first_name: user.first_name,
          last_name: user.last_name,
          birthday: user.birthday,
          created_at: user.created_at,
          updated_at: user.updated_at,
          avatar: avatar,
        }, 'users');
      }

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
