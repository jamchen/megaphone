<template>
  <div class="q-gutter-sm">
    <div class="row q-gutter-sm">
      <q-btn label="Select Video" color="primary" @click="selectVideoFile" />
      <input
        type="file"
        ref="videoFileInput"
        accept="video/*"
        style="display: none"
        @change="changeVideoFile"
      />
    </div>
    <div class="row q-gutter-sm">
      <q-btn
        class="col-xs-12 col-sm-6 col-md-4"
        label="Extract Audio"
        color="primary"
        @click="extractAudio"
        :disable="videoFilePath == undefined"
      />
    </div>
    <div class="row q-gutter-sm">
      <q-btn
        class="col-xs-12 col-sm-6 col-md-4"
        @click="transcribeAudio(selectedModelSize)"
        label="Transcribe Audio"
        color="primary"
        :disable="audioFilePath == undefined"
      ></q-btn>
      <q-select
        class="col-xs-12 col-sm-6 col-md-4"
        v-model="selectedModelSize"
        :options="modelSizes"
        label="Select Whisper Model Size"
        outlined
        emit-value
        map-options
        dense
        :stack-label="false"
      />
      <div v-if="progress">{{ progress }}</div>
    </div>
    <div class="row q-gutter-sm">
      <q-btn
        class="col-xs-12 col-sm-6 col-md-4"
        @click="selectSrtFile"
        label="Load Existing SRT File"
        color="secondary"
      ></q-btn>
      <input
        type="file"
        ref="srtFileInput"
        accept=".srt"
        style="display: none"
        @change="onSrtFileChange"
      />
    </div>
    <div class="row q-gutter-sm">
      <q-btn
        class="col-xs-12 col-sm-6 col-md-4"
        @click="translateSubtitles"
        label="Translate Subtitles"
        color="secondary"
      ></q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useProjectStore } from 'src/stores/project';
import { useSubtitlesStore } from 'src/stores/subtitles';
import { ref } from 'vue';
import srtParser from 'subtitles-parser-vtt';

const projectStore = useProjectStore();
const { videoFilePath, audioFilePath } = storeToRefs(projectStore);
const subtitlesStore = useSubtitlesStore();
const { clearSubtitles, addSubtitle } = subtitlesStore;

const videoFileInput = ref<HTMLInputElement | null>(null);

const selectVideoFile = () => {
  videoFileInput.value?.click();
};

const changeVideoFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const videoFile = input.files[0];
    videoFilePath.value = window.electronAPI.getPathForFile(videoFile);
    audioFilePath.value = undefined;
    clearSubtitles();
  }
};

const $q = useQuasar();

const extractAudio = async () => {
  const filePath = videoFilePath.value;
  if (!filePath) {
    return;
  }
  $q.loading.show();
  try {
    audioFilePath.value = undefined;
    const outputFilePath = await window.electronAPI.extractAudio(filePath);
    audioFilePath.value = outputFilePath;
  } catch (error) {
    notifyError(error);
  }
  $q.loading.hide();
};

const progress = ref<string | null>(null);

const modelSizes = [
  { label: 'Tiny', value: 'tiny' },
  { label: 'Base', value: 'base' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];
const selectedModelSize = ref<WhisperModelSize>('small');

const transcribeAudio = async (model: WhisperModelSize) => {
  if (!audioFilePath.value) {
    $q.notify({
      type: 'negative',
      message: 'Please extract audio',
    });
    return;
  }
  $q.loading.show();
  console.log(`Transcribing audio with ${model}`);
  subtitlesStore.clearSubtitles();
  try {
    const resultSegments = await window.electronAPI.transcribeAudio(
      audioFilePath.value,
      model,
      (progressMessage) => {
        progress.value = progressMessage;
      }
    );
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
  } catch (error) {
    notifyError(error);
    progress.value = null;
  }
  $q.loading.hide();
};

const srtFileInput = ref<HTMLInputElement | null>(null);

// Function to trigger file input click
const selectSrtFile = () => {
  srtFileInput.value?.click();
};

// Function to handle file input change
const onSrtFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      loadSrtContent(content);
    };
    reader.readAsText(file);
  }
};

// Function to parse and load SRT content into subtitles store
const loadSrtContent = (content: string) => {
  const subtitles = srtParser.fromVtt(content, 'ms');
  subtitlesStore.clearSubtitles();
  subtitles.forEach((subtitle) => {
    addSubtitle({
      start: subtitle.startTime / 1000,
      end: subtitle.endTime / 1000,
      text: subtitle.text,
    });
  });
};

const translateSubtitles = async () => {
  $q.loading.show();
  const subtitles = subtitlesStore.subtitles;
  subtitlesStore.translatedSubtitles = [];
  for (const subtitle of subtitles) {
    try {
      // const translation = await window.electronAPI.googleTranslate(subtitle.text, {
      //   to: 'en',
      // });
      // translatedSubtitle = translation.text;
      const translatedSubtitle = await window.electronAPI.pythonTranslate(
        subtitle.text,
        'zh-TW',
        'en'
      );
      subtitlesStore.translatedSubtitles.push({
        start: subtitle.start,
        end: subtitle.end,
        text: translatedSubtitle,
      });
    } catch (error) {
      notifyError(error);
      break;
    }
  }
  $q.loading.hide();
};

const notifyError = (error: unknown) => {
  console.error(error);
  $q.notify({
    type: 'negative',
    message: typeof error === 'string' ? error : String(error),
  });
};
</script>

<style scoped></style>
