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

defineProps({
  videoUrl: String,
});

const store = useSubtitlesStore();
const { selectedSubtitle, subtitles } = storeToRefs(store);
const videoElement = ref<HTMLVideoElement | null>(null);

watch(selectedSubtitle, (newSubtitle) => {
  if (newSubtitle && videoElement.value) {
    const currentTime = videoElement.value.currentTime;
    const currentSubtitle = subtitles.value.find(
      (subtitle) => currentTime >= subtitle.start && currentTime < subtitle.end
    );
    if (currentSubtitle != newSubtitle) {
      videoElement.value.currentTime = newSubtitle.start;
    }
  }
});

const updateSelectedSubtitle = () => {
  if (videoElement.value) {
    const currentTime = videoElement.value.currentTime;
    const currentSubtitle = subtitles.value.find(
      (subtitle) => currentTime >= subtitle.start && currentTime < subtitle.end
    );
    if (currentSubtitle && store.selectedSubtitle != currentSubtitle) {
      store.selectedSubtitle = currentSubtitle;
    }
  }
};

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.addEventListener('timeupdate', updateSelectedSubtitle);
  }
});

onUnmounted(() => {
  if (videoElement.value) {
    videoElement.value.removeEventListener(
      'timeupdate',
      updateSelectedSubtitle
    );
  }
});
</script>

<style scoped></style>
