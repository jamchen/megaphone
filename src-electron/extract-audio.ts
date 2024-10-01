import { exec } from 'child_process';
import os from 'os';
import path from 'path';

const getStandaloneFFmpegPath = () => {
  const platform = os.platform();
  if (platform === 'darwin') {
    return 'darwin';
  } else if (platform === 'win32') {
    return 'win32';
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
};
const isDev = process.env.NODE_ENV === 'development';

const getFFmpegExecutablePath = () => {
  if (isDev) {
    return path.join(
      process.cwd(),
      'ffmpeg',
      getStandaloneFFmpegPath(),
      'ffmpeg'
    );
  } else {
    return path.join(
      process.resourcesPath,
      getStandaloneFFmpegPath(),
      'ffmpeg'
    );
  }
};

export function extractAudio(
  inputFile: string,
  outputFile: string
): Promise<void> {
  exec(
    'python -c "import platform; print(platform.architecture())"',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing python: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`python stderr: ${stderr}`);
      }
      console.log(`python stdout: ${stdout}`);
    }
  );

  return new Promise((resolve, reject) => {
    const command = `"${getFFmpegExecutablePath()}" -y -i "${inputFile}" -q:a 0 -map a "${outputFile}"`;
    exec(
      command,
      {
        env: {
          ...process.env,
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing ffmpeg: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`ffmpeg stderr: ${stderr}`);
        }
        console.log(`ffmpeg stdout: ${stdout}`);
        resolve();
      }
    );
  });
}
