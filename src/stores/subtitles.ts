import { defineStore } from 'pinia';

export const useSubtitlesStore = defineStore('subtitles', {
  state: () => ({
    subtitles: [] as Subtitle[],
    translatedSubtitles: [] as Subtitle[],
    selectedSubtitle: null as Subtitle | undefined | null,
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
      this.translatedSubtitles = [];
      this.selectedSubtitle = null;
    },
    selectSubtitle(subtitle: Subtitle) {
      this.selectedSubtitle = subtitle;
    },
    deselectSubtitle() {
      this.selectedSubtitle = null;
    },
  },

  persist: {
    pick: ['subtitles', 'translatedSubtitles'],
  },
});
