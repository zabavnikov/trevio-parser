const { SQL, Download } = require('../../classes');
const { uploadDirForPermanentImages } = require('../../utils/pathBuilder');
const User = require('./models/User');
const { UPLOAD_DISK } = require('../../constants');

let limit = 400, offset = 0;
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

      for (let user of users) {
        user = user.get();

        const path = uploadDirForPermanentImages(user.id);
        const hasAvatar = user.avatar > 0;

        const fields = {
          id: user.id,
          name: user.username,
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

        // Парсим аватарку если есть.
        if (hasAvatar) {
          fields.avatar = `/users/${path}/avatar.jpg`;

          /*await new Download('users', user.Medium.filename, `users/${path}`, 'avatar.jpg')
              .setWidthHeight(200, 200)
              .download();*/
        }

        await new SQL('trevio.users', fields)
            .setOutputFolder('users')
            .parse();

        await new SQL('trevio.wallets', {
          user_id:    user.id,
          balance:    300,
        })
            .setOutputFolder('users')
            .parse();
      }

      offset += users.length;

      setTimeout(() => run(), 1000);
    });
}

run();
