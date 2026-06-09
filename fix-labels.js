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
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // We will do a simple regex that matches:
    // <label className="...">Text</label>
    // \s*
    // <(input|select|textarea)([^>]*)name="([^"]+)"([^>]*)>
    
    // Replace it with:
    // <label className="..." htmlFor="$3">Text</label>
    // <$1$2name="$3" id="$3"$4>

    // Regex to find a label followed by an input/select/textarea with a name attribute.
    const regex = /<label([^>]*)>(.*?)<\/label>\s*<(input|select|textarea)([^>]*)name="([^"]+)"([^>]*)>/g;
    
    content = content.replace(regex, (match, labelAttrs, labelText, tag, beforeName, name, afterName) => {
        // If label already has htmlFor, keep it
        if (labelAttrs.includes('htmlFor')) {
            return match;
        }
        
        let newLabelAttrs = labelAttrs + ` htmlFor="${name}"`;
        
        // Add id to input if it doesn't have one
        let newTagAttrs = beforeName + `name="${name}"` + afterName;
        if (!newTagAttrs.includes(' id=')) {
            newTagAttrs = beforeName + `name="${name}" id="${name}"` + afterName;
        }

        return `<label${newLabelAttrs}>${labelText}</label>\n              <${tag}${newTagAttrs}>`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed labels in', filePath);
    }
  }
});
