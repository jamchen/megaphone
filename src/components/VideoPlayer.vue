<template>
  <div>
    <video
      id="video-player"
      class="full-width video-js"
      ref="videoElement"
    ></video>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useSubtitlesStore } from 'stores/subtitles';
import { useProjectStore } from 'stores/project';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

const props = defineProps({
  videoUrl: String,
});

const subtitlesStore = useSubtitlesStore();
const { selectedSubtitle, subtitles, translatedSubtitles } =
  storeToRefs(subtitlesStore);
const projectStore = useProjectStore();
const { videoCurrentTime, editingSubtitle } = storeToRefs(projectStore);
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

let resumePlaybackWhenExitEditing = false;

watch(editingSubtitle, (editingSubtitle) => {
  if (editingSubtitle && videoElement.value) {
    resumePlaybackWhenExitEditing = !player.value?.paused();
    player.value?.pause();
  } else if (!editingSubtitle && videoElement.value) {
    if (resumePlaybackWhenExitEditing) {
      player.value?.play();
      resumePlaybackWhenExitEditing = false;
    }
  }
});

const player = ref<Player | null>(null);
onMounted(() => {
  if (videoElement.value) {
    player.value = videojs(
      videoElement.value,
      {
        controls: true,
        playbackRates: [0.5, 1, 1.5, 1.75, 2],
        sources: [
          {
            src: props.videoUrl,
            type: 'video/mp4',
          },
        ],
      },
      () => {
        console.log('Video.js player initialized');
      }
    );
  }
});

onBeforeUnmount(() => {
  player.value?.dispose();
});

watch(
  () => props.videoUrl,
  (newUrl) => {
    console.log('New video URL:', newUrl);
    if (player.value) {
      player.value.src({
        src: newUrl,
        type: 'video/mp4',
      });
    }
  }
);

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

<style scoped>
#video-player {
  max-height: 450px;
}
</style>
