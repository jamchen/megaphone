import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { createObjectURL } from './utils';
import { transcriptAudio } from './transcript-audio';
import { extractAudio } from './extract-audio';
import path from 'path';

console.log(`process.env.PATH: ${process.env.PATH}`);

contextBridge.exposeInMainWorld('electronAPI', {
  createObjectURL,
  transcribeAudio: transcriptAudio,
  getPathForFile: (file: File): string => {
    return webUtils.getPathForFile(file);
  },
    });
  },
  exportSubtitles: (filePath: string, subtitles: Array<Subtitle>) => {
    ipcRenderer.send('export-subtitles', { filePath, subtitles });
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
