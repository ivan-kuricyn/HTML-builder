const { join } = require('path');
const { mkdir, copyFile, readdir, rm } = require('fs/promises');

async function copyDir(src, dest) {
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
    } else {
      await copyDir(join(src, file.name), join(dest, file.name));
    }
  }
}

const filesDir = join(__dirname, 'files');
const filesCopyDir = join(__dirname, 'files-copy');

copyDir(filesDir, filesCopyDir);