import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: () => ({
    videoFilePath: undefined as string | undefined,
    audioFilePath: undefined as string | undefined,
    videoCurrentTime: 0 as number,
    editingSubtitle: false as boolean,
  }),

  persist: {
    pick: ['videoFilePath', 'audioFilePath'],
  },
});
