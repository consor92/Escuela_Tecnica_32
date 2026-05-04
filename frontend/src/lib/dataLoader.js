import fs from 'fs';
import path from 'path';

export function readData(filename) {
    const filePath = path.resolve(process.cwd(), 'data', filename);
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
}

export function writeData(filename, data) {
    const filePath = path.resolve(process.cwd(), 'data', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
