import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  webUtils,
} from 'electron';
import { createObjectURL } from './utils';
import { transcribeAudio } from './python-wrappers/transcript-audio';
import { extractAudio } from './extract-audio';
import path from 'path';
import { formatSubtitlesToSRT } from './srt';
import fs from 'fs';
import { translate as googleTranslate } from '@vitalets/google-translate-api';
import { translate as pythonTranslate } from './python-wrappers/translate';
import { overlaySubtitles } from './overlay-subtitles';
import { generateASS } from './python-wrappers/ass';

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
    endTime: string | undefined,
    downloadLiveChat: boolean,
    progressCallback: YouTubeDownloadProgressCallback | undefined,
    downloadedFramesCallback: YouTubeDownloadedFramesCallback | undefined
  ) => {
    const callbackWrapper = (
      _: IpcRendererEvent,
      progress: YouTubeDownloadProgress
    ) => {
      if (progressCallback) {
        progressCallback(progress);
      }
    };
    ipcRenderer.on('download-youtbue-video-progress', callbackWrapper);
    const downloadFramesCallbackWrapper = (
      _: IpcRendererEvent,
      frames: YouTubeDownloadedFrames
    ) => {
      if (downloadedFramesCallback) {
        downloadedFramesCallback(frames);
      }
    };
    ipcRenderer.on(
      'download-youtbue-frame-count',
      downloadFramesCallbackWrapper
    );
    const result = await ipcRenderer.invoke('download-youtbue-video', {
      url,
      startTime: startTime,
      endTime: endTime,
      downloadLiveChat,
    });
    ipcRenderer.off('download-youtbue-video-progress', callbackWrapper);
    ipcRenderer.off(
      'download-youtbue-frame-count',
      downloadFramesCallbackWrapper
    );
    return result;
  },
  overlaySubtitles: overlaySubtitles,
  getAppPath: async (name: string) => {
    return await ipcRenderer.invoke('get-app-path', name);
  },
  showItemInFolder: (fullPath: string) => {
    return ipcRenderer.invoke('show-item-in-folder', fullPath);
  },
  fileExists: async (filePath: string) => {
    return await ipcRenderer.invoke('file-exists', filePath);
  },
  generateASS: generateASS,
});
