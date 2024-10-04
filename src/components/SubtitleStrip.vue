<template>
  <div class="row">
    <div class="col-xs-auto q-pa-sm q-gutter-xs">
      <div class="row">
        <q-btn
          class="full-width"
          stack
          label="載入字幕"
          outline
          icon="file_open"
          @click="selectSrtFile"
          size="sm"
        >
          <q-tooltip>載入字幕</q-tooltip>
        </q-btn>
        <input
          type="file"
          ref="srtFileInput"
          accept=".srt"
          style="display: none"
          @change="onSrtFileChange"
        />
      </div>
      <div class="row">
        <q-btn
          class="full-width"
          stack
          label="輸出成字幕檔"
          outline
          icon="save"
          @click="exportSubtitlesAsSrt"
          size="sm"
        >
          <q-tooltip>輸出成字幕檔</q-tooltip>
        </q-btn>
      </div>
      <div class="row">
        <q-btn
          class="full-width"
          stack
          label="翻譯字幕"
          outline
          icon="translate"
          @click="translateSubtitles"
          size="sm"
        >
          <q-tooltip>翻譯字幕</q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="col">
      <q-scroll-area class="full-width q-pt-sm" style="height: 202px">
        <div class="row no-wrap">
          <q-card
            v-for="(subtitle, index) in subtitles"
            :key="index"
            class="q-pa-sx q-ml-sm q-mt-sx"
            style="width: 200px; height: 187px"
            :class="{ 'selected-border': subtitle === selectedSubtitle }"
            :bordered="subtitle === selectedSubtitle"
            @click="selectSubtitle(subtitle)"
            ref="subtitleCards"
            flat
          >
            <q-card-section>
              {{ subtitle.text }}
            </q-card-section>
            <q-card-actions class="q-pl-md absolute-bottom">
              {{ formatTime(subtitle.start) }} - {{ formatTime(subtitle.end) }}
            </q-card-actions>
            <q-menu context-menu>
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="removeSubtitlesToLeft(index)"
                >
                  <q-item-section>移除此字幕左邊所有字幕</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="removeSubtitleAt(index)"
                >
                  <q-item-section>移除此字幕</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="removeSubtitlesToRight(index)"
                >
                  <q-item-section>移除此字幕右邊邊所有字幕</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-card>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useTemplateRef,
  watch,
  ComponentPublicInstance,
  toRaw,
  nextTick,
  ref,
} from 'vue';
import { storeToRefs } from 'pinia';
import { useSubtitlesStore } from 'stores/subtitles';
import { useProjectStore } from 'src/stores/project';
import srtParser from 'subtitles-parser-vtt';
import { useQuasar } from 'quasar';

const props = defineProps<{
  subtitles: Subtitle[];
}>();

const $q = useQuasar();

const subtitlesStore = useSubtitlesStore();
const { selectedSubtitle } = storeToRefs(subtitlesStore);
const { selectSubtitle, addSubtitle } = subtitlesStore;

const projectStore = useProjectStore();
const { videoCurrentTime, videoFilePath } = storeToRefs(projectStore);

const { showSaveDialog, exportSubtitles, basename, pythonTranslate } =
  window.electronAPI;

const subtitleCards =
  useTemplateRef<ComponentPublicInstance<HTMLElement>[]>('subtitleCards');

watch(videoCurrentTime, async (currentTime) => {
  if (currentTime) {
    const index = props.subtitles.findIndex(
      (subtitle) => currentTime >= subtitle.start && currentTime < subtitle.end
    );
    if (index !== -1) {
      revealCardAtIndex(index);
    }
  }
});

function revealCardAtIndex(index: number) {
  const cardForCurrentTime = subtitleCards.value?.[index];
  cardForCurrentTime?.$el.scrollIntoView({
    behavior: 'auto',
    block: 'center',
  });
}

function formatTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const secs = String(date.getUTCSeconds()).padStart(2, '0');
  const millis = String(date.getUTCMilliseconds()).padStart(3, '0');
  if (hours === '00') {
    return `${minutes}:${secs},${millis}`;
  }
  return `${hours}:${minutes}:${secs},${millis}`;
}

/**
 * Gets the file extension from a full file path.
 * @param filePath - The full file path.
 * @returns The file extension, including the dot.
 */
function getFileExtension(filePath: string): string {
  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return ''; // No extension found
  }
  return filePath.substring(lastDotIndex);
}

const exportSubtitlesAsSrt = async () => {
  const defaultPath = videoFilePath.value
    ? `${basename(
        videoFilePath.value,
        getFileExtension(videoFilePath.value)
      )}.srt`
    : 'subtitles.srt';
  const result = await showSaveDialog({
    title: 'Export Subtitles',
    defaultPath: defaultPath,
    filters: [{ name: 'SubRip', extensions: ['srt'] }],
  });
  if (result.canceled) {
    return;
  }
  const filePath = result.filePath;
  exportSubtitles(filePath, props.subtitles.map(toRaw));
};

const removeSubtitlesToLeft = (index: number) => {
  // TODO: should propgate the change to the store via vue event
  subtitlesStore.subtitles = props.subtitles.slice(index);
  nextTick(() => {
    revealCardAtIndex(0);
  });
};

const removeSubtitlesToRight = (index: number) => {
  // TODO: should propgate the change to the store via vue event
  subtitlesStore.subtitles = props.subtitles.slice(0, index + 1);
};

const removeSubtitleAt = (index: number) => {
  // TODO: should propgate the change to the store via vue event
  subtitlesStore.subtitles = props.subtitles.filter((_, i) => i !== index);
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
    input.value = '';
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
  $q.notify({
    type: 'info',
    message: 'Coming soon...',
  });
  return;
  $q.loading.show({
    message: '翻譯字幕',
  });
  const subtitles = subtitlesStore.subtitles;
  subtitlesStore.translatedSubtitles = [];
  for (const subtitle of subtitles) {
    try {
      // const translation = await googleTranslate(subtitle.text, {
      //   to: 'en',
      // });
      // translatedSubtitle = translation.text;
      const translatedSubtitle = await pythonTranslate(
        subtitle.text,
        'zh-TW',
        'en'
      );
      // subtitlesStore.translatedSubtitles.push({
      //   start: subtitle.start,
      //   end: subtitle.end,
      //   text: translatedSubtitle,
      // });
      subtitle.text = translatedSubtitle;
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

<style lang="scss" scoped>
.selected-border {
  border: 6px solid $primary; /* Adjust the color as needed */
}
</style>
