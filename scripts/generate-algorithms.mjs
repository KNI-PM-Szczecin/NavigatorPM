import fs from 'fs';
import path from 'path';

const implementationsDir = path.join(process.cwd(), 'src/lib/algorithms/implementations');
const outputFile = path.join(process.cwd(), 'src/lib/algorithms/index.ts');

const files = fs.readdirSync(implementationsDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

const imports = files.map(file => {
    const name = file.replace('.ts', '');
    return `import { ${name}Algorithm } from './implementations/${name}';`;
}).join('\n');

const exports = `export const allAlgorithms = [\n${files.map(file => `    new ${file.replace('.ts', '')}Algorithm(),`).join('\n')}\n];`;

const content = `${imports}

${exports}
`;

fs.writeFileSync(outputFile, content);
console.log('Algorithm registry updated successfully.');
