const fs = require('fs'), http = require('http'), forEach = require('lodash/forEach');;

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


function normalizeData(model, schema) {
  const values = [];

  forEach(schema, (newFieldName, oldFieldName) => {
    let value = model[oldFieldName];

    if (typeof value === 'string') {
      value = `'${value}'`;
    }

    if (value === null) {
      value = `${null}`;
    }

    if (oldFieldName === 'createdAt' || oldFieldName === 'updatedAt') {
      value = `'${new Date(Date.parse(model[oldFieldName])).toLocaleString()}'`;
    }

    values.push(value);
  });

  return values;
}

module.exports = { normalizeData, getImageUrlFromText, saveImageToDisk };