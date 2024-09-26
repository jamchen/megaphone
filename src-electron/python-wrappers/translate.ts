import path from 'path';
import { execFile } from 'child_process';
import { pythonExecutable, resourcesPath } from './common';

const translateScriptPath = path.join(
  resourcesPath,
  'python',
  'scripts',
  'translate-string.py'
);
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
      {
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:/opt/homebrew/bin`,
        },
      },
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
