import { exec } from 'child_process';
import path from 'path';
import { getExecutableBasePath, getYtDlpExecutablePath } from './path-utils';
import { app } from 'electron';

type DownloadProgressCallback = (progress: number) => void;
/**
 * Downloads a YouTube video using yt-dlp with specified options.
 * @param url - The YouTube URL to download.
 * @returns A promise that resolves when the download is complete.
 */
export function downloadYouTubeVideo(
  url: string,
  startTime: string | undefined = undefined,
  endTime: string | undefined = undefined,
  downloadProgressCallback: DownloadProgressCallback | undefined = undefined
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
      // '-j',
      // '--no-simulate',
      // '--quiet',
      '--progress',
      '--newline',
      // '--print',
      // 'filename',
      '--ffmpeg-location',
      getExecutableBasePath(),
      '-S',
      '+codec:avc:m4a',
      ...downloadSectionsArgs,
      '-o',
      `"${path.join(downloadPath, outputFormat)}"`,
      url,
    ];
    console.log('yt-dlp args', args);
    console.log('yt-dlp command:', `${command} ${args.join(' ')}`);
    const childProcess = exec(
      `${command} ${args.join(' ')}`,
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
        // try {
        //   console.log('jamx:', stdout);
        //   const outputJson = JSON.parse(stdout);
        //   resolve(outputJson.filename);
        // } catch (err) {
        //   reject(err);
        // }

        // Regex to match the file path from "Merging formats into" message
        const filePathRegex0 = /\[Merger\] Merging formats into "(.+)"/;
        const match0 = filePathRegex0.exec(stdout);
        if (match0) {
          resolve(match0[1]);
          return;
        }

        // Regex to match the file path from "has already been downloaded" message
        const filePathRegex1 = /\[download\] (.*) has already been downloaded/;
        const match1 = filePathRegex1.exec(stdout);
        if (match1) {
          resolve(match1[1]);
          return;
        }

        // Regex to match the file path from "Destination" message
        const filePathRegex2 = /\[download\] Destination: (.+)/;
        const match2 = filePathRegex2.exec(stdout);
        if (match2) {
          resolve(match2[1]);
          return;
        }

        reject('Could not find file path in yt-dlp output');
      }
    );
    childProcess.stderr?.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    childProcess.stdout?.on('data', (data) => {
      console.log(`stdout: ${data}`);

      if (!downloadProgressCallback) {
        return;
      }

      // Extract the percentage as a float from 0.0 to 1.0
      const percentageRegex = /\[download\]\s+([\d.]+)%/;
      const percentageMatch = percentageRegex.exec(data);
      if (percentageMatch) {
        const percentage = parseFloat(percentageMatch[1]) / 100;
        console.log(`Download progress: ${percentage}`);
        downloadProgressCallback(percentage);
      }
    });
  });
}
