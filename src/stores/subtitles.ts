import { defineStore } from 'pinia';

interface Subtitle {
  text: string;
  start: number;
  end: number;
}

export const useSubtitlesStore = defineStore('subtitles', {
  state: () => ({
    subtitles: [] as Subtitle[],
  }),

  getters: {},

  actions: {
    addSubtitle(subtitle: Subtitle) {
      this.subtitles.push(subtitle);
    },
    removeSubtitle(subtitle: Subtitle) {
      this.subtitles = this.subtitles.filter((s) => s !== subtitle);
    },
  },
});
