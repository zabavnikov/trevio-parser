const fs = require('fs'), http = require('http'), forEach = require('lodash/forEach'), md5 = require('md5');

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

function normalizeData(model, schema) {
  const values = [];

  forEach(schema, (newFieldName, oldFieldName) => {
    let value = model[oldFieldName];

    if (typeof value === 'string') {
      value = `'${value}'`;
    }

    if (value === null) {
      value = `${null}`;
    }

    if (oldFieldName === 'createdAt' || oldFieldName === 'updatedAt') {
      value = `'${new Date(Date.parse(model[oldFieldName])).toLocaleString()}'`;
    }

    if (oldFieldName === 'wysiwyg') {
      value = value
        .replace('<p><br data-mce-bogus="1"></p>', '')
        .replace('<p><br></p>', '')
        .replace('&nbsp; ', '')
        .replace('&nbsp;', '');
    }

    values.push(value);
  });

  return values;
}

module.exports = { normalizeFieldsOfModel, normalizeData };