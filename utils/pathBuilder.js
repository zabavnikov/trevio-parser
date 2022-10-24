const crypto = require('crypto')

const uploadDirForContentImages = (model) => {
    return dateToPath(model.created_at, model.user_id)
};

const uploadDirForPermanentImages = (id, folder = 'users') => {
    const md5 = crypto.createHash('md5')
        .update(id + '')
        .digest('hex');

    return [
        md5.substring(0, 4).match(/[a-z0-9]{2}/g).join('/'),
        id
    ].join('/')
};

const dateToPath = (modelCreatedAt = null) => {
    const date = new Date(Date.parse(modelCreatedAt));

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const path = [
        year,
        month <= 9 ? '0' + month : month,
        day <= 9 ? '0' + day : day,
    ];

    return path.join('/')
}

const getOriginalFilePath = (filename, host = 'https://trevio.ru/imagecache/content/media') => [
    host,
    filename.substr(0, 1),
    filename.substr(1, 2),
    filename.substr(3, 2),
    filename,
].join('/');

module.exports = { uploadDirForContentImages, uploadDirForPermanentImages, dateToPath, getOriginalFilePath };
