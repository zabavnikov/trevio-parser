module.exports = {
  UPLOAD_DISK: 's3',
  IMAGE_HOST: 'https://images.treviodev.ru/development',
  STORAGE_DISK: 's3',
  SKIP_DOWNLOAD: true,
  // home
  STORAGE_PATH: '/mnt/d/LAST_Media/webserver/public_html/shared/storage/app/public/media',

  IMGPROXY_SECRET:  '1ab81ec0d638fc5363f3fd0850b4c4e122efdb8b8fa1c0b2e6e79ec83e432a348c57970da5e9b610ff2e173bc161b5e68b02af120190fd9b72641b98e37b657c',
  IMGPROXY_SALT:    'faed5d25bcdee33f9c8912e2b74894da1da7c6242ab2866167c725e68fbbd4646cde92d3a93549cf2d40eebfe1b2be81b268b3d00b972bb49721eb94bd03d7ad',

  EVENTS: {
    likes: {
      eventId: 2,
      weight: 2,
    },
    subscriptions: {
      eventId: 3,
      weight:  3,
    },
    share: {
      eventId: 4,
      weight:  4,
    }
  },

  NOTE_IMAGE_SIZE: [640, 480],
  TRAVEL_IMAGE_SIZE: [640, 480],
}