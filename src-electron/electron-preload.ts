import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { createObjectURL } from './utils';
import { transcriptAudio } from './python-wrappers/transcript-audio';
import { extractAudio } from './extract-audio';
import path from 'path';
import { formatSubtitlesToSRT } from './srt';
import fs from 'fs';
import { translate as googleTranslate } from '@vitalets/google-translate-api';
import { translate as pythonTranslate } from './python-wrappers/translate';
import { downloadYouTubeVideo } from './yt-dlp';

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
  basename: (filePath: string, ext?: string) => {
    return path.basename(filePath, ext);
  },
  googleTranslate: googleTranslate,
  pythonTranslate: pythonTranslate,
  showSaveDialog: async (options: Electron.SaveDialogOptions) => {
    return await ipcRenderer.invoke('show-save-dialog', options);
  },
  downloadYouTubeVideo: async (url: string) => {
    return await downloadYouTubeVideo(url);
  },
});
