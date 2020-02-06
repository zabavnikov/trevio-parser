const path = require('path');

module.exports = {
  imageFolder: path.resolve(__dirname, './_dump/images'),

  /*
    ID модулей в таблице media_bind.
   */
  moduleIds: {
    1: 'travels',
    2: 'notes',
    99: 'users',
  },
};