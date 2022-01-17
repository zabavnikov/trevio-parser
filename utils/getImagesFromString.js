module.exports = string => {
  const imgRex = /<ce-image.*?src="(.*?)"[^>]+>/g;
  const images = [];
  let img;

  while ((img = imgRex.exec(string))) {
    const pathParts = img[1].split('/');
    const filename = pathParts[pathParts.length - 1];

    if (img[1].indexOf('trevio.ru') !== -1 && filename.indexOf('.') !== -1) {
      images.push(filename);
    }
  }

  return images;
};