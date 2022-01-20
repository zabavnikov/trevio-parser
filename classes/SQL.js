const fs = require('fs');
const path = require('path');
const forEach = require('lodash/forEach');
const striptags = require("striptags").striptags;

class SQL {
  constructor(tableName, fields) {
    this.tableName    = tableName;
    this.fields       = fields;
    this.allowedTags  = new Set([]);
    this.folder       = tableName;
    this.filename     = tableName;
  }

  setAllowedTags(allowedTags = []) {
    if (allowedTags.length) {
      this.allowedTags = new Set(allowedTags);
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
   * @param folder
   * @returns {SQL}
   */
  setOutputFolder(folder) {
    this.folder = folder;
    return this;
  }

  /**
   * @param filename
   * @returns {SQL}
   */
  setOutputFilename(filename) {
    this.filename = filename;
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

          if (! this.allowedTags.size) {
            value = value.replace(new RegExp(/("|')/, 'gm'), '');
          }

          // Удаляем &nbsp;.
          value = value.replace(/&nbsp;/g, '');
          // Удаляем пустые теги p.
          value = value.replace(/<p>\s*<\/p>/g, '');

          if (this.allowedTags.size) {
            value = striptags(value, {
              allowedTags: this.allowedTags
            });
          } else {
            value = striptags(value);
          }

          fields[key] = `'${value.trim()}'`;
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

    const columns = Object.keys(this.fields).map(column => {
      return '`' + column + '`';
    }).join(', ');

    await fs.appendFileSync(
        file,
        `INSERT INTO ${this.tableName} (${columns}) VALUES (${Object.values(this.fields).join(', ')});\r\n`,
        function (error) {
          if (error) return console.log(error);
        });
  }
}

module.exports = SQL;