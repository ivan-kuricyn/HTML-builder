const { join, parse } = require('path');
const { createWriteStream, createReadStream } = require('fs');
const { readdir } = require('fs/promises');

async function mergeStyles() {
  const stylesDir = join(__dirname, 'styles');
  const bundleFile = join(__dirname, 'project-dist', 'bundle.css');

  const writer = createWriteStream(bundleFile);

  const files = await readdir(stylesDir, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && parse(file.name).ext === '.css') {
      const reader = createReadStream(join(stylesDir, file.name));
      reader.on('data', data => {
        writer.write(data + '\n');
        reader.close();
      });
    }
  }
}

mergeStyles();
