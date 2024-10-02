<template>
  <div>
    <q-card class="q-ma-sm" flat bordered>
      <q-chip>選擇來源</q-chip>
      <q-card-section>
        <div class="q-gutter-sm">
          <q-btn label="選擇影片" outline @click="selectVideoFile" />
          <input
            type="file"
            ref="videoFileInput"
            accept="video/*"
            style="display: none"
            @change="changeVideoFile"
          />
          <q-btn label="下載YT影片" outline @click="doDownloadYouTubeVideo" />
        </div>
        <q-toggle
          v-model="autoMode"
          label="當影片下載完後自動轉錄"
          color="primary"
        />
      </q-card-section>
    </q-card>
    <q-card class="q-ma-sm" flat bordered>
      <q-chip>
        轉錄
        <span class="text-caption">
          &nbsp;*第一次轉錄或者是切換不同選項會花比較久時間下載AI模型
        </span>
      </q-chip>
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-btn
            @click="doTranscribeAudio(selectedModelSize)"
            label="轉錄成字幕"
            color="primary"
          ></q-btn>
          <q-select
            v-model="selectedModelSize"
            :options="modelSizes"
            label="Whisper Model Size"
            outlined
            emit-value
            map-options
            dense
            style="width: 150px"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useProjectStore } from 'src/stores/project';
import { useSubtitlesStore } from 'src/stores/subtitles';
import { ref } from 'vue';

const projectStore = useProjectStore();
const { videoFilePath, audioFilePath } = storeToRefs(projectStore);
const subtitlesStore = useSubtitlesStore();
const { clearSubtitles, addSubtitle } = subtitlesStore;

const { downloadYouTubeVideo, getPathForFile, extractAudio, transcribeAudio } =
  window.electronAPI;

const autoMode = ref(true);
const videoFileInput = ref<HTMLInputElement | null>(null);

const selectVideoFile = () => {
  videoFileInput.value?.click();
};

const changeVideoFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const videoFile = input.files[0];
    videoFilePath.value = getPathForFile(videoFile);
    audioFilePath.value = undefined;
    clearSubtitles();
    input.value = '';
  }
};

const $q = useQuasar();

const doExtractAudio = async () => {
  const filePath = videoFilePath.value;
  if (!filePath) {
    return;
  }
  $q.loading.show({
    message: '抽取音軌',
  });
  try {
    audioFilePath.value = undefined;
    console.log('Extracting audio from:', filePath);
    const outputFilePath = await extractAudio(filePath);
    console.log('Extracted audio to:', outputFilePath);
    audioFilePath.value = outputFilePath;
  } catch (error) {
    notifyError(error);
  }
  $q.loading.hide();
};

const modelSizes = [
  { label: 'Tiny', value: 'tiny' },
  { label: 'Base', value: 'base' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];
const selectedModelSize = ref<WhisperModelSize>('small');

const doTranscribeAudio = async (model: WhisperModelSize) => {
  if (!audioFilePath.value) {
    await doExtractAudio();
  }
  if (!audioFilePath.value) {
    $q.notify({
      type: 'negative',
      message: 'Please extract audio failed',
    });
    return;
  }
  $q.loading.show({
    message: '轉錄字幕',
  });
  console.log(`Transcribing audio with ${model}`);
  subtitlesStore.clearSubtitles();
  try {
    let lastProgress: string | undefined = undefined;
    const resultSegments = await transcribeAudio(
      audioFilePath.value,
      model,
      (progress) => {
        let message = '轉錄字幕';
        if (lastProgress?.startsWith('Loading model:')) {
          message = `轉錄字幕 - 下載模型 ${progress}`;
        } else if (lastProgress?.startsWith('Transcribing audio')) {
          message = `轉錄字幕 - ${progress}`;
        } else {
          lastProgress = progress;
        }
        if (progress.startsWith('Transcribing audio')) {
          lastProgress = progress;
        }
        $q.loading.show({
          message,
        });
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
    console.log('Transcription complete');
  } catch (error) {
    notifyError(error);
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

function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  const hoursStr = hours > 0 ? `${hours}h ` : '';
  const minutesStr = minutes > 0 ? `${minutes}m ` : '';
  const secondsStr = seconds > 0 ? `${seconds}s` : '';

  return `${hoursStr}${minutesStr}${secondsStr}`.trim() || '0s';
}

const doDownloadYouTubeVideo = async () => {
  $q.dialog({
    title: 'Enter YouTube Video URL',
    message: 'Enter the URL of the YouTube video to download',
    prompt: {
      model: 'https://www.youtube.com/watch?v=-lPuxo8aVYE',
      type: 'text',
    },
    cancel: true,
    persistent: true,
  }).onOk(async (videoUrl) => {
    try {
      if (!videoUrl) {
        return;
      }
      $q.loading.show({
        message: '下載YT影片',
      });

      // Mark the start time
      performance.mark('start-download');

      console.log('Downloading YouTube video:', videoUrl);
      const ytVideoFilePath = await downloadYouTubeVideo(videoUrl);
      console.log('Downloaded YouTube video:', ytVideoFilePath);
      videoFilePath.value = ytVideoFilePath;
      audioFilePath.value = undefined;
      clearSubtitles();

      // Mark the end time for download
      performance.mark('end-download');

      if (autoMode.value) {
        // Mark the start time for audio extraction
        performance.mark('start-extract-audio');

        await doExtractAudio();

        // Mark the end time for audio extraction
        performance.mark('end-extract-audio');

        // Mark the start time for audio transcription
        performance.mark('start-transcribe-audio');

        await doTranscribeAudio(selectedModelSize.value);

        // Mark the end time for audio transcription
        performance.mark('end-transcribe-audio');
      }

      // Measure the duration for download
      performance.measure(
        'download-duration',
        'start-download',
        'end-download'
      );
      const downloadDuration =
        performance.getEntriesByName('download-duration')[0].duration;
      console.log(`Download duration: ${formatDuration(downloadDuration)}`);

      if (autoMode.value) {
        // Measure the duration for audio extraction
        performance.measure(
          'extract-audio-duration',
          'start-extract-audio',
          'end-extract-audio'
        );
        const extractAudioDuration = performance.getEntriesByName(
          'extract-audio-duration'
        )[0].duration;
        console.log(
          `Audio extraction duration: ${formatDuration(extractAudioDuration)}`
        );

        // Measure the duration for audio transcription
        performance.measure(
          'transcribe-audio-duration',
          'start-transcribe-audio',
          'end-transcribe-audio'
        );
        const transcribeAudioDuration = performance.getEntriesByName(
          'transcribe-audio-duration'
        )[0].duration;
        console.log(
          `Audio transcription duration: ${formatDuration(
            transcribeAudioDuration
          )}`
        );

        // Calculate and log the total duration
        const totalDuration =
          downloadDuration + extractAudioDuration + transcribeAudioDuration;
        console.log(`Total duration: ${formatDuration(totalDuration)}`);
      }

      // Clear the performance entries
      performance.clearMarks();
      performance.clearMeasures();
    } catch (error) {
      notifyError(error);
    }
    $q.loading.hide();
  });
};
</script>

<style scoped></style>
