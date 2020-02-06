const fs = require('fs'), http = require('http');

function saveImageToDisk(url, localPath) {
  http.get(url, function(response) {
    response.pipe(fs.createWriteStream(localPath));
  });
}

/**
 * Парсим изображения в тексте.
 *
 * @param text
 * @returns {string[]}
 */
function getImageUrlFromText(text) {
  const regExp = /<img [^>]*src="[^"]*"[^>]*>/gm;

  if (regExp.test(text)) {
    return text.match(regExp).map(image => {
      return image.replace(/.*src="([^"]*)".*/, '$1').split('storage')[1];
    });
  }
}

module.exports = { getImageUrlFromText, saveImageToDisk };