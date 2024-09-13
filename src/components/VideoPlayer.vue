<template>
  <div>
    <video ref="videoElement" :src="videoUrl" controls width="1280"></video>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSubtitlesStore } from 'stores/subtitles';

defineProps({
  videoUrl: String,
});

const store = useSubtitlesStore();
const { selectedSubtitle } = storeToRefs(store);
const videoElement = ref<HTMLVideoElement | null>(null);

watch(selectedSubtitle, (newSubtitle) => {
  if (newSubtitle && videoElement.value) {
    videoElement.value.currentTime = newSubtitle.start;
  }
});
</script>

<style scoped></style>
