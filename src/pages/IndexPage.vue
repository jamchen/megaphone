<template>
  <q-page class="items-center justify-evenly">
    <div class="row">
      <input type="file" @change="onFileChange" accept="video/*" />
    </div>
    <div class="row" v-if="videoUrl">
      <video ref="videoElement" :src="videoUrl" controls width="1280"></video>
    </div>
    <div class="row">
      <q-btn
        @click="transcribeAudio(selectedModelSize)"
        label="Transcribe Audio"
        color="primary"
      ></q-btn>
      <q-select
        v-model="selectedModelSize"
        :options="modelSizes"
        label="Select Whisper Model Size"
        outlined
        emit-value
        map-options
      />
      <div v-if="progress">{{ progress }}</div>
    </div>
    <SubtitleStrip />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useSubtitlesStore } from 'stores/subtitles';
import SubtitleStrip from 'components/SubtitleStrip.vue';

defineOptions({
  name: 'IndexPage',
});

const $q = useQuasar();

const store = useSubtitlesStore();
const addSubtitle = store.addSubtitle;

const progress = ref<string | null>(null);
const audioFilePath = '/Users/jamchen/Developer/code/megaphone/audio.wav';

const modelSizes = [
  { label: 'Tiny', value: 'tiny' },
  { label: 'Base', value: 'base' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];
const selectedModelSize = ref<WhisperModelSize>('small');

// const videoUrl = URL.createObjectURL(
//   new File('/Users/jamchen/Developer/code/megaphone/video.mp4')
// );

const videoUrl = ref<string | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const { selectedSubtitle } = storeToRefs(store);

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    videoUrl.value = URL.createObjectURL(file);
  }
};

watch(selectedSubtitle, (newSubtitle) => {
  if (newSubtitle && videoElement.value) {
    videoElement.value.currentTime = newSubtitle.start;
  }
});

const transcribeAudio = (model: WhisperModelSize) => {
  console.log(`Transcribing audio with ${model}`);
  store.clearSubtitles();
  window.electronAPI
    .transcribeAudio(audioFilePath, model, (progressMessage) => {
      progress.value = progressMessage;
    })
    .then((resultSegments) => {
      resultSegments.forEach((segment) => {
        addSubtitle({
          start: segment.start,
          end: segment.end,
          text: segment.text,
        });
      });
      $q.notify({
        type: 'positive',
        message: 'Transcription complete',
      });
      progress.value = null;
    })
    .catch((error) => {
      $q.notify({
        type: 'negative',
        message: error,
      });
      progress.value = null;
    });
};

videoUrl.value = await window.electronAPI.createObjectURL(
  '/Users/jamchen/Developer/code/megaphone/input.mp4'
);
</script>
