const fs = require('fs'),
  http = require('http'),
  settings = require('../../settings'),
  Media = require('./Media')
MediaBind = require('./MediaBind');

let limit = 100, offset = 0;

function media() {
  /*if (offset >= 300) {
    return;
  }*/

  Media.hasOne(MediaBind, {
    foreignKey: 'media_id'
  });

  Media.findAll({
    offset,
    limit,
    include: {
      model: MediaBind,
    }
  })
  .then(async images => {
    for (const image of images) {
      http.get(`http://192.168.2.220/${image.path}`, async function (response) {
        const date = new Date(Date.parse(image.createdAt));

        /*
          Конечная папка для изображения.
         */
        const dir = [
          settings.paths.images,
          settings.moduleIds[image.MediaBind.module_type_id],
          date.getFullYear(),
          date.getUTCMonth() < 10 ? '0' + date.getUTCMonth() : date.getUTCMonth(),
          date.getUTCDay() < 10 ? '0' + date.getUTCDay() : date.getUTCDay(),
          image.user_id,
        ].join('/');

        if (! fs.existsSync(dir)) {
          fs.mkdirSync(dir, {recursive: true});
        }

        response.pipe(
          fs.createWriteStream(`${dir}/${image.filename}`)
        );
      });
    }

    offset += limit;

    setTimeout(function () {
      media();
    }, 5000)
  });
}

media();