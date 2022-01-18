const wysiwyg = (string) => {
  return string
      .replace(
          /<img.*?src="(.*?)" .*?data-id="(.*?)"[^>]+>/g,
          `<ce-image src="$1" data-id="$2"></ce-image>`
      )
      .replace(/<br.*?>/, '')
      .replace(/&nbsp;/, '')
      .replace('null', '')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>\s+<\/p>/g, '')
      .trim();
};

module.exports = wysiwyg;