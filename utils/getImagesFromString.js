const { rndString } = require('./');

module.exports = string => {
  const images = [];

  const matches = string.match(/<tiptap-image(.*?)><\/tiptap-image>/g);

  if (Array.isArray(matches)) {
    matches.forEach(tag => {
      let src = /src="(.*?)"/g.exec(tag);

      src = src[0].split('src="')[1]
      src = src.substring(0, src.length - 1)

      string = string.replace(tag, `<tiptap-image src="${src}" data-id="${src}"></tiptap-image>`);

      const partials = src.split('/');

      const originalFilename = partials[partials.length - 1];

      if (src.indexOf('http') !== -1 && originalFilename.indexOf('.') !== -1) {
        images.push({
          originalFilename,
          outputFilename: rndString(),
          isRemote: !src.startsWith('https://trevio.ru'),
          src
        });
      }
    })
  }

  return {
    string,
    images
  };
};