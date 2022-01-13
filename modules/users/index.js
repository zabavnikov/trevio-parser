const download = require('../../utils/download');
const toSql = require('../../utils/toSql');
const { uploadDirForPermanentImages } = require('../../utils/pathBuilder');
const User = require('./models/User');
const { Op } = require('sequelize');
const { UPLOAD_DISK } = require('../../constants');

let limit = 200, offset = 0;

function run() {
  User
    .findAll({
      where: {
        confirmed: 1
      },
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

        const path = uploadDirForPermanentImages(user.id);
        const hasAvatar = user.avatar > 0;

        const insert = {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          description: user.description,
          birthday: user.birthday,
          gender: user.sex,
          email_verified_at: user.created_at,
          last_activity_at: user.last_activity,
          created_at: user.created_at,
          updated_at: user.updated_at,
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

        // Парсим аватарку если есть.
        if (hasAvatar) {
          insert.avatar = `/users/${path}/avatar.jpg`;
          await download('users', user.Medium, UPLOAD_DISK, path, 'avatar.jpg', 200, 200);
        }

        await toSql(insert, 'users');
      }

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
