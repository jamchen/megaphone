import { spawn } from 'child_process';
import { getFFmpegExecutablePath } from './path-utils';

const encodeFilePath = (filePath: string): string => {
  // Escape special characters
  const escapedPath = filePath
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "'\\''")
    .replace(/!/g, "'\\!'")
    .replace(/:/g, "'\\:'");
  // Enclose the entire path in single quotes
  return `'${escapedPath}'`;
};

export const overlaySubtitles = ({
  inputVideo,
  subtitleFile,
  outputVideo,
}: OverlaySubtitlesParams): Promise<void> => {
  return new Promise((resolve, reject) => {
    const encodedSubtitleFile = encodeFilePath(subtitleFile);
    const forceStyle =
      'BorderStyle=4,BackColour=&H80000000,Outline=0,Shadow=0,FontSize=24';

    const ffmpegArgs = [
      '-y',
      '-i',
      inputVideo,
      '-vf',
      `subtitles='${encodedSubtitleFile}':force_style='${forceStyle}'`,
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
