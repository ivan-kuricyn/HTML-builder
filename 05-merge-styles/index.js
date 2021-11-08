const { join, parse } = require('path');
const { createWriteStream, createReadStream } = require('fs');
const { readdir } = require('fs/promises');

async function mergeStyles(styles, bundle) {
  const writer = createWriteStream(bundle);

  const files = await readdir(styles, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && parse(file.name).ext === '.css') {
      const reader = createReadStream(join(styles, file.name));

      reader.on('data', data => {
        writer.write(data + '\n');
        reader.close();
      });
    }
  }
}

const stylesDir = join(__dirname, 'styles');
const bundleFile = join(__dirname, 'project-dist', 'bundle.css');

mergeStyles(stylesDir, bundleFile);
