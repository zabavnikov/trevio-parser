const path = require('path');

module.exports = {
  downloadUrl: 'http://192.168.2.220/storage',

  paths: {
    images: path.resolve(__dirname, './_dump/images'),
    sql: path.resolve(__dirname, './_dump/sql'),
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