const fs = require('fs');
const path = require('path');
const forEach = require('lodash/forEach');

/**
 * Приводим поля в нужный формат.
 *
 * @param fields
 * @returns {*}
 */
function normalize(fields) {
  forEach(fields, (value, key) => {
    if (value !== null) {
      if (typeof value === 'string') {
        if (value.length > 1000) {
          fields[key] = value.substr(0, 1000);
        }

        value = value.replace('<br>', ' ');
        value = value.replace(new RegExp(/<\/[a-z]>/, 'gmi'), ' '); // Например: </p> заменяем на пробел.
        value = value.replace(new RegExp(/(<([^>]+)>)/, 'gmi'), ''); // Удаляем остальные теги.
        value = value.replace(new RegExp(/("|')/, 'gm'), ''); // Удаляем кавычки.
        value = value.trim();

        fields[key] = `"${value}"`;
      }
    } else {
      fields[key] = `NULL`;
    }
  });

  return fields;
}

module.exports = async function (fields, moduleName, tableName = null) {
  if (tableName === null) {
    tableName = moduleName;
  }

  const file = `${path.resolve(__dirname, `../modules/${moduleName}`)}/dump/${tableName}.sql`;

  fields = normalize(fields);

  if (! await fs.existsSync(file)) {
    await fs.writeFileSync(file, '');
  }

  await fs.appendFileSync(
    file,
    `INSERT INTO ${tableName} (${Object.keys(fields).join(', ')}) VALUES (${Object.values(fields).join(', ')});\r\n`,
    function (error) {
      if (error) return console.log(error);
    });
};