import { exec } from 'child_process';
import path from 'path';
import { getFFmpegExecutablePath, getYtDlpExecutablePath } from './path-utils';
import { app } from 'electron';

/**
 * Downloads a YouTube video using yt-dlp with specified options.
 * @param url - The YouTube URL to download.
 * @returns A promise that resolves when the download is complete.
 */
export function downloadYouTubeVideo(
  url: string,
  startTime: string | undefined = undefined,
  endTime: string | undefined = undefined
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const command = getYtDlpExecutablePath();
    const downloadPath = await app.getPath('downloads');
    let outputFormat = '%(title)s-%(id)s.%(ext)s';
    let downloadSectionsArgs: string[] = [];
    if (startTime && endTime) {
      downloadSectionsArgs = [
        '--download-sections',
        `"*${startTime}-${endTime}"`,
        '--force-keyframes-at-cuts',
      ];
      outputFormat = `%(title)s-%(id)s-${startTime}-${endTime}.%(ext)s`;
    }
    const args = [
      '-j',
      '--no-simulate',
      // '--print',
      // 'filename',
      '--ffmpeg-location',
      getFFmpegExecutablePath(),
      '-S',
      '+codec:avc:m4a',
      ...downloadSectionsArgs,
      '-o',
      `"${path.join(downloadPath, outputFormat)}"`,
      url,
    ];
    console.log('yt-dlp args', args);
    console.log('yt-dlp command:', `${command} ${args.join(' ')}`);
    exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ffmpeg: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`ffmpeg stderr: ${stderr}`);
      }
      console.log(`ffmpeg stdout: ${stdout}`);
      try {
        console.log('jamx:', stdout);
        const outputJson = JSON.parse(stdout);
        resolve(outputJson.filename);
      } catch (err) {
        reject(err);
      }
    });
  });
}
