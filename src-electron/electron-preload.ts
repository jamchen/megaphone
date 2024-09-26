import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { createObjectURL } from './utils';
import { transcriptAudio } from './transcript-audio';
import { extractAudio } from './extract-audio';
import path from 'path';
import { formatSubtitlesToSRT } from './srt';
import fs from 'fs';

console.log(`process.env.PATH: ${process.env.PATH}`);

contextBridge.exposeInMainWorld('electronAPI', {
  createObjectURL,
  transcribeAudio: transcriptAudio,
  getPathForFile: (file: File): string => {
    return webUtils.getPathForFile(file);
  },
  onExportSubtitles: (callback: (filePath: string) => void) => {
    ipcRenderer.on('export-subtitles', (_, filePath) => {
      callback(filePath);
    });
  },
  exportSubtitles: (filePath: string, subtitles: Array<Subtitle>) => {
    fs.writeFileSync(filePath, formatSubtitlesToSRT(subtitles), 'utf-8');
  },
  extractAudio: async (videoFilePath: string) => {
    const audioFilePath = videoFilePath.replace(/\.\w+$/, '.wav');
    await extractAudio(videoFilePath, audioFilePath);
    return audioFilePath;
  },
  basename: (filePath: string) => {
    return path.basename(filePath);
  },
});
