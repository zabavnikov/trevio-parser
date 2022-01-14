const fs = require('fs').promises;
const { existsSync } = require('fs');

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
    '/mnt/e/treivo-images/webserver/public_html/shared/storage/app/public/media',
    filename.substr(0, 1),
    filename.substr(1, 2),
    filename.substr(3, 2),
    filename,
  ].join('/');
};

/**
 *
 * Сохраняем оригинальное изображение по указанному пути.
 *
 * @param moduleName
 * @param file
 * @param disk
 * @param path
 * @param outputFilename
 * @param width
 * @param height
 *
 * @returns {Promise<{filepath: string}>}
 */
module.exports = async (moduleName, file, disk, path, outputFilename = false, width = null, height = null) => {

  // Если не указаном имя изображения, то берем название оригинального изображения.
  if (! outputFilename) {
    outputFilename = file.filename;
  }

  if (! /\./.test(outputFilename)) {
    outputFilename += '.jpg';
  }

  const outputDir = [nodePath.resolve(__dirname, `../modules/${moduleName}/dump/images`), disk, path].join('/');

  if (! existsSync(outputDir)) {
    await fs.mkdir(outputDir, {
      recursive: true
    });
  }

  let response = await fs.readFile(_getUrlOfOriginalImage(file.filename));

  const output = `${outputDir + '/' + outputFilename}`;

  if (width || height) {
    response = await sharp(response)
        .resize(width, height, {
          withoutEnlargement: true
        })
        .removeAlpha()
        .toBuffer();
  }

  await fs.writeFile(output, response, 'base64');

    /*if (width || height) {
      await sharp(buffer)
          .resize(width, height, {
            withoutEnlargement: true
          })
          .removeAlpha();
    } else {
      await fs.writeFile(output, 'test.txt', error => {
        if (error) throw error;
      });
    }*/

  /*await request
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
    .catch(error => error);*/

  return path + '/' + outputFilename;
};
