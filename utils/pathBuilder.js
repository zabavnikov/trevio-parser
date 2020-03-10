const md5 = require('md5');

const uploadDirForContentImages = (model) => {
    const date = new Date(Date.parse(model.created_at));

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return [
        year,
        month <= 9 ? '0' + month : month,
        day <= 9 ? '0' + day : day,
        model.owner_id,
    ].join('/')
};

const uploadDirForPermanentImages = (modelId, depth = 4) => {
    return [
        md5(modelId).substr(0, depth * 2).match(/[a-z0-9]{2}/g).join('/'),
        modelId
    ].join('/')
};

module.exports = { uploadDirForContentImages, uploadDirForPermanentImages };
