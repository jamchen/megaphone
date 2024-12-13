<template>
  <div>
    <q-card class="q-ma-sm" flat bordered>
      <q-chip>選擇來源</q-chip>
      <q-separator />
      <q-tabs
        v-model="videoSourceTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="standard" label="製作完整影片字幕" />
        <q-tab name="trim-yt-video" label="截取YT影片" />
      </q-tabs>
      <q-separator inset />
      <q-card-section>
        <q-tab-panels v-model="videoSourceTab" animated>
          <q-tab-panel name="standard">
            <div class="q-gutter-sm">
              <q-btn label="選擇影片" outline @click="selectVideoFile" />
              <input
                type="file"
                ref="videoFileInput"
                accept="video/*"
                style="display: none"
                @change="changeVideoFile"
              />
              <q-btn
                label="下載YT影片"
                outline
                @click="doDownloadYouTubeVideo"
              />
            </div>
          </q-tab-panel>
          <q-tab-panel name="trim-yt-video" class="q-col-gutter-sm">
            <div class="row">
              <q-input
                class="col"
                dense
                outlined
                v-model="youTubeVideoUrl"
                placeholder="例：https://www.youtube.com/watch?v=MQ2kVk1qUfw"
                label="輸入YT影片網址"
              />
            </div>
            <div class="row q-col-gutter-sm">
              <q-input
                class="col"
                dense
                outlined
                v-model="startTime"
                placeholder="例：00:01:30"
                label="開始時間"
              />
              <q-input
                class="col"
                dense
                outlined
                v-model="endTime"
                placeholder="例：00:02:30"
                label="結束時間"
              />
              <q-btn
                class="col q-mt-sm q-ml-sm"
                label="下載片段"
                color="primary"
                :disable="!readyToDownloadYouTubeVideoSegment"
                @click="downloadYouTubeVideoSegment"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
        <q-toggle
          v-model="overlayLiveChat"
          label="合成直播聊天"
          color="primary"
        />
        <q-toggle
          v-model="autoTranscribe"
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
      <q-separator />
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-btn
            @click="
              doTranscribeAudioAndMaybeOverlaySubtitles(selectedModelSize)
            "
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
        <q-toggle
          v-model="autoOverlaySubtitles"
          label="當轉錄完後自動合成字幕"
          color="primary"
        />
      </q-card-section>
    </q-card>
    <q-card class="q-ma-sm" flat bordered>
      <q-chip> 合成 </q-chip>
      <q-separator />
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-btn
            @click="doOverlaySubtitles"
            label="將字幕合成到影片"
            color="primary"
          ></q-btn>
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
import { computed, ref, toRaw } from 'vue';

const projectStore = useProjectStore();
const {
  videoFilePath,
  audioFilePath,
  youTubeVideoUrl,
  videoSourceTab,
  autoTranscribe,
  autoOverlaySubtitles,
  overlayLiveChat,
} = storeToRefs(projectStore);
const subtitlesStore = useSubtitlesStore();
const { clearSubtitles, addSubtitle } = subtitlesStore;

const {
  downloadYouTubeVideo,
  getPathForFile,
  extractAudio,
  transcribeAudio,
  basename,
  getAppPath,
  exportSubtitles,
  showSaveDialog,
  overlaySubtitles,
  showItemInFolder,
  fileExists,
  generateASS,
} = window.electronAPI;

const videoFileInput = ref<HTMLInputElement | null>(null);
const startTime = ref<string | undefined>();
const endTime = ref<string | undefined>();
const readyToDownloadYouTubeVideoSegment = computed(() => {
  return (
    youTubeVideoUrl.value != undefined &&
    youTubeVideoUrl.value.length > 0 &&
    startTime.value != undefined &&
    startTime.value.length > 0 &&
    endTime.value != undefined &&
    endTime.value.length > 0
  );
});

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

const doTranscribeAudioAndMaybeOverlaySubtitles = async (
  model: WhisperModelSize
) => {
  await doTranscribeAudio(model);
  if (autoOverlaySubtitles.value) {
    await doOverlaySubtitles();
  }
};

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

