const { join } = require('path');
const { mkdir, copyFile, readdir, rm } = require('fs/promises');

async function copyDir(src) {

  const dest = `${src}-copy`;

  try {
    await rm(dest, { recursive: true });
    await mkdir(dest);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(dest);
    }
  }

  const files = await readdir(src, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      await copyFile(join(src, file.name), join(dest, file.name));
    }
  }
}

copyDir(join(__dirname, 'files'));