import path from 'path';
import os from 'os';

const isDev = process.env.NODE_ENV === 'development';

const getStandalonePythonPath = () => {
  const platform = os.platform();
  const arch = os.arch();
  if (platform === 'darwin' && arch === 'arm64') {
    return 'python-aarch64-apple-darwin';
  } else if (platform === 'darwin' && arch === 'x64') {
    return 'python-x86_64-apple-darwin';
  } else if (platform === 'win32') {
    return 'python-x86_64-pc-windows-msvc';
  } else {
    throw new Error(`Unsupported platform: ${platform} and arch: ${arch}`);
  }
};

const getPythonExecutable = () => {
  if (isDev) {
    return path.join(
      process.cwd(),
      'python',
      getStandalonePythonPath(),
      'bin',
      'python'
    );
  } else {
    return path.join(
      process.resourcesPath,
      getStandalonePythonPath(),
      'bin',
      'python'
    );
  }
};

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