const downloadYouTubeVideoAndMaybeTranscribe = async (
  videoUrl: string,
  startTime: string | undefined = undefined,
  endTime: string | undefined = undefined,
  overlayLiveChat = false
) => {
  try {
    // Mark the start time
    performance.mark('start-download');
    console.log('Downloading YouTube video:', videoUrl);
    const ytVideoFilePath = await downloadYouTubeVideo(
      videoUrl,
      startTime,
      endTime,
      overlayLiveChat,
      (progress) => {
        $q.loading.show({
          message: `下載YT影片: ${(progress.value * 100).toFixed(0)}%`,
        });
      }
    );
    console.log('Downloaded YouTube video:', ytVideoFilePath);
    videoFilePath.value = ytVideoFilePath;
    audioFilePath.value = undefined;
    clearSubtitles();

    // Mark the end time for download
    performance.mark('end-download');

    if (videoFilePath.value && overlayLiveChat && startTime && endTime) {
      try {
        videoFilePath.value = await overlayLiveChatToVideo(
          videoFilePath.value,
          startTime,
          endTime
        );
      } catch (e) {
        notifyError(e);
      }
    }

    if (autoTranscribe.value) {
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

      if (autoOverlaySubtitles.value) {
        performance.mark('start-overlay-subtitles');
        await doOverlaySubtitles();
        performance.mark('end-overlay-subtitles');
      }
    }

    // Measure the duration for download
    performance.measure('download-duration', 'start-download', 'end-download');
    const downloadDuration =
      performance.getEntriesByName('download-duration')[0].duration;
    console.log(`Download duration: ${formatDuration(downloadDuration)}`);

    if (autoTranscribe.value) {
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

      let overlaySubtitlesDuration = 0;
      if (autoOverlaySubtitles.value) {
        // Measure the duration for overlaying subtitles
        performance.measure(
          'overlay-subtitles-duration',
          'start-overlay-subtitles',
          'end-overlay-subtitles'
        );
        overlaySubtitlesDuration = performance.getEntriesByName(
          'overlay-subtitles-duration'
        )[0].duration;
        console.log(
          `Subtitles overlay duration: ${formatDuration(
            overlaySubtitlesDuration
          )}`
        );
      }

      // Calculate and log the total duration
      const totalDuration =
        downloadDuration +
        extractAudioDuration +
        transcribeAudioDuration +
        overlaySubtitlesDuration;
      console.log(`Total duration: ${formatDuration(totalDuration)}`);
    }

    // Clear the performance entries
    performance.clearMarks();
    performance.clearMeasures();
  } catch (error) {
    notifyError(error);
  }
};
const doDownloadYouTubeVideo = async () => {
  $q.dialog({
    title: 'Enter YouTube Video URL',
    message: '輸入要下載的YouTube影片網址',
    prompt: {
      model: '',
      type: 'text',
      placeholder: '例如：https://www.youtube.com/watch?v=MQ2kVk1qUfw',
    },
    cancel: true,
    persistent: true,
  }).onOk(async (videoUrl) => {
    if (!videoUrl) {
      return;
    }
    $q.loading.show({
      message: '下載YT影片',
    });
    await downloadYouTubeVideoAndMaybeTranscribe(videoUrl);
    $q.loading.hide();
  });
};

const downloadYouTubeVideoSegment = async () => {
  if (!youTubeVideoUrl.value) {
    return;
  }
  if (!startTime.value) {
    return;
  }
  if (!endTime.value) {
    return;
  }
  $q.loading.show({
    message: '下載YT影片',
  });
  await downloadYouTubeVideoAndMaybeTranscribe(
    youTubeVideoUrl.value,
    startTime.value,
    endTime.value,
    overlayLiveChat.value
  );
  $q.loading.hide();
};

async function overlayLiveChatToVideo(
  videoFilePath: string,
  startTime: string,
  endTime: string
) {
  const liveChatFilePath = videoFilePath.replace('.mp4', '.live_chat.json');
  const liveChatAss = videoFilePath.replace('.mp4', '.ass');
  const liveChatFileExists = await fileExists(liveChatFilePath);
  console.log('Live chat file exists:', liveChatFileExists, liveChatFilePath);
  await generateASS(liveChatFilePath, liveChatAss, startTime, endTime);

  const liveChatVideoPath = videoFilePath.replace('.mp4', '.live_chat.mp4');
  await overlaySubtitles({
    inputVideo: videoFilePath,
    subtitleFile: liveChatAss,
    outputVideo: liveChatVideoPath,
  });
  return liveChatVideoPath;
}

// TODO: DRY this function
function getFileExtension(filePath: string): string {
  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return ''; // No extension found
  }
  return filePath.substring(lastDotIndex);
}

const doOverlaySubtitles = async () => {
  $q.loading.show({
    message: '合成字幕',
  });
  try {
    if (!videoFilePath.value) {
      throw new Error('Please select a video file first');
    }
    const videoBaseName =
      basename(videoFilePath.value, getFileExtension(videoFilePath.value)) ||
      'output';
    const defaultOutputPath = `${videoBaseName}-subtitled.mp4`;

    const { filePath: outputFilePath } = await showSaveDialog({
      title: 'Save Video with Subtitles',
      defaultPath: defaultOutputPath,
    });

    if (outputFilePath) {
      console.log('Saving video to:', outputFilePath);

      // Save subtitles to a temporary file
      const tmpDir = await getAppPath('temp');
      console.log('Temporary directory:', tmpDir);
      const tempSubtitlesPath = `${tmpDir}${videoBaseName}_subtitles.srt`;
      await exportSubtitles(
        tempSubtitlesPath,
        subtitlesStore.subtitles.map(toRaw)
      );
      console.log('Subtitles saved to:', tempSubtitlesPath);

      // Call the function to overlay subtitles and save the video
      await overlaySubtitles({
        inputVideo: videoFilePath.value,
        subtitleFile: tempSubtitlesPath,
        outputVideo: outputFilePath,
        forceStyle:
          'BorderStyle=4,BackColour=&H80000000,Outline=0,Shadow=0,FontSize=24',
      });

      showItemInFolder(outputFilePath);
      $q.notify({
        type: 'positive',
        message: 'Video saved successfully',
      });
    } else {
      console.log('Save dialog was canceled');
    }
  } catch (error) {
    notifyError(error);
  }
  $q.loading.hide();
};
</script>

<style scoped></style>
