<template>
  <div class="row">
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
</template>

<script setup lang="ts">
import { useTemplateRef, watch, nextTick, ComponentPublicInstance } from 'vue';
import { storeToRefs } from 'pinia';
import { useSubtitlesStore } from 'stores/subtitles';

const store = useSubtitlesStore();

const { subtitles, selectedSubtitle } = storeToRefs(store);
const selectSubtitle = store.selectSubtitle;
const subtitleCards =
  useTemplateRef<ComponentPublicInstance<HTMLElement>[]>('subtitleCards');

watch(selectedSubtitle, async (newSubtitle) => {
  if (newSubtitle) {
    await nextTick();
    const index = subtitles.value.findIndex(
      (subtitle) => subtitle === newSubtitle
    );
    if (index !== -1) {
      const selectedCard = subtitleCards.value?.[index];
      selectedCard?.$el.scrollIntoView({
        behavior: 'smooth',
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
</script>

<style lang="scss" scoped>
.selected-border {
  border: 6px solid $primary; /* Adjust the color as needed */
}
</style>
