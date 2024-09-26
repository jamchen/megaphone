import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
export const resourcesPath = isDev ? process.cwd() : process.resourcesPath;
console.log(`resourcesPath: ${resourcesPath}`);

export const pythonExecutable = path.join(
  resourcesPath,
  'python',
  'venv',
  'bin',
  'python3.12'
); // Adjust the path as needed
console.log(`pythonExecutable: ${pythonExecutable}`);
