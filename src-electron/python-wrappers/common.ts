import path from 'path';
import { getPythonExecutable } from '../path-utils';

const isDev = process.env.NODE_ENV === 'development';

export const pythonExecutable = getPythonExecutable();
console.log(`pythonExecutable: ${pythonExecutable}`);

const getScriptsPath = () => {
  if (isDev) {
    return path.join(process.cwd(), 'python', 'scripts');
  } else {
    return path.join(process.resourcesPath, 'scripts');
  }
};

export const scriptsPath = getScriptsPath();
console.log(`scriptsPath: ${scriptsPath}`);
