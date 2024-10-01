import { spawn } from 'child_process';
import path from 'path';
import { getFFmpegExecutablePath, getYtDlpExecutablePath } from './path-utils';
import { app } from 'electron';

/**
 * Downloads a YouTube video using yt-dlp with specified options.
 * @param url - The YouTube URL to download.
 * @returns A promise that resolves when the download is complete.
 */
export function downloadYouTubeVideo(url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const command = getYtDlpExecutablePath();
    // const args = ['-j', '-S', '+codec:avc:m4a', url];
    const downloadPath = await app.getPath('downloads');
    const args = [
      '-j',
      '--no-simulate',
      '--ffmpeg-location',
      getFFmpegExecutablePath(),
      '-S',
      '+codec:avc:m4a',
      '-o',
      path.join(downloadPath, '%(title)s-%(id)s.%(ext)s'),
      url,
    ];

    console.log('yt-dlp command:', `${command} ${args.join(' ')}`);
    const process = spawn(command, args);
    const stdout: string[] = [];
    process.stdout.on('data', (data) => {
      stdout.push(data.toString());
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        const outputJson = JSON.parse(stdout.join(''));
        console.log('stdout: $', JSON.parse(stdout.join('')));
        resolve(outputJson.filename);
      } else {
        reject(new Error(`yt-dlp process exited with code ${code}`));
      }
    });
  });
}
