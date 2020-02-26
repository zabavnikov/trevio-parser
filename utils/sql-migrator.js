const fs = require('fs');
const forEach = require('lodash/forEach');
const settings = require('../settings');

module.exports = function (items, moduleName, tableName = null) {
  if (tableName === null) {
    tableName = moduleName;
  }

  const file = `${settings.paths.saveTo}/${moduleName}/${tableName}.sql`;

  forEach(items, item => {
    const normalize = normalizeFieldsOfModel(item.get());

    fs.appendFile(
      file,
      `INSERT INTO ${tableName} (${Object.keys(normalize).join(', ')}) VALUES (${Object.values(normalize).join(', ')});\r\n`,
      function (error) {
        if (error) return console.log(error);
      });
  });
};

function normalizeFieldsOfModel(model) {
  forEach(model, (value, key) => {
    if (value === null) {
      model[key] = `${null}`;
    } else {
      if (typeof value === 'string') {
        if (value.length > 1000) {
          model[key] = value.substr(0, 1000);
        }

        model[key] = `"${model[key].replace(new RegExp(/("|')/, 'gm'), '')}"`;
      }
    }
  });

  return model;
}