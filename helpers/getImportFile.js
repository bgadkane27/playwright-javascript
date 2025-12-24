import path from 'path';
import fs from 'fs';

/**
 * Returns full file path for import files
 * @param {string} folder - Sub folder name (e.g. 'Accounting')
 * @param {string} fileName - File name without extension
 * @param {string} extension - File extension (default: .xlsx)
 * @returns {string} Full file path
 */
export function getImportFile(folder, fileName, extension = '.xlsx') {
  try {
    // Base directory where Playwright is running
    const basePath = process.cwd();

    // Navigate to Import folder from project root
    const projectPath = path.resolve(basePath, 'imports');

    // Add subfolder if provided
    const fullFolderPath = path.join(projectPath, folder);

    // Build full file path
    const fullFilePath = path.join(
      fullFolderPath,
      `${fileName}${extension}`
    );

    // Check if file exists
    if (!fs.existsSync(fullFilePath)) {
      throw new Error(`File not found: ${fullFilePath}`);
    }

    return fullFilePath;
  } catch (error) {
    throw new Error(
      `Error locating import file '${fileName}${extension}': ${error.message}`
    );
  }
}
