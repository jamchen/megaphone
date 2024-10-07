import { spawn } from 'child_process';
import { getFFmpegExecutablePath } from './path-utils';

export const overlaySubtitles = ({
  inputVideo,
  subtitleFile,
  outputVideo,
}: OverlaySubtitlesParams): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-i',
      inputVideo,
      '-vf',
      `subtitles='${subtitleFile}':force_style='BorderStyle=4,BackColour=&H80000000,Outline=0,Shadow=0,FontSize=24'`,
      outputVideo,
    ];

    console.log(`${getFFmpegExecutablePath()} ${ffmpegArgs.join(' ')}`);

    const ffmpeg = spawn(getFFmpegExecutablePath(), ffmpegArgs);

    ffmpeg.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg process exited with code ${code}`));
      }
    });
  });
};
