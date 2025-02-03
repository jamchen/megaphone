import path from 'path';
import { execFile } from 'child_process';
import { pythonExecutable, scriptsPath } from './common';

const liveChatToAssScriptPath = path.join(scriptsPath, 'live-chat-to-ass.py');
console.log(`liveChatToAssScriptPath: ${liveChatToAssScriptPath}`);

export const generateASS = async (
  liveChatFile: string,
  outputAssFile: string,
  startTime: string,
  endTime: string
) => {
  return new Promise((resolve, reject) => {
    execFile(
      pythonExecutable,
      [
        liveChatToAssScriptPath,
        liveChatFile,
        outputAssFile,
        startTime,
        endTime,
      ],
      (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout.trim());
      }
    );
  });
};
