const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');
const sharp = require('sharp');

const { getOriginalFilePath } = require('../utils/pathBuilder');
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
  }

  setWidthHeight(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  async download(host) {
    let file = getOriginalFilePath(this.originalFilename, host
        ? host
        : STORAGE_PATH
    );

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