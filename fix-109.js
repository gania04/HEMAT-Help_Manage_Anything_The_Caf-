const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // S7764: Prefer globalThis over window
    content = content.replace(/window\./g, 'globalThis.');

    // S7784: structuredClone
    content = content.replace(/JSON\.parse\(JSON\.stringify\((.*?)\)\)/g, 'structuredClone($1)');

    // S6606: ??=
    content = content.replace(/mockDb\.debts = mockDb\.debts \|\| \[\];/g, 'mockDb.debts ??= [];');
    content = content.replace(/mockDb\.socialFunds = mockDb\.socialFunds \|\| \[\];/g, 'mockDb.socialFunds ??= [];');

    // S1128
    content = content.replace(/import type { DebtItem } from '@\/lib\/mock-db';/g, '');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed', filePath);
    }
  }
});
