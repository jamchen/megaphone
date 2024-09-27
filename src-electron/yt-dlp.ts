import { spawn } from 'child_process';
import * as path from 'path';

/**
 * Downloads a YouTube video using yt-dlp with specified options.
 * @param url - The YouTube URL to download.
 * @returns A promise that resolves when the download is complete.
 */
export function downloadYouTubeVideo(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = 'yt-dlp';
    // const args = ['-j', '-S', '+codec:avc:m4a', url];
    const args = ['-j', '--no-simulate', '-S', '+codec:avc:m4a', url];

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
        const fullPath = path.join(global.process.cwd(), outputJson.filename);
        resolve(fullPath);
      } else {
        reject(new Error(`yt-dlp process exited with code ${code}`));
      }
    });
  });
}