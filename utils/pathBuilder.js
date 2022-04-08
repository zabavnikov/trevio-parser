const md5 = require('md5');

const uploadDirForContentImages = (model) => {
    return dateToPath(model.created_at, model.user_id)
};

const uploadDirForPermanentImages = (modelId, depth = 2) => {
    return [
        md5(modelId).substr(0, depth * 2).match(/[a-z0-9]{2}/g).join('/'),
        modelId
    ].join('/')
};

const dateToPath = (modelCreatedAt, modelUserId = null) => {
    const date = new Date(Date.parse(modelCreatedAt));

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const path = [
        year,
        month <= 9 ? '0' + month : month,
        day <= 9 ? '0' + day : day,
    ];

    if (modelUserId) {
        path.push(modelUserId)
    }

    return path.join('/')
}

const getOriginalImagePath = (filename, host = 'https://trevio.ru/imagecache/content/media') => [
    host,
    filename.substr(0, 1),
    filename.substr(1, 2),
    filename.substr(3, 2),
    filename,
].join('/');

const getOriginalFilePath = (filename, host = 'https://trevio.ru/imagecache/content/media') => [
    host,
    filename.substr(0, 1),
    filename.substr(1, 2),
    filename.substr(3, 2),
    filename,
].join('/');

module.exports = { uploadDirForContentImages, uploadDirForPermanentImages, dateToPath, getOriginalImagePath, getOriginalFilePath };
