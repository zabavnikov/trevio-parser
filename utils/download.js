const fs = require('fs');
const nodePath = require('path');
const request = require('request-promise');
const sharp = require('sharp');

/**
 * Получаем ссылку на оригинальное изображение.
 *
 * @param filename
 * @returns {string}
 * @private
 */
const _getUrlOfOriginalImage = filename => {
  return [
    'https://trevio.ru/storage/media',
    filename.substr(0, 1),
    filename.substr(1, 2),
    filename.substr(3, 2),
    filename,
  ].join('/')
};

/**
 *
 * Сохраняем оригинальное изображение по указанному пути.
 *
 * @param file
 * @param disk
 * @param path
 * @param filename
 * @param width
 * @param height
 *
 * @returns {Promise<{filepath: string}>}
 */
module.exports = async (file, disk, path, filename = false, width = null, height = null) => {

  // Если не указаном имя изображения, то берем название оригинального изображения.
  if (! filename) {
    filename = file.filename;
  }

  if (! /\./.test(filename)) {
    filename += '.jpg';
  }

  const outputDir = [nodePath.resolve(__dirname, '../_dump'), disk, path].join('/');

  if (! fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  await request
    .get({url: _getUrlOfOriginalImage(file.filename), encoding: null})
    .then(response => {
      const output = `${outputDir + '/' + filename}`;
      const buffer = Buffer.from(response, 'utf8');

      if (width || height) {
        sharp(buffer)
            .resize(width, height, {
              withoutEnlargement: true
            })
            .removeAlpha()
            .toFile(output, (err, info) => {
                if (err) console.log(err);
            });
      } else {
        fs.writeFileSync(output, buffer)
      }
    })
    .catch(error => console.log('error'));

  return path + '/' + filename;
};
