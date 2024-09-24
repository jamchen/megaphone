import { defineStore } from 'pinia';

export interface Subtitle {
  text: string;
  start: number;
  end: number;
}

export const useSubtitlesStore = defineStore('subtitles', {
  state: () => ({
    subtitles: [] as Subtitle[],
    selectedSubtitle: null as Subtitle | null,
  }),

  getters: {},

  actions: {
    addSubtitle(subtitle: Subtitle) {
      this.subtitles.push(subtitle);
    },
    removeSubtitle(subtitle: Subtitle) {
      this.subtitles = this.subtitles.filter((s) => s !== subtitle);
    },
    clearSubtitles() {
      this.subtitles = [];
      this.selectedSubtitle = null;
    },
    selectSubtitle(subtitle: Subtitle) {
      this.selectedSubtitle = subtitle;
    },
    deselectSubtitle() {
      this.selectedSubtitle = null;
    },
  },
});
