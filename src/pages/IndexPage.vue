<template>
  <q-page class="row items-center justify-evenly">
    <q-btn
      @click="transcribeAudio"
      label="Transcribe Audio"
      color="primary"
    ></q-btn>
    <div v-if="progress">{{ progress }}</div>
    <div v-if="segments">
      <div v-for="segment in segments" :key="segment.id">
        {{ segment.text }}
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'IndexPage',
});

const $q = useQuasar();

const progress = ref<string | null>(null);
const segments = ref<Array<Segment> | null>(null);

const transcribeAudio = () => {
  const audioFilePath = 'audio.wav';

  window.electronAPI
    .transcribeAudio(audioFilePath, (progressMessage) => {
      progress.value = progressMessage;
    })
    .then((resultSegments) => {
      segments.value = resultSegments;
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
</script>
