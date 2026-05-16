import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
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

function removeComments(content, filePath) {
    const ext = path.extname(filePath);
    
    if (ext === '.css') {
        return content.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
        let result = '';
        let i = 0;
        let inString = null; // ' or " or `
        let inMultiLineComment = false;
        let inSingleLineComment = false;
        let inJsxComment = false;

        while (i < content.length) {
            const char = content[i];
            const nextChar = content[i + 1];
            const prevChar = content[i - 1];

            if (inMultiLineComment) {
                if (char === '*' && nextChar === '/') {
                    inMultiLineComment = false;
                    i += 2;
                } else {
                    i++;
                }
                continue;
            }

            if (inSingleLineComment) {
                if (char === '\n' || char === '\r') {
                    inSingleLineComment = false;
                }
                i++;
                continue;
            }
            
            if (inJsxComment) {
                if (char === '*' && nextChar === '}' && prevChar === '/') {
                     // This is tricky because we saw / already. 
                     // Let's refine.
                }
            }

            // String handling
            if (!inString && !inMultiLineComment && !inSingleLineComment) {
                if (char === '"' || char === "'" || char === '`') {
                    inString = char;
                    result += char;
                    i++;
                    continue;
                }
            } else if (inString === char) {
                // Check for escaped quote
                let escaped = false;
                let j = i - 1;
                while (j >= 0 && content[j] === '\\') {
                    escaped = !escaped;
                    j--;
                }
                if (!escaped) {
                    inString = null;
                }
                result += char;
                i++;
                continue;
            }

            if (!inString) {
                // Multi-line comment
                if (char === '/' && nextChar === '*') {
                    inMultiLineComment = true;
                    i += 2;
                    continue;
                }
                // Single-line comment
                if (char === '/' && nextChar === '/') {
                    inSingleLineComment = true;
                    i += 2;
                    continue;
                }
                // TSX comment {/* */}
                if (ext === '.tsx' && char === '{' && nextChar === '/' && content[i+2] === '*') {
                    // Find closing */}
                    let j = i + 3;
                    let found = false;
                    while (j < content.length - 2) {
                        if (content[j] === '*' && content[j+1] === '/' && content[j+2] === '}') {
                            i = j + 3;
                            found = true;
                            break;
                        }
                        j++;
                    }
                    if (found) continue;
                }
            }

            result += char;
            i++;
        }
        return result;
    }

    return content;
}

const files = walk(srcDir);
files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(file, 'utf8');
        const newContent = removeComments(content, file);
        if (content !== newContent) {
            console.log(`Cleaning ${file}`);
            fs.writeFileSync(file, newContent, 'utf8');
        }
    }
});
