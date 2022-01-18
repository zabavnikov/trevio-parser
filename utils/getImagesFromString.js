module.exports = string => {
  const regExp = /<img.*?src="(.*?)"[^>]+>/g;
  const images = [];

  let image;

  while ((image = regExp.exec(string))) {
    const src = image[1];

    const partials = src.split('/');
    const filename = partials[partials.length - 1];

    if (src.indexOf('trevio.ru') !== -1 && filename.indexOf('.') !== -1) {
      images.push(filename);
    }
  }

  return images;
};