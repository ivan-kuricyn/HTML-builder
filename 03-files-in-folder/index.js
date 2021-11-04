const { join, parse } = require('path');
const { readdir, stat } = require('fs/promises');

async function readDir(path) {
  const files = await readdir(path, { withFileTypes: true });

  for (const file of files)
    if (file.isFile()) {
      const name = parse(file.name).name;
      const ext = parse(file.name).ext.slice(1);
      const size = (await stat(join(path, file.name))).size;
      console.log(`${name} - ${ext} - ${size}b`);
    }
}

readDir(join(__dirname, 'secret-folder'));