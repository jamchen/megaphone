import { boot } from 'quasar/wrappers';
import { useSubtitlesStore } from 'src/stores/subtitles';
import { toRaw } from 'vue';

declare global {
  interface Window {
    filePath: string;
  }
}

const subtitlesStore = useSubtitlesStore();

// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  console.log('Boot electron-renderer', Date.now());
  const { electronAPI } = window;
  electronAPI.onExportSubtitles((filePath) => {
    electronAPI.exportSubtitles(filePath, toRaw(subtitlesStore.subtitles));
  });
});

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString(); // You can customize the format if needed
}

// Override console.log to include a timestamp
const originalConsoleLog = console.log;
console.log = (...args) => {
  originalConsoleLog(`[${getTimestamp()}]`, ...args);
};
