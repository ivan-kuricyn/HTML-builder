const path = require('path');
const fs = require('fs');
const readline = require('readline');

const w = fs.createWriteStream(path.join(__dirname, 'text.txt'));

const rl = readline.createInterface(process.stdin);

console.log('Hi, friend! Are you trying to tell me something?');

rl.on('line', data => {
  if (data === 'exit') return rl.close();
  w.write(data + '\n');
});

rl.on('close', () => {
  console.log('Okay, I get it!');
  w.close();
});
