import path from 'path';
import fs from 'fs';

export function getImportFile(folder, fileName, fileExtension = '.Xlsx') {
    const filePath = path.join(process.cwd(), 'imports', folder, `${fileName}${fileExtension}`);
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    return filePath;
}
