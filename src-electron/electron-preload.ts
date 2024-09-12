import { contextBridge } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import readline from 'readline';

const projectRoot = process.cwd();
const pythonExecutable = path.join(projectRoot, 'venv', 'bin', 'python3.12'); // Adjust the path as needed

const extractPercentage = (input: string): number | null => {
  const percentageRegex = /(\d+)%/;
  const match = input.match(percentageRegex);
  if (match) {
    return parseInt(match[1]) / 100;
  }
  return null;
};

contextBridge.exposeInMainWorld('electronAPI', {
  transcribeAudio: (
    audioFilePath: string,
    onProgress: (progress: string) => void
  ) => {
    return new Promise((resolve, reject) => {
      const process = spawn(pythonExecutable, [
        'scripts/transcribe.py',
        audioFilePath,
      ]);

      let resultData = '';

      const rl = readline.createInterface({
        input: process.stdout,
        // output: process.stdin,
        terminal: false,
      });

      const timestampRegex = /\[\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}\]/;

      rl.on('line', (line) => {
        if (line.startsWith('Progress:') || timestampRegex.test(line)) {
          console.log(`stdout: ${line}`); // Log the stdout data to the JavaScript console
          onProgress(line);
        } else {
          console.log(`result: ${line}`); // Log the stdout data to the JavaScript console
          resultData += line;
        }
      });

      process.stderr.on('data', (data) => {
        console.error(`stderr: ${data.toString()}`); // Log stderr data to the JavaScript console
        const progress = extractPercentage(data.toString());
        if (progress !== null) {
          onProgress(`${(progress * 100).toFixed(0)}%`);
        }

        // reject(`Stderr: ${data.toString()}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            console.log(`resultData: ${resultData}`);
            const result = JSON.parse(resultData);
            resolve(result);
          } catch (error) {
            if (error instanceof Error) {
              console.error(error.message); // Log error to the JavaScript console
              reject(`Error: ${error.message}`);
            } else {
              console.error('Unknown error'); // Log unknown error to the JavaScript console
              reject('Unknown error');
            }
          }
        } else {
          reject(`Process exited with code ${code}`);
        }
      });

      process.on('error', (error) => {
        console.error(error.message); // Log error to the JavaScript console
        reject(`Error: ${error.message}`);
      });
    });
  },
});
