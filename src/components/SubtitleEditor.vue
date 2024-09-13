<template>
  <div>
    <q-input
      v-model="model.text"
      label="Edit Subtitle"
      outlined
      dense
      type="textarea"
    />
  </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';
import { Subtitle } from 'stores/subtitles';

const model = defineModel<Subtitle>({ default: {} });
</script>

<style scoped></style>
