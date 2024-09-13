<template>
  <div class="row">
    <q-scroll-area class="full-width bg-dark q-pt-sm" style="height: 142px">
      <div class="row no-wrap">
        <q-card
          v-for="(subtitle, index) in subtitles"
          :key="index"
          class="q-pa-sx q-ml-sm q-mt-sx"
          style="width: 200px; height: 127px"
        >
          <q-card-section>
            {{ subtitle.text }}
          </q-card-section>
          <q-card-actions class="q-pl-md absolute-bottom">
            {{ formatTime(subtitle.start) }} - {{ formatTime(subtitle.end) }}
          </q-card-actions>
        </q-card>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSubtitlesStore } from 'stores/subtitles';

const store = useSubtitlesStore();

const subtitles = computed(() => store.subtitles);

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};
</script>

<style scoped></style>
