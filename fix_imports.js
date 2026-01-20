const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('sonner@2.0.3')) {
            console.log('Fixing:', file);
            content = content.replace(/sonner@2.0.3/g, 'sonner');
            fs.writeFileSync(file, content);
        }
    }
});
console.log('Done!');
