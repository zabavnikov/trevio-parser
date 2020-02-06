class ImageParser {
  constructor(text) {
    this.text = text;
  }

  /**
   * Получаем текст с измененными путями.
   */
  getText() {
    const regExp = /(<img [^>]*src="[^"]*"[^>]*>)/gm;

    if (regExp.test(this.text)) {
      return this.text.replace(regExp, (match) => {
        // Разбиваем путь на части.
        const path = match
          .replace(/.*src="([^"]*)".*/, '$1')
          .split('storage')[1]
          .split('/');

        // Получаем элемент массива - это название файла.
        const filename = path[path.length - 1];

        console.log(filename)
      });
    }

    return this.text;
  }

  /**
   * Получаем массив путей к оригинальный изображениям.
   *
   * @returns {string[]|*}
   */
  getPathsToOriginalImages() {
    const regExp = /<img [^>]*src="[^"]*"[^>]*>/gm;

    if (regExp.test(this.text)) {
      return this.text.match(regExp).map(image => {
        return image.replace(/.*src="([^"]*)".*/, '$1').split('storage')[1];
      });
    }

    return [];
  }
}

module.exports = ImageParser;