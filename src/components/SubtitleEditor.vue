<template>
  <div>
    <q-input
      v-model="model.text"
      label="Edit Subtitle"
      outlined
      type="textarea"
      @keydown.space.stop
    />
  </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';

const model = defineModel<Subtitle>({ default: {} });
</script>

<style scoped></style>
