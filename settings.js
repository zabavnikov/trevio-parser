const path = require('path');

module.exports = {
  /*
    Будет подставляться в поле wysiwyg.
   */
  url: 'https://trevio.ru/storage',

  /*
    Откуда качаем изображения
   */
  downloadUrl: 'http://192.168.2.220:5000/storage',

  paths: {
    saveTo: path.resolve(__dirname, './_dump'),
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