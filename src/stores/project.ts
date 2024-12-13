import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: () => ({
    videoFilePath: undefined as string | undefined,
    audioFilePath: undefined as string | undefined,
    youTubeVideoUrl: undefined as string | undefined,
    videoCurrentTime: 0 as number,
    editingSubtitle: false as boolean,
    videoSourceTab: 'standard',
    autoTranscribe: true as boolean,
    autoOverlaySubtitles: true as boolean,
    overlayLiveChat: false as boolean,
  }),

  persist: {
    omit: ['videoCurrentTime', 'editingSubtitle'],
  },
});
