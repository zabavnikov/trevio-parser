const path = require('path');

module.exports = {
  downloadUrl: 'http://192.168.2.220/storage',

  paths: {
    images: path.resolve(__dirname, './_dump/images'),
    json: path.resolve(__dirname, './_dump/json'),
    mysql: path.resolve(__dirname, './_dump/mysql'),
  },

  /*
    ID модулей в таблице media_bind.
   */
  moduleIds: {
    1: 'travels',
    2: 'notes',
    99: 'users',
  },
};