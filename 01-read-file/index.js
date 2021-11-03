const path = require('path');
const fs = require('fs');

const r = fs.createReadStream(path.join(__dirname, 'text.txt'));

r.on('data', data => {
  process.stdout.write(data);
  r.close();
});
