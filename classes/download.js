const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');
const sharp = require('sharp');

const { STORAGE_PATH } = require('../constants');

class Download {
  /**
   * @param originalFilename
   * @param moduleName
   * @param outputPath
   * @param outputFilename
   * @param imgproxy
   */
  constructor(moduleName, originalFilename, outputPath, outputFilename) {
    this.moduleName       = moduleName;
    this.originalFilename = originalFilename;
    this.outputPath       = outputPath;
    this.outputFilename   = outputFilename ? outputFilename : originalFilename;
    this.width            = null;
    this.height           = null;
    this.host             = STORAGE_PATH;
    this.filePathBuilder  = false;
  }

  setWidthHeight(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  setHost(host) {
    this.host = host;
    return this;
  }

  skipFilePathBuilder() {
    this.filePathBuilder = true;
    return this;
  }

  getOriginalFilePath(filename) {
    if (this.filePathBuilder) {
      return [this.host, filename].join('/');
    }

    return [
      this.host,
      filename.substr(0, 1),
      filename.substr(1, 2),
      filename.substr(3, 2),
      filename,
    ].join('/');
  }

  async download() {
    let file = this.getOriginalFilePath(this.originalFilename);

    if (existsSync(file)) {
      let outputDirectory = path.resolve(__dirname, `../modules/${this.moduleName}/output/images/${this.outputPath}`);

      if (! existsSync(outputDirectory)) {
        await fs.mkdir(outputDirectory, {
          recursive: true
        });
      }

      outputDirectory += `/${this.outputFilename}`;

      file = await fs.readFile(file);

      if (this.width && this.height) {
        file = await sharp(file)
            .resize(this.width, this.height, {
              withoutEnlargement: true
            })
            .removeAlpha()
            .toBuffer();
      }

      await fs.writeFile(outputDirectory, file, 'utf-8');
    }
  }
}

module.exports = Download;