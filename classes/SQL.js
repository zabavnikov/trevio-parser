const fs = require('fs');
const path = require('path');
const forEach = require('lodash/forEach');

class SQL {
  constructor(tableName, fields) {
    this.tableName  = tableName;
    this.fields     = fields;
    this.htmlFields = [];
    this.folder     = tableName;
    this.filename   = tableName;
  }

  setHtmlFields(htmlFields = []) {
    if (htmlFields.length > 0) {
      this.htmlFields = htmlFields;
    }

    return this;
  }

  /**
   * @param folder
   * @returns {SQL}
   */
  setDumpFolder(folder) {
    this.folder = folder;
    return this;
  }

  /**
   * @param filename
   * @returns {SQL}
   */
  setFilename(filename) {
    this.filename = filename;
    return this;
  }

  /**
   *
   */
  _normalize(fields) {
    forEach(fields, (value, key) => {
      if (value !== null) {
        if (typeof value === 'string') {
          if (value.length > 1000) {
            fields[key] = value.substr(0, 1000);
          }

          if (this.htmlFields.indexOf(key) === -1) {
            value = value.replace('<br>', ' ');
            value = value.replace(new RegExp(/<\/[a-z]>/, 'gmi'), ' '); // Например: </p> заменяем на пробел.
            value = value.replace(new RegExp(/(<([^>]+)>)/, 'gmi'), ''); // Удаляем остальные теги.
          }

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

  /**
   *
   */
  async parse() {
    const file = `${path.resolve(__dirname, `../modules/${this.folder}`)}/output/${this.filename}.sql`;

    this.fields = this._normalize(this.fields);

    if (! await fs.existsSync(file)) {
      await fs.writeFileSync(file, '');
    }

    await fs.appendFileSync(
        file,
        `INSERT INTO ${this.tableName} (${Object.keys(this.fields).join(', ')}) VALUES (${Object.values(this.fields).join(', ')});\r\n`,
        function (error) {
          if (error) return console.log(error);
        });
  }
}

module.exports = SQL;