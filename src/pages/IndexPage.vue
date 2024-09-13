<template>
  <q-page class="items-center justify-evenly">
    <div class="row">
      <q-btn
        @click="transcribeAudio"
        label="Transcribe Audio"
        color="primary"
      ></q-btn>
      <div v-if="progress">{{ progress }}</div>
    </div>
    <SubtitleStrip />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

const transcribeAudio = () => {
  const audioFilePath = '/Users/jamchen/Developer/code/megaphone/audio.wav';

  window.electronAPI
    .transcribeAudio(audioFilePath, (progressMessage) => {
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
</script>
