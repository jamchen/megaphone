import { exec } from 'child_process';
import { getFFmpegExecutablePath } from './path-utils';

export function extractAudio(
  inputFile: string,
  outputFile: string
): Promise<void> {
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
