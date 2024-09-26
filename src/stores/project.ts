import { defineStore } from 'pinia';

export interface Project {
  videoFilePath: string | undefined;
  audioFilePath: string | undefined;
}

export const useProjectStore = defineStore('project', {
  state: (): Project => ({
    videoFilePath: undefined,
    audioFilePath: undefined,
  }),

  persist: true,
});
