<template>
  <div>
    <q-input
      v-model="model.text"
      label="編輯字幕"
      hint="編輯完同時按Enter + alt 或 ⌘ 可以恢復播放"
      outlined
      type="textarea"
      @keydown.space.stop
      @focus="editingSubtitle = true"
      @blur="onBlur"
      @keydown.meta.enter="textInput?.blur()"
      @keydown.alt.enter="textInput?.blur()"
      ref="textInput"
    />
  </div>
</template>

<script setup lang="ts">
import { defineModel, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project';
import { QInput } from 'quasar';

const model = defineModel<Subtitle>({ default: {} });
const projectStore = useProjectStore();
const { editingSubtitle } = storeToRefs(projectStore);
const textInput = ref<QInput | null>();

const onBlur = (event: Event) => {
  if (window.document.activeElement != event.target) {
    editingSubtitle.value = false;
  }
};

const focusOnEditorIfNeeded = (event: KeyboardEvent) => {
  if (event.code === 'Enter' && !event.metaKey && !event.altKey) {
    textInput.value?.focus();
    event.stopPropagation();
    event.preventDefault();
  }
};

onMounted(() => {
  window.addEventListener('keydown', focusOnEditorIfNeeded);
});

onUnmounted(() => {
  window.removeEventListener('keydown', focusOnEditorIfNeeded);
});
</script>

<style scoped></style>
