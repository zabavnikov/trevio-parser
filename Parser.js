const fs = require('fs'), http = require('http'), settings = require('./settings'), Media = require('./modules/media/Media');

class Parser {
  /**
   * @param model - объект.
   * @param modelType - notes, travels, users, etc...
   */
  constructor(model, modelType) {
    if (! model || !modelType) {
      throw new Error('В конструктор переданы не все параметры.');
    }

    this.model = model;
    this.modelType = modelType;
    this.images = [];
    this.id = 1;

    this._process();
  }

  _process() {
    const regExp = /(<img [^>]*src="[^"]*"[^>]*>)/gm;

    if (regExp.test(this.model.wysiwyg)) {
      /*
        Заменяем ссылки в тексте.
       */
      this.model.wysiwyg = this.model.wysiwyg.replace(regExp, (match) => {
        const relativePath = match.replace(/.*src="([^"]*)".*/, '$1').split('storage')[1];

        if (relativePath) {
          // Разбиваем путь на части.
          const pathParts = relativePath.split('/');

          // Последний элемент массива - это название файла.
          const filename = pathParts[pathParts.length - 1];

          this.id += 1;

          this.images.push({
            id: this.id,
            owner_id: this.model.user_id,
            model_id: this.model.id,
            disk: this.modelType,
            path: `${this._relativePath()}/${filename}`,
            created_at: this.model.createdAt,
            updated_at: this.model.createdAt,
          });

          this._download(relativePath, filename);

          const oRelativePath = `${this._relativePathWithPrefix()}/${filename}`;

          return `
          <img src="/imageache/${oRelativePath}" data-id="${this.id}" data-src="https://trevio.ru/storage/${oRelativePath}" />
        `.trim();
        }

        return match;
      });
    }
  }

  /**
   * Получаем текст с измененными путями.
   */
  getModel() {
    return this.model;
  }

  getImages() {
    return this.images;
  }

  /**
   * Путь к папке с изображениями.
   *
   * @private
   */
  _relativePath() {
    return [
      new Date(Date.parse(this.model.createdAt)).toISOString().slice(0, 10).replace(/-/g,'/'),
      this.model.user_id
    ].join('/');
  }

  /**
   * Путь к папке с изображениями с префиксом в виде названия модуля для которого парсим изображения.
   * moduleType - тут в качестве названия диска.
   *
   * @private
   */
  _relativePathWithPrefix() {
    return this.modelType + '/' + this._relativePath();
  }

  /**
   * Абсолютный путь к новой папке с изображениями.
   *
   * @returns {string}
   * @private
   */
  _absolutePath() {
    return `${settings.paths.images}/${this._relativePathWithPrefix()}`;
  }

  /**
   * Скачиваем изображение.
   *
   * @param source
   * @param filename
   *
   * @private
   */
  _download(source, filename) {
    const absolutePath = this._absolutePath();

    if (! fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, {recursive: true});
    }

    http.get(`${settings.downloadUrl}/${source}`, response => {
      response.pipe(fs.createWriteStream(`${absolutePath}/${filename}`));
    });
  }
}

module.exports = Parser;