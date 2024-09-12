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

interface ElectronAPI {
  transcribeAudio: (
    audioFilePath: string,
    onProgress: (progress: string) => void
  ) => Promise<Array<Segment>>;
}

interface Window {
  electronAPI: ElectronAPI;
}
