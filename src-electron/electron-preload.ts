import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { createObjectURL } from './utils';
import { transcribeAudio } from './python-wrappers/transcript-audio';
import { extractAudio } from './extract-audio';
import path from 'path';
import { formatSubtitlesToSRT } from './srt';
import fs from 'fs';
import { translate as googleTranslate } from '@vitalets/google-translate-api';
import { translate as pythonTranslate } from './python-wrappers/translate';
import { overlaySubtitles } from './overlay-subtitles';

console.log(`process.env.PATH: ${process.env.PATH}`);

contextBridge.exposeInMainWorld('electronAPI', {
  createObjectURL,
  transcribeAudio: transcribeAudio,
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
  downloadYouTubeVideo: async (
    url: string,
    startTime: string | undefined,
    endTime: string | undefined
  ) => {
    return await ipcRenderer.invoke('download-youtbue-video', {
      url,
      startTime: startTime,
      endTime: endTime,
    });
  },
  overlaySubtitles: overlaySubtitles,
  getAppPath: async (name: string) => {
    return await ipcRenderer.invoke('get-app-path', name);
  },
  showItemInFolder: (fullPath: string) => {
    return ipcRenderer.invoke('show-item-in-folder', fullPath);
  },
});
