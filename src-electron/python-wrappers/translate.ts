import path from 'path';
import { execFile } from 'child_process';
import { pythonExecutable, scriptsPath } from './common';

const translateScriptPath = path.join(scriptsPath, 'translate-string.py');
console.log(`translateScriptPath: ${translateScriptPath}`);

export function translate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      pythonExecutable,
      [translateScriptPath, text, sourceLang, targetLang],
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
}
