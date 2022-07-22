module.exports = string => {
  const regExp = /<tiptap-image.*?src="(.*?)".*?data-id="(.*?)"><\/tiptap-image>/g;
  const images = [];

  let image;

  while ((image = regExp.exec(string))) {
    const src = image[1];
    const id  = image[2];

    const partials = src.split('/');
    const filename = partials[partials.length - 1];

    if (src.indexOf('http') !== -1 && filename.indexOf('.') !== -1) {
      images.push({
        filename,
        id
      });
    }
  }

  return images;
};