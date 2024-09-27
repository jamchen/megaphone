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

// google translate types
interface GoogleTranslateOptions {
  from?: string;
  to?: string;
  host?: string;
  fetchOptions?: Partial<RequestInit>;
}

interface GoogleTranslateResult {
  text: string;
  raw: RawResponse;
}

interface RawResponse {
  sentences: (Sentence | SrcTranslit)[];
  src: string;
  confidence: number;
  ld_result: {
    srclangs: string[];
    srclangs_confidences: number[];
    extended_srclangs: string[];
  };
}

interface Sentence {
  trans: string;
  orig: string;
}

interface SrcTranslit {
  src_translit: string;
}

// Define the ElectronAPI interface
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
  basename: (filePath: string, ext?: string) => string;
  googleTranslate(
    text: string,
    options?: GoogleTranslateOptions
  ): Promise<GoogleTranslateResult>;
  pythonTranslate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string>;
  showSaveDialog: (
    options: Electron.SaveDialogOptions
  ) => Promise<Electron.SaveDialogReturnValue>;
  downloadYouTubeVideo: (url: string) => Promise<string>;
}

interface Window {
  electronAPI: ElectronAPI;
}
