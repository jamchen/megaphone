import os from 'os';
import path from 'path';

export const getStandaloneExecutablePath = () => {
  const platform = os.platform();
  const arch = os.arch();
  return `${platform}-${arch}`;
};

const isDev = process.env.NODE_ENV === 'development';

export const getYtDlpExecutablePath = () => {
  if (isDev) {
    return path.join(
      process.cwd(),
      'bin',
      getStandaloneExecutablePath(),
      'yt-dlp'
    );
  } else {
    return path.join(
      process.resourcesPath,
      getStandaloneExecutablePath(),
      'yt-dlp'
    );
  }
};

export const getFFmpegExecutablePath = () => {
  if (isDev) {
    return path.join(
      process.cwd(),
      'bin',
      getStandaloneExecutablePath(),
      'ffmpeg'
    );
  } else {
    return path.join(
      process.resourcesPath,
      getStandaloneExecutablePath(),
      'ffmpeg'
    );
  }
};

export const getPythonExecutable = () => {
  if (isDev) {
    return path.join(
      process.cwd(),
      'bin',
      getStandaloneExecutablePath(),
      'python',
      'bin',
      'python'
    );
  } else {
    return path.join(
      process.resourcesPath,
      getStandaloneExecutablePath(),
      'python',
      'bin',
      'python'
    );
  }
};
