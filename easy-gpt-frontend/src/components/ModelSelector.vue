<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: String,
  activeModels: Object
});

const emit = defineEmits(['update:modelValue', 'update:activeModels']);

const toggleModel = (model) => {
  emit('update:activeModels', { model, value: !props.activeModels[model] });
};

const switchConversation = (model) => {
  emit('update:modelValue', model);
};
</script>

<template>
  <div class="model-buttons">
    <div
      v-for="model in Object.keys(activeModels)"
      :key="model"
      class="model-button-wrapper"
    >
      <button
        @click="switchConversation(model)"
        :class="{ disabled: !activeModels[model], active: modelValue === model }"
        class="model-button"
      >
        {{ model }}
      </button>
      <input
        type="checkbox"
        :checked="activeModels[model]"
        @change="toggleModel(model)"
        class="model-toggle"
      />
    </div>
  </div>
</template>

<style scoped>
.model-buttons {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: var(--button-background);
  justify-content: center;
}

.model-button-wrapper {
  display: flex;
  align-items: center;
}

.model-button {
  padding: 5px 10px;
  background-color: var(--button-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: darkgray;
  margin-right: 5px;
  transition: background-color 0.3s, color 0.3s, text-decoration 0.3s;
}

.model-button.disabled {
  color: darkgray;
  text-decoration: line-through;
}

.model-button.active {
  background-color: var(--active-button-color);
  color: var(--active-text-color);
}

.model-toggle {
  cursor: pointer;
}
</style>