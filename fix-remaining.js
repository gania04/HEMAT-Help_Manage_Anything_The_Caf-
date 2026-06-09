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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // S6759: Mark props as read-only.
    // e.g. function Component({ a, b }: { a: any, b: string })
    // Regex to wrap type definitions in Readonly<> if they are not already.
    content = content.replace(/:\s*({[^}]+})([,)])/g, (match, p1, p2) => {
      if (p1.includes('Readonly')) return match;
      // if it's just {} or similar, wrap it
      return `: Readonly<${p1}>${p2}`;
    });

    // S7766: Prefer Math.max()
    // `newStock < 0 ? 0 : newStock` or similar? Let's use Math.max(0, newStock)
    content = content.replace(/([a-zA-Z0-9_]+) < 0 \? 0 : \1/g, 'Math.max(0, $1)');

    // In pos/page.tsx: Unexpected negated condition !isCartOpen ? ... : ...
    content = content.replace(/!isCartOpen \? (.*?) : (.*?)/g, 'isCartOpen ? $2 : $1');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed', filePath);
    }
  }
});
