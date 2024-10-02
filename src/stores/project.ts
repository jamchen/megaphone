import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: () => ({
    videoFilePath: undefined as string | undefined,
    audioFilePath: undefined as string | undefined,
    youTubeVideoUrl: undefined as string | undefined,
    videoCurrentTime: 0 as number,
    editingSubtitle: false as boolean,
    videoSourceTab: 'standard',
  }),

  persist: {
    pick: [
      'videoFilePath',
      'audioFilePath',
      'youTubeVideoUrl',
      'videoSourceTab',
    ],
  },
});
