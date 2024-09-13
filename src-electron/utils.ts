import fs from 'fs';

/**
 * Creates an object URL from a local file path.
 * @param filePath - The local file path.
 * @returns The object URL.
 */
export const createObjectURL = (filePath: string): string => {
  const fileData = fs.readFileSync(filePath);
  const blob = new Blob([fileData]);
  return URL.createObjectURL(blob);
};
