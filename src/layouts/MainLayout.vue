<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-icon name="campaign" size="lg" />
        <q-toolbar-title> Megaphone - {{ videoFileName }} </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <Suspense>
        <router-view />
      </Suspense>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project';
import { computed } from 'vue';

const projectStore = useProjectStore();
const { videoFilePath } = storeToRefs(projectStore);
const videoFileName = computed(() => {
  if (!videoFilePath.value) {
    return '';
  }
  return window.electronAPI.basename(videoFilePath.value);
});

defineOptions({
  name: 'MainLayout',
});
</script>
