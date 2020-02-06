const Note = require('./Note');
const Media = require('../media/Media');

const ImageParser = require('../../ImageParser');

Note.findByPk(6)
  .then(response => {
    const imageParser = new ImageParser(response.wysiwyg);

    /*
      Пути до изображений.
     */
    const paths = imageParser.getPathsToOriginalImages();

    console.log(imageParser.getText());

    /*
      Названия изображений.
     */
    /*const filenames = [];

    paths.forEach(path => {
      // Разбиваем путь на части.
      path = path.split('/');

      // Получаем элемент массива - это название файла.
      filenames.push(path[path.length - 1])
    });

    Media.findAll({
      where: {
        filename: filenames
      }
    })
    .then(response => {
      console.log(response)
    });*/
  });
