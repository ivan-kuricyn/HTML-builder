const { join, parse } = require('path');
const { createWriteStream, createReadStream } = require('fs');
const { readdir, mkdir, rm, copyFile } = require('fs/promises');
const { createInterface } = require('readline');

buildPage();

async function buildPage() {
  const projectDistDir = join(__dirname, 'project-dist');

  try {
    await rm(projectDistDir, { recursive: true });
    await mkdir(projectDistDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(projectDistDir);
    }
  }

  const html = { template: '', tags: {} };

  const templateReader = createReadStream(join(__dirname, 'template.html'));

  const templateReadline = createInterface(templateReader);

  templateReadline.on('line', line => {
    html.template += line + '\n';

    const lineWithTag = line.match(/{{(.*?)}}/);

    if (lineWithTag) {
      const spaces = line.match(/^\s*/);
      html.tags[lineWithTag[1]] = { tag: lineWithTag[0], spaces: spaces[0] };
    }
  });

  templateReadline.on('close', async () => {
    const componentsDir = join(__dirname, 'components');

    const files = await readdir(componentsDir, { withFileTypes: true });

    let count = 0;

    for (const file of files) {
      if (file.isFile() && parse(file.name).ext === '.html') {
        const name = parse(file.name).name;

        let component = '';

        const componentReader = createReadStream(join(componentsDir, file.name));

        const componentReadline = createInterface(componentReader);

        componentReadline.on('line', line => {
          component += html.tags[name].spaces + line + '\n';
        });

        componentReadline.on('close', () => {
          component = component.slice(html.tags[name].spaces.length, component.length - 1);

          html.template = html.template.replace(html.tags[name].tag, component);

          count++;

          if (count === files.length) {
            const writer = createWriteStream(join(projectDistDir, 'index.html'));
            writer.write(html.template);
          }
        });
      }
    }
  });

  const stylesDir = join(__dirname, 'styles');
  const bundleFile = join(__dirname, 'project-dist', 'styles.css');

  await mergeStyles(stylesDir, bundleFile);

  const assetsDir = join(__dirname, 'assets');
  const assetsCopyDir = join(__dirname, 'project-dist', 'assets');

  await copyDir(assetsDir, assetsCopyDir);
}

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