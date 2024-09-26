<template>
  <q-page>
    <div class="row" v-if="videoUrl">
      <div class="col">
        <VideoPlayer class="full-width" :videoUrl="videoUrl" />
      </div>
      <div class="col">
        <ControlPanel />
      </div>
    </div>
    <SubtitleStrip :subtitles="subtitles" />
    <SubtitleStrip
      v-if="translatedSubtitles && translatedSubtitles.length > 0"
      :subtitles="translatedSubtitles"
    />
    <div class="row" v-if="selectedSubtitle">
      <SubtitleEditor class="col" v-model="selectedSubtitle" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SubtitleStrip from 'components/SubtitleStrip.vue';
import VideoPlayer from 'components/VideoPlayer.vue';
import SubtitleEditor from 'components/SubtitleEditor.vue';
import ControlPanel from 'src/components/ControlPanel.vue';
import { storeToRefs } from 'pinia';
import { useSubtitlesStore } from 'stores/subtitles';
import { useProjectStore } from 'src/stores/project';

defineOptions({
  name: 'IndexPage',
});

const projectStore = useProjectStore();
const { videoFilePath } = storeToRefs(projectStore);

const videoUrl = computed(() => {
  console.log('Video file path:', videoFilePath.value);
  if (!videoFilePath.value) {
    return null;
  }
  try {
    const objUrl = window.electronAPI.createObjectURL(videoFilePath.value);
    console.log('Object URL:', objUrl);
    return objUrl;
  } catch (error) {
    console.error('Error creating object URL:', error);
    return null;
  }
});

const subtitlesStore = useSubtitlesStore();
const { subtitles, selectedSubtitle, translatedSubtitles } =
  storeToRefs(subtitlesStore);
</script>
