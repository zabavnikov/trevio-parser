const fs = require('fs');
const request  = require('request-promise');
const forEach = require('lodash/forEach');
const getPathToOldMedia = require('../../utils/getPathToOldMedia');
const settings = require('../../settings');
const MediaBind = require('../../modules/media/MediaBind');


let limit = 20, offset = 0;

const moduleTypeId = 1; // travels

function run() {
  MediaBind
    .findAll({
      include: [{ all: true, nested: true }],
      where: {
        module_type_id: moduleTypeId,
        tag: 'cover',
      },
      order: [
        ['created_at', 'DESC'],
      ],
      offset,
      limit,
    })
    .then(covers => {
      const file = `${settings.paths.saveTo}/travels/travels_images.sql`;

      forEach(covers, cover => {
        _parser(cover.Medium);

        cover = cover.get();

        const fields = {
          owner_id: cover.Medium.user_id,
          model_id: cover.module_id,
          disk: `"public"`,
          path: `"${_output('travels/images', cover.Medium, true)}"`
        };

        fs.appendFile(
          file,
          `INSERT INTO travels_images (${Object.keys(fields).join(', ')}) VALUES (${Object.values(fields).join(', ')});\r\n`,
          function (error) {
            if (error) return console.log(error);
          });
      });

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();

function _parser(model)
{
  const output = _output('travels/images', model);

  if (! fs.existsSync(output)) {
    fs.mkdirSync(output, {recursive: true});
  }

  request.get({
    url: getPathToOldMedia(model.filename),
    encoding: null,
  })
    .then(response => {
      const buffer = Buffer.from(response, 'utf8');
      fs.writeFileSync(`${output}`, buffer);
    })
    .catch(error => console.log('error'));
}

function _output(folder, model, isRelative = false) {
  const date = new Date(model.created_at);

  const month = date.getMonth() + 1;
  const day = date.getDate();

  let arr = [
    settings.paths.saveTo,
    folder,
    date.getFullYear(),
    month > 9 ? month : '0' + month,
    day > 9 ? day : '0' + day,
    model.user_id,
  ];

  if (isRelative) {
    arr.splice(0, 2);
  }

  return arr.join('/') + model.filename;
}
