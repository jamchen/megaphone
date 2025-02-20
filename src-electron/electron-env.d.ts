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

interface OverlaySubtitlesParams {
  inputVideo: string;
  subtitleFile: string;
  outputVideo: string;
  forceStyle?: string;
}

interface YouTubeDownloadProgress {
  url: string;
  value: number;
}

type YouTubeDownloadProgressCallback = (
  progress: YouTubeDownloadProgress
) => void;

interface YouTubeDownloadedFrames {
  url: string;
  value: number;
}

type YouTubeDownloadedFramesCallback = (
  progress: YouTubeDownloadedFrames
) => void;

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
  downloadYouTubeVideo: (
    url: string,
    startTime?: string,
    endTime?: string,
    downloadLiveChat?: boolean,
    progressCallback?: YouTubeDownloadProgressCallback,
    downloadedFramesCallback?: YouTubeDownloadedFramesCallback
  ) => Promise<string>;
  overlaySubtitles: (params: OverlaySubtitlesParams) => Promise<void>;
  getAppPath: (name: string) => Promise<string>;
  showItemInFolder: (fullPath: string) => void;
  fileExists: (filePath: string) => Promise<boolean>;
  generateASS: (
    liveChatFile: string,
    outputAssFile: string,
    startTime: string,
    endTime: string
  ) => Promise<void>;
}

interface Window {
  electronAPI: ElectronAPI;
}
