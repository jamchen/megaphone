<template>
  <div>
    <video
      class="full-width"
      ref="videoElement"
      :src="videoUrl"
      controls
    ></video>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSubtitlesStore } from 'stores/subtitles';
import { useProjectStore } from 'stores/project';

defineProps({
  videoUrl: String,
});

const subtitlesStore = useSubtitlesStore();
const { selectedSubtitle, subtitles, translatedSubtitles } =
  storeToRefs(subtitlesStore);
const projectStore = useProjectStore();
const { videoCurrentTime } = storeToRefs(projectStore);
const videoElement = ref<HTMLVideoElement | null>(null);

watch(selectedSubtitle, (newSubtitle) => {
  if (newSubtitle && videoElement.value) {
    const currentTime = videoElement.value.currentTime;
    const subtitleForCurrentTime = subtitles.value.find(
      (subtitle) => currentTime >= subtitle.start && currentTime < subtitle.end
    );
    const translatedSubtitleForCurrentTime =
      subtitlesStore.translatedSubtitles.find(
        (subtitle) =>
          currentTime >= subtitle.start && currentTime < subtitle.end
      );
    if (
      subtitleForCurrentTime != newSubtitle &&
      translatedSubtitleForCurrentTime != newSubtitle
    ) {
      videoElement.value.currentTime = newSubtitle.start;
    }
  }
});

const updateSelectedSubtitle = () => {
  if (videoElement.value) {
    const currentTime = videoElement.value.currentTime;
    videoCurrentTime.value = currentTime;
    const subtitleForCurrentTime = subtitles.value.find(
      (subtitle) => currentTime >= subtitle.start && currentTime < subtitle.end
    );
    const translatedSubtitleForCurrentTime =
      subtitlesStore.translatedSubtitles.find(
        (subtitle) =>
          currentTime >= subtitle.start && currentTime < subtitle.end
      );
    if (
      subtitlesStore.selectedSubtitle == subtitleForCurrentTime ||
      subtitlesStore.selectedSubtitle == translatedSubtitleForCurrentTime
    ) {
      // Do nothing if the selected subtitle is already the correct one
      return;
    } else if (
      subtitles.value.find(
        (subtitle) => subtitle == subtitlesStore.selectedSubtitle
      ) &&
      subtitleForCurrentTime
    ) {
      subtitlesStore.selectedSubtitle = subtitleForCurrentTime;
    } else if (
      translatedSubtitles.value.find(
        (subtitle) => subtitle == subtitlesStore.selectedSubtitle
      ) &&
      translatedSubtitleForCurrentTime
    ) {
      subtitlesStore.selectedSubtitle = translatedSubtitleForCurrentTime;
    }
  }
};

// Toggle playback on space bar press
const togglePlaybackIfNeeded = (event: KeyboardEvent) => {
  if (event.code === 'Space' && videoElement.value) {
    if (videoElement.value.paused) {
      videoElement.value.play();
    } else {
      videoElement.value.pause();
    }
  }
};

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.addEventListener('timeupdate', updateSelectedSubtitle);
  }
  window.addEventListener('keydown', togglePlaybackIfNeeded);
});

onUnmounted(() => {
  if (videoElement.value) {
    videoElement.value.removeEventListener(
      'timeupdate',
      updateSelectedSubtitle
    );
  }
  window.removeEventListener('keydown', togglePlaybackIfNeeded);
});
</script>

<style scoped></style>
