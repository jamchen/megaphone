<template>
  <div>
    <q-input
      v-model="model.text"
      label="Edit Subtitle"
      outlined
      type="textarea"
      @keydown.space.stop
      @focus="editingSubtitle = true"
      @blur="editingSubtitle = false"
      @keydown.meta.enter="textInput?.blur()"
      ref="textInput"
    />
  </div>
</template>

<script setup lang="ts">
import { defineModel, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project';
import { QInput } from 'quasar';

const model = defineModel<Subtitle>({ default: {} });
const projectStore = useProjectStore();
const { editingSubtitle } = storeToRefs(projectStore);
const textInput = ref<QInput | null>();
</script>

<style scoped></style>
