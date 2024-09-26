/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    QUASAR_PUBLIC_FOLDER: string;
    QUASAR_ELECTRON_PRELOAD: string;
    APP_URL: string;
  }
}

interface Segment {
  id: string;
  text: string;
  seek: number;
  start: number;
  end: number;
}

// Define the WhisperModelSize type
type WhisperModelSize = 'tiny' | 'base' | 'small' | 'medium' | 'large';

interface Subtitle {
  text: string;
  start: number;
  end: number;
}

interface ElectronAPI {
  createObjectURL: (filePath: string) => string;
  transcribeAudio: (
    audioFilePath: string,
    model: WhisperModelSize,
    onProgress: (progress: string) => void
  ) => Promise<Array<Segment>>;
  getPathForFile: (file: File) => string;
  onExportSubtitles: (callback: (filePath: string) => void) => void;
  exportSubtitles: (filePath: string, subtitles: Array<Subtitle>) => void;
  extractAudio: (videoFilePath: string) => Promise<string>;
  basename: (filePath: string) => string;
}

interface Window {
  electronAPI: ElectronAPI;
}
