const settings = require('../settings');

module.exports = function getPathToOldMedia(filename) {
  return [
    settings.downloadUrl,
    'media',
    filename.substr(0, 1),
    filename.substr(1, 2),
    filename.substr(3, 2),
    filename,
  ].join('/')
};