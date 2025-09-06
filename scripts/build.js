import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Copy necessary files to dist
const filesToCopy = [
  'README.md',
  'package.json',
];

filesToCopy.forEach(file => {
  try {
    copyFileSync(file, `dist/${file}`);
    console.log(`Copied ${file} to dist/`);
  } catch (error) {
    console.error(`Failed to copy ${file}:`, error.message);
  }
});

console.log('Build preparation complete!');