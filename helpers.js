const fs = require('fs'), http = require('http'), forEach = require('lodash/forEach');

function normalizeFieldsOfModel(model) {
  const values = [];

  forEach(model, (value, field) => {
    if (value === null || field === 'avatar') {
      values.push(`${null}`);
    } else {
      if (typeof value === 'string') {
        values.push(`"${value.replace(new RegExp(/("|')/, 'gm'), '')}"`);
      }

      if (field === 'created_at' || field === 'updated_at') {
        values.push(`"${new Date(Date.parse(model[field])).toLocaleString()}"`);
      }
    }
  });

  return values;
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