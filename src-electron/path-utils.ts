import os from 'os';
import path from 'path';

export const getStandaloneExecutablePath = () => {
  const platform = os.platform();
  const arch = os.arch();
  return `${platform}-${arch}`;
};

const isDev = process.env.NODE_ENV === 'development';

export const getExecutableBasePath = () => {
  if (isDev) {
    return path.join(process.cwd(), 'bin', getStandaloneExecutablePath());
  } else {
    return path.join(process.resourcesPath, getStandaloneExecutablePath());
  }
};

export const getYtDlpExecutablePath = () => {
  return path.join(getExecutableBasePath(), 'yt-dlp');
};

export const getFFmpegExecutablePath = () => {
  return path.join(getExecutableBasePath(), 'ffmpeg');
};

export const getPythonExecutable = () => {
  return path.join(getExecutableBasePath(), 'python', 'bin', 'python');
};
