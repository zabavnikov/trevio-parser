const fs = require('fs').promises;
const { existsSync } = require('fs');
const nodePath = require('path');
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
    '/var/trevio_images/LAST_Media/webserver/public_html/shared/storage/app/public/media',
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
 * @param filename
 * @param disk
 * @param path
 * @param outputFilename
 * @param width
 * @param height
 *
 * @returns {Promise<{filepath: string}>}
 */
module.exports = async (moduleName, filename, disk, path, outputFilename = false, width = null, height = null) => {

  const isImageExists = _getUrlOfOriginalImage(filename);

  if (existsSync(isImageExists)) {
    // Если не указаном имя изображения, то берем название оригинального изображения.
    if (!outputFilename) {
      outputFilename = filename;
    }

    if (!/\./.test(outputFilename)) {
      outputFilename += '.jpg';
    }

    const outputDir = [nodePath.resolve(__dirname, `../modules/${moduleName}/output/images`), disk, path].join('/');

    if (! existsSync(outputDir)) {
      await fs.mkdir(outputDir, {
        recursive: true
      });
    }

    let response = await fs.readFile(_getUrlOfOriginalImage(filename));

    const output = `${outputDir + '/' + outputFilename}`;

    if (width || height) {
      response = await sharp(response)
          .jpeg({
            mozjpeg: true,
          })
          .resize(width, height, {
            withoutEnlargement: true
          })
          .removeAlpha()
          .toBuffer();
    }

    await fs.writeFile(output, response, 'base64');
  }
};
