const createHmac = require('create-hmac');
const {
  IMGPROXY_SECRET,
  IMGPROXY_SALT
} = require('../constants');

const urlSafeBase64 = (string) => {
  return Buffer.from(string)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
}

const hexDecode = (hex) => Buffer.from(hex, 'hex');

const signature = (secret, salt, target) => {
  const hmac = createHmac('sha256', hexDecode(secret))
      .update(hexDecode(salt))
      .update(target);

  return urlSafeBase64(hmac.digest())
}

module.exports = (url) => {
  const encodedUrl = urlSafeBase64(`https://images.treviodev.ru/${url}`);
  const path = `/resize:fit:1024/${encodedUrl}.jpg`;

  return `https://images.treviodev.ru/resize/${signature(IMGPROXY_SECRET, IMGPROXY_SALT, path)}${path}`;
}