<template>
  <div class="row">
    <div class="col-xs-auto q-pa-sm">
      <q-btn icon="save" @click="exportSubtitlesAsSrt" size="sm">
        <q-tooltip>Export Subtitles</q-tooltip>
      </q-btn>
    </div>
    <div class="col">
      <q-scroll-area class="full-width bg-dark q-pt-sm" style="height: 202px">
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
          >
            <q-card-section>
              {{ subtitle.text }}
            </q-card-section>
            <q-card-actions class="q-pl-md absolute-bottom">
              {{ formatTime(subtitle.start) }} - {{ formatTime(subtitle.end) }}
            </q-card-actions>
          </q-card>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, watch, ComponentPublicInstance } from 'vue';
import { storeToRefs } from 'pinia';
import { useSubtitlesStore } from 'stores/subtitles';
import { useProjectStore } from 'src/stores/project';

const props = defineProps<{
  subtitles: Subtitle[];
}>();

const subtitlesStore = useSubtitlesStore();
const { selectedSubtitle } = storeToRefs(subtitlesStore);
const selectSubtitle = subtitlesStore.selectSubtitle;

const projectStore = useProjectStore();
const { videoCurrentTime, videoFilePath } = storeToRefs(projectStore);

const { showSaveDialog, exportSubtitles, basename } = window.electronAPI;

const subtitleCards =
  useTemplateRef<ComponentPublicInstance<HTMLElement>[]>('subtitleCards');

watch(videoCurrentTime, async (currentTime) => {
  if (currentTime) {
    const index = props.subtitles.findIndex(
      (subtitle) => currentTime >= subtitle.start && currentTime < subtitle.end
    );
    if (index !== -1) {
      const cardForCurrentTime = subtitleCards.value?.[index];
      cardForCurrentTime?.$el.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }
});

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

const exportSubtitlesAsSrt = async () => {
  const defaultPath = videoFilePath.value
    ? `${basename(videoFilePath.value)}.srt`
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
  exportSubtitles(filePath, props.subtitles);
};
</script>

<style lang="scss" scoped>
.selected-border {
  border: 6px solid $primary; /* Adjust the color as needed */
}
</style>
